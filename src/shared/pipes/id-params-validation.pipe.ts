import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  ValidationPipe,
} from '@nestjs/common';
import { ErrorCodesEnum } from '../enums/error-codes.enum';

@Injectable()
export class IdParamsValidationPipe
  extends ValidationPipe
  implements PipeTransform
{
  transform(value: string, metadata: ArgumentMetadata): any {
    if (metadata.type === 'param') {
      if (metadata.data === 'id' || metadata.data.includes('Id')) {
        const uuidV4Pattern =
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (!uuidV4Pattern.test(value)) {
          throw new BadRequestException({
            statusCode: 400,
            message: ErrorCodesEnum.NotIdParameter + metadata.data,
          });
        }
      }
    }

    return value;
  }
}
