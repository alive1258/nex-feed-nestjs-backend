// import {
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { Observable } from 'rxjs';
// import { Request } from 'express';
// import { ActiveUserData } from '../interface/active-user-data.interface';

// @Injectable()
// export class JwtOrApiKeyGuard extends AuthGuard(['jwt', 'api-key']) {
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const request = context.switchToHttp().getRequest<Request>();

//     const authHeader = request.headers.authorization;
//     const hasJwtToken =
//       typeof authHeader === 'string' && authHeader.startsWith('Bearer ');


//     if (!hasJwtToken ) {
//       throw new UnauthorizedException(
//         'No authentication token or API key provided',
//       );
//     }

//     return super.canActivate(context);
//   }

//   //  Signature MUST match Passport
//   handleRequest<TUser = ActiveUserData>(
//     err: unknown,
//     user: TUser | false | null,
//     _info: unknown,
//     _context: ExecutionContext,
//     _status?: unknown,
//   ): TUser {
//     if (err instanceof Error) {
//       throw err;
//     }

//     if (!user) {
//       throw new UnauthorizedException(
//         'Invalid or missing authentication credentials',
//       );
//     }

//     return user;
//   }
// }

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtOrApiKeyGuard
  extends AuthGuard('jwt')
  implements CanActivate
{
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    /* ---------- JWT COOKIE ---------- */
    const token = request.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException(
        'JWT cookie missing',
      );
    }

    // Passport expects Authorization header
     request.headers.authorization = `Bearer ${token}`;

    return (await super.canActivate(context)) as boolean;
  }
}

