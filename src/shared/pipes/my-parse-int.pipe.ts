import {
  ArgumentMetadata,
  Injectable,
  ParseIntPipe,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class MyParseIntPipe
  extends ParseIntPipe
  implements PipeTransform<number>
{
  transform(value: any, metadata: ArgumentMetadata) {
    try {
      return super.transform(value, metadata);
    } catch {
      return undefined;
    }
  }
}
