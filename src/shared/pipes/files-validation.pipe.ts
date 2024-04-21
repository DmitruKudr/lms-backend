import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { FileTypesEnum } from '../enums/file-types.enum';
import { ErrorCodesEnum } from '../enums/error-codes.enum';
import { Multer } from 'multer';

@Injectable()
export class FilesValidationPipe implements PipeTransform {
  transform(
    value:
      | Express.Multer.File
      | { [key in FileTypesEnum]?: Express.Multer.File[] },
    metadata: ArgumentMetadata,
  ) {
    if (metadata.type !== 'custom') {
      return value;
    }

    const file = this.isFile(value);
    if (file) {
      switch (file.fieldname) {
        case FileTypesEnum.Avatar: {
          return this.validateImage(file, 5);
        }

        default: {
          throw new BadRequestException({
            statusCode: 400,
            message: ErrorCodesEnum.UnknownFileFormat + file.originalname,
          });
        }
      }
    }

    const fileList = this.isFileList(value);
    if (fileList) {
      // Object.entries(fileList).forEach(([fileType, files]) => {
      //   files.forEach((file) => {
      //     if (file.mimetype.split('/')[0] !== files[0].mimetype.split('/')[0]) {
      //       throw new BadRequestException({
      //         statusCode: 400,
      //         message: ErrorCodesEnum.SameFileFormat + fileType,
      //       });
      //     }
      //   });
      // });

      Object.values(fileList).forEach((files) => {
        files.forEach((file) => {
          switch (file.fieldname) {
            case FileTypesEnum.TestFile: {
              this.validateImage(file, 3);
              break;
            }

            case FileTypesEnum.TestItemFiles: {
              this.validateImage(file, 2);
              break;
            }

            case FileTypesEnum.TestItemOptionFiles: {
              this.validateImage(file, 1);
              break;
            }

            default: {
              throw new BadRequestException({
                statusCode: 400,
                message: ErrorCodesEnum.UnknownFileFormat + file.originalname,
              });
            }
          }
        });
      });

      return fileList;
    }

    return value;
  }

  private isFile(value: any) {
    return value &&
      typeof value === 'object' &&
      value.fieldname &&
      value.originalname &&
      value.mimetype &&
      value.buffer &&
      value.size
      ? (value as Express.Multer.File)
      : false;
  }

  private isFileList(value: any) {
    if (value === null || typeof value !== 'object') {
      return false;
    }

    for (const key in value) {
      if (!Object.values(FileTypesEnum).includes(key as FileTypesEnum)) {
        return false;
      }
      if (!Array.isArray(value[key])) {
        return false;
      }
      if (value[key].length > 50) {
        return false;
      }
      for (const item of value[key]) {
        if (!this.isFile(item)) {
          return false;
        }
      }
    }

    return value as { [key in FileTypesEnum]?: Express.Multer.File[] };
  }

  private validateImage(file: Express.Multer.File, maxMBytes?: number) {
    if (file.mimetype.split('/')[0] !== 'image') {
      throw new BadRequestException({
        statusCode: 400,
        message:
          ErrorCodesEnum.InvalidFileFormat +
          `${file.originalname} must be image (png or jpg)`,
      });
    }
    if (maxMBytes && file.size > maxMBytes * 1024 * 1024) {
      throw new BadRequestException({
        statusCode: 400,
        message:
          ErrorCodesEnum.InvalidFileSize +
          `${file.originalname} size must be less than ${maxMBytes} MBytes`,
      });
    }

    return file;
  }
}
