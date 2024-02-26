import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { PayloadAccessDto } from '../app/security/dtos/payload-access.dto';

// export const CurrentUser = createParamDecorator(
//   (data: (keyof User)[], context: ExecutionContext) => {
//     const request = context.switchToHttp().getRequest();
//     const user = request.user;
//
//     return !data || data.length === 0
//       ? user
//       : data.reduce((userData, key) => {
//           if (key in user) {
//             userData[key as string] = user[key];
//           }
//
//           return userData;
//         }, {} as Record<string, any>);
//   },
// );

export const CurrentUser = createParamDecorator((context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.user as PayloadAccessDto;
});
