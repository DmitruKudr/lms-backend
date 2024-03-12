import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  ValidationPipe,
} from '@nestjs/common';

@Injectable()
export class QueryParamsPipe extends ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (metadata.type === 'query') {
      try {
        return super.transform(value, metadata);
      } catch {
        return undefined;
      }
    }
  }
}
