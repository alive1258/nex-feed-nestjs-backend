import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { UsersService } from 'src/modules/users/users.service';
import { MailService } from 'src/modules/mail/mail.service';
import { UserOTPDto } from '../dto/user-otp.dto';
import { OTP } from 'src/modules/mail/entities/mail.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class VerifyOTPProvider {
  private readonly OTP_TTL_ERROR = 'OTP has expired. Please request again.';
  private readonly OTP_INVALID_ERROR = 'Invalid code passed. Check your inbox.';
  private readonly USER_NOT_FOUND_ERROR = 'User not found.';
  private readonly ACCOUNT_VERIFIED_ERROR =
    "Account record doesn't exist or has been verified already.";

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,

    private readonly generateTokensProvider: GenerateTokensProvider,

    private readonly mailService: MailService,
  ) {}

  public async verifyOTP(userOTPDto: UserOTPDto) {
    const { user_id, otp_code } = userOTPDto;

    if (!user_id || !otp_code) {
      throw new BadRequestException(
        'Authentication failed. User ID or OTP code is missing.',
      );
    }

    //  Find user
    const user: User | null = await this.usersService.findOneById(user_id);
    if (!user) {
      throw new NotFoundException(this.USER_NOT_FOUND_ERROR);
    }

    //  Get latest OTP
    const otpRecords: OTP[] = await this.mailService.findOtpsByUser(user_id);

    if (!otpRecords.length) {
      throw new NotFoundException(this.ACCOUNT_VERIFIED_ERROR);
    }

    const { expire_at, otp_code: hashedOTP } = otpRecords[0];

    //  Check expiry
    if (expire_at.getTime() < Date.now()) {
      throw new BadRequestException(this.OTP_TTL_ERROR);
    }

    //  Validate OTP
    const isValid = await bcrypt.compare(otp_code, hashedOTP);
    if (!isValid) {
      throw new BadRequestException(this.OTP_INVALID_ERROR);
    }

    // Mark verified
    void this.usersService.update(user.id, { is_verified: true });

    //  Send welcome email
    const tempPassword = 'GENERATED_TEMP_PASSWORD'; // wherever you create it

    await this.mailService.sendWelcomeMail(user, tempPassword);

    // 7️⃣ Generate tokens
    const tokens = await this.generateTokensProvider.generateTokens(user);
    return {
      ...tokens,
    };
  }
}
