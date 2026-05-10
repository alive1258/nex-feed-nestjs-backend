import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ActiveUserData } from '../interface/active-user-data.interface';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  private readonly logger = new Logger(RefreshTokenGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    // this.logger.debug(`Cookies: ${JSON.stringify(request.cookies)}`);

    // this.logger.debug(`Request URL: ${request.url}, Method: ${request.method}`);
    // this.logger.debug(`RefreshToken Cookie: ${request.cookies?.refreshToken}`);

    // Call Passport to validate the refresh token
    return super.canActivate(context) as boolean;
  }

  handleRequest<TUser = ActiveUserData>(
    err: unknown,
    user: TUser | false | null,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err instanceof Error) {
      // this.logger.error(`Authentication error: ${err.message}`);
      throw new UnauthorizedException('Authentication error: ' + err.message);
    }

    if (!user) {
      // this.logger.warn('Invalid refresh token attempt');
      throw new UnauthorizedException('Invalid refresh token');
    }
    // this.logger.log('Refresh token authentication successful');
    return user;
  }
}
