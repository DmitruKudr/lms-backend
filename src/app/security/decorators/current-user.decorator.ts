import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { PayloadAccessDto } from '../dtos/payload-access.dto';
import { JwtService } from '@nestjs/jwt';
import * as process from 'process';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    if (user && Object.keys(user).length) {
      return request.user as PayloadAccessDto;
    }

    if (request.headers.authorization) {
      const jwtService = new JwtService();
      const token = request.headers.authorization.split(' ')[1];
      try {
        const data = jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
          // TODO remove ignoreExpiration
          ignoreExpiration: true,
        });
        return data as PayloadAccessDto;
      } catch {
        return undefined;
      }
    }

    return undefined;
  },
);
