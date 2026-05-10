import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ApiDoc } from './decorators/swagger.decorator';
import {
  AuthResponse,
  OtpResponse,
  TokenResponse,
  VerifyOtpResponse,
} from './response';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { SignInDto } from './dto/signin.dto';
import { UserOTPDto } from './dto/user-otp.dto';
import type { Request } from 'express';
import { JwtOrApiKeyGuard } from './guards/jwt-or-api-key.guard';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    /**
     * inject auth service
     */
    private readonly authService: AuthService,
  ) {}

  @ApiDoc({
    summary: 'User Sign-In',
    description:
      'Handles user sign-in with email and password. Sets refresh token as HTTP-only cookie.',
    response: AuthResponse,
    status: HttpStatus.OK,
  })
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async SignIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto);
  }

  /**
   * Get me controller
   */
  @UseGuards(JwtOrApiKeyGuard)
  @Get('get-me')
  @ApiDoc({
    summary: 'User Logout',
    description: 'Signs out user by invalidating their refresh token.',
    status: HttpStatus.OK,
  })
  getMe(@Req() req: Request) {
    return this.authService.getMe(req);
  }

  @UseGuards(JwtOrApiKeyGuard)
  @Get('verify')
  @ApiDoc({
    summary: 'Verify user',
    description: 'Verify user and return role info',
    status: HttpStatus.OK,
  })
  async verify(@Req() req: any) {
    // req.user is usually injected by JwtGuard or ApiKeyGuard
    // assuming user has a "role" field
    if (!req.user) {
      return {
        apiVersion: '0.1.1',
        success: false,
        message: 'User not authenticated',
        status: HttpStatus.UNAUTHORIZED,
        data: null,
      };
    }

    return {
      apiVersion: '0.1.1',
      success: true,
      message: 'User verified',
      status: HttpStatus.OK,
      data: {
        verified: true,
        role: req.user.role, // 'super_admin', 'admin', etc.
      },
    };
  }

  /**
   * Resend OTP
   */
  @ApiDoc({
    summary: 'Resend OTP',
    description: 'Resends a one-time password to the specified email address.',
    response: OtpResponse,
    status: HttpStatus.OK,
  })
  @Post('resend-otp')
  // @Throttle({ default: { limit: 5, ttl: 60 * 60 } }) // 5 attempts per  hours
  @Auth(AuthType.None)
  public resendOTP(@Body() dto: ResendOtpDto) {
    return this.authService.resendOTP(dto.email);
  }

  // refresh-token
  @ApiDoc({
    summary: 'Token Refresh',
    description:
      'Generates new access and refresh tokens using existing refresh token.',
    response: TokenResponse,
    status: HttpStatus.OK,
  })
  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async refreshTokens(@Req() req: Request) {
    //get refresh token form cookies
    const refreshToken = req.cookies?.refreshToken as string;
    //sign in
    return await this.authService.refreshTokens(refreshToken);
  }

  /**
   * Verify OTP controller
   */
  @ApiDoc({
    summary: 'Verify OTP',
    description: 'Verifies the one-time password sent to the email address.',
    response: VerifyOtpResponse,
    status: HttpStatus.OK,
  })
  @Post('verify-otp')
  @Auth(AuthType.None)
  public verifyOTP(@Body() userOTPDto: UserOTPDto) {
    return this.authService.verifyOTP(userOTPDto);
  }

  @ApiDoc({
    summary: 'User Logout',
    description: 'Signs out user by invalidating their refresh token.',
    status: HttpStatus.OK,
  })
  @Post('sign-out')
  @UseGuards(JwtOrApiKeyGuard)
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.Bearer)
  public logOut() {
    // cookies are cleared in data interceptor. DataResponseInterceptor.
    return {
      message: 'Successfully signed out.',
    };
  }
}
