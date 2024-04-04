import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { IFileValue } from '../types/file-value.interface';
import { FileTypesEnum } from '../enums/file-types.enum';
import { ErrorCodesEnum } from '../enums/error-codes.enum';
import { Multer } from 'multer';

@Injectable()
export class FilesValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    if (metadata.type !== 'custom' || !this.isFile(value)) {
      return value;
    }

    if (value.fieldname === FileTypesEnum.Avatar) {
      const MBytes = 5;
      if (value.size > MBytes * 1024 * 1024) {
        throw new BadRequestException({
          statusCode: 400,
          message: `${ErrorCodesEnum.InvalidFileSize}${MBytes} MBytes`,
        });
      }
      if (value.mimetype.split('/')[0] !== 'image') {
        throw new BadRequestException({
          statusCode: 400,
          message: ErrorCodesEnum.InvalidFileType + 'image (png, jpg)',
        });
      }

      return value;
    }

    if (value.fieldname === FileTypesEnum.TestImage) {
      return value;
    }

    throw new BadRequestException({
      statusCode: 400,
      message: ErrorCodesEnum.UnknownFileType,
    });
  }

  private isFile(value: Express.Multer.File) {
    return value &&
      value.fieldname &&
      value.originalname &&
      value.mimetype &&
      value.buffer &&
      value.size
      ? value
      : false;
  }
}
