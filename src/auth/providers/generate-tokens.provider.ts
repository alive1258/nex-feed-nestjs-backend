import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/modules/users/entities/user.entity';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenPayload {
  sub: string;
  token_version: number;
}

@Injectable()
export class GenerateTokensProvider {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwt: ConfigType<typeof jwtConfig>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /* ---------------- PRIVATE ---------------- */

  private signAccessToken(payload: object): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.jwt.accessSecret,
      expiresIn: this.jwt.accessTokenTlt,
      issuer: this.jwt.issuer,
      audience: this.jwt.audience,
    });
  }

  private signRefreshToken(payload: object): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.jwt.refreshSecret,
      expiresIn: this.jwt.refreshTokenTlt,
      issuer: this.jwt.issuer,
      audience: this.jwt.audience,
    });
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashed = await bcrypt.hash(refreshToken, 10);

    await this.userRepo.update(userId, {
      remember_token: hashed,
      has_refresh_token: true,
    });
  }

  /* ---------------- PUBLIC ---------------- */

  async generateTokens(user: User): Promise<TokenResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      token_version: user.token_version,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(payload),
      this.signRefreshToken(payload),
    ]);

    await this.storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(refreshToken: string): Promise<User> {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.jwt.refreshSecret,
          issuer: this.jwt.issuer,
          audience: this.jwt.audience,
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.has_refresh_token || !user.remember_token) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const isValid = await bcrypt.compare(refreshToken, user.remember_token);

    if (!isValid || user.token_version !== payload.token_version) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    return user;
  }

  // async revokeAllUserTokens(userId: string): Promise<void> {
  //   await this.userRepo.update(userId, {
  //     remember_token: null,
  //     has_refresh_token: false,
  //     token_version: () => 'token_version + 1',
  //   });
  // }
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.userRepo.update(userId, {
      remember_token: () => 'NULL',
      has_refresh_token: false,
      token_version: () => 'token_version + 1',
    });
  }
}
