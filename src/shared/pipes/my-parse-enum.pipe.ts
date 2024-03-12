import {
  ArgumentMetadata,
  Injectable,
  ParseEnumPipe,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class MyParseEnumPipe
  extends ParseEnumPipe
  implements PipeTransform<object>
{
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      console.log('hi try');
      return super.transform(value, metadata);
    } catch {
      console.log('hi catch');
      return undefined;
    }
  }
}
