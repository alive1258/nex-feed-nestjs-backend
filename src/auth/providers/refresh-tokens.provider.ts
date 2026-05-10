// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { GenerateTokensProvider } from './generate-tokens.provider';

// @Injectable()
// export class RefreshTokensProvider {
//   constructor(
//     private readonly generateTokensProvider: GenerateTokensProvider,
//   ) {}

//   public async refreshTokens(refreshToken: string) {
//     try {
//       //  Validate refresh token & get user
//       const userFromToken =
//         await this.generateTokensProvider.verifyRefreshToken(refreshToken);
//       // 1. get user info for by user_id
//       // 2. check refreshtoken exisit by user dta

//       // Issue new tokens (rotation)
//       return this.generateTokensProvider.generateTokens(userFromToken);
//     } catch {
//       throw new UnauthorizedException('Refresh token invalid');
//     }
//   }
// }

// Why this approach is best practice

// Refresh Token Rotation → Each refresh generates a new token.

// Hashed Tokens in DB → Secure storage (like passwords).

// Token Versioning → Old tokens are invalidated on logout or admin reset.

// Supports Admin Logout → revokeAllUserTokens safely invalidates all sessions.

// Consistent error handling → UnauthorizedException thrown for invalid tokens.

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokensProvider {
  constructor(
    private readonly generateTokensProvider: GenerateTokensProvider,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  public async refreshTokens(refreshToken: string) {
    try {
      // Step 1: Verify refresh token JWT & payload
      const userFromToken =
        await this.generateTokensProvider.verifyRefreshToken(refreshToken);

      // Step 2: Fetch user from DB
      const user = await this.userRepo.findOne({
        where: { id: userFromToken.id },
      });

      if (!user) {
        throw new UnauthorizedException('User does not exist');
      }

      // Step 3: Ensure refresh token exists & matches stored hashed token
      if (!user.has_refresh_token || !user.remember_token) {
        throw new UnauthorizedException('Refresh token revoked');
      }

      const isValid = await bcrypt.compare(refreshToken, user.remember_token);
      if (!isValid) {
        throw new UnauthorizedException('Refresh token invalid');
      }

      // Step 4: Issue new tokens (rotation)
      const result = await this.generateTokensProvider.generateTokens(user);
      return {
        ...result,
        // user: {
        //   id: user.id,
        //   name: user.name,
        //   email: user.email,
        //   role: user.role,
        // },
      };
    } catch {
      throw new UnauthorizedException('Refresh token invalid');
    }
  }
}
