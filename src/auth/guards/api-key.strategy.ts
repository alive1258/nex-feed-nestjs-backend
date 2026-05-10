import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor() {
    super(
      { header: 'x-api-key', prefix: '' },
      false, // passReqToCallback = false (recommended)
    );
  }

  // NestJS will automatically call this
  validate(apiKey: string) {
    const validApiKey = process.env.APP_API_KEY;

    if (!validApiKey) {
      throw new UnauthorizedException('API key is not configured');
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Returned value becomes req.user
    return {
      id: 'api-key-client',
      type: 'x-api-key',
      roles: ['SUPER_ADMIN'],
      permissions: ['*'],
    };
  }
}
