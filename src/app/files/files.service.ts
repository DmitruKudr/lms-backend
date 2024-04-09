import { Injectable } from '@nestjs/common';
import { IFileValue } from '../../shared/types/file-value.interface';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor() {}

  public async tempSaveFile(file: IFileValue) {
    if (!file) {
      return undefined;
    }

    const fileName = `${uuidv4()}.${file.originalname}`;
    await fs.promises.writeFile(
      path.resolve(
        __dirname,
        '../../..',
        'src/temp-files',
        file.fieldname,
        fileName,
      ),
      file.buffer,
    );

    return fileName;
  }

  public async tempReplaceFile(newFile: IFileValue, oldFilePath: string) {
    if (!newFile) {
      return null;
    }

    if (oldFilePath) {
      await fs.promises.unlink(
        path.resolve(__dirname, '../../..', 'src/temp-files', oldFilePath),
      );
    }

    const newFileName = `${uuidv4()}.${newFile.originalname}`;
    await fs.promises.writeFile(
      path.resolve(
        __dirname,
        '../../..',
        'src/temp-files',
        newFile.fieldname,
        newFileName,
      ),
      newFile.buffer,
    );

    return newFileName;
  }

  public async tempDeleteFile(filePath: string) {
    if (filePath) {
      await fs.promises.unlink(
        path.resolve(__dirname, '../../..', 'src/temp-files', filePath),
      );
    }
  }
}
