import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { MailTransporter } from './providers/mailTransporter.provider';
import { Transporter } from 'nodemailer';
import { OTP } from './entities/mail.entity';
import { OtpTemplate } from './templates/otp-template';
import WelcomeEmailTemplate from './templates/welcome-user-email';

@Injectable()
export class MailService {
  private readonly OTP_TTL_MS = 2 * 60 * 1000; // 2 minutes
  private readonly OTP_MAX_ATTEMPTS = 5;
  private readonly OTP_BLOCK_HOURS = 1;

  // Company details constants
  private readonly COMPANY_NAME = 'FindrMeet';
  private readonly LOGIN_URL = 'https://findrmeet.com/login';
  private readonly SUPPORT_EMAIL = 'support@findrmeet.com';

  constructor(
    @InjectRepository(OTP)
    private readonly userOTPRepository: Repository<OTP>,

    private readonly mailTransporter: MailTransporter,
  ) {}

  /** ------------------- OTP ------------------- */

  public async sendOtp(
    user: User,
    entityManager?: EntityManager,
  ): Promise<OTP> {
    const manager = entityManager ?? this.userOTPRepository.manager;
    const otpCode = this.generateOtp();

    const hashedOTP = await bcrypt.hash(otpCode, 10);

    const otpEntity = manager.create(OTP, {
      added_by: user.id,
      otp_code: hashedOTP,
      attempt: 1,
      expire_at: new Date(Date.now() + this.OTP_TTL_MS),
    });

    try {
      await manager.save(OTP, otpEntity);
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not save OTP data',
      });
    }

    await this.sendEmail({
      to: user.email,
      subject: 'Verify Your OTP',
      html: OtpTemplate(otpCode),
    });

    return otpEntity;
  }

  public async resendOtp(user: User, expireTime: number) {
    const existingOtp = await this.userOTPRepository.findOne({
      where: { added_by: user.id },
    });

    if (!existingOtp) {
      throw new RequestTimeoutException(
        'No existing OTP found for this user.',
        {
          description: 'OTP not found',
        },
      );
    }

    const now = new Date();
    const hoursSinceLastAttempt =
      (now.getTime() - new Date(existingOtp.updated_at).getTime()) /
      (1000 * 3600);

    if (
      hoursSinceLastAttempt < this.OTP_BLOCK_HOURS &&
      existingOtp.attempt >= this.OTP_MAX_ATTEMPTS
    ) {
      throw new RequestTimeoutException(
        `You have exceeded the maximum OTP attempts. Please try again after ${this.OTP_BLOCK_HOURS} hours.`,
        { description: 'OTP attempt limit reached' },
      );
    }

    // Generate new OTP
    const otpCode = this.generateOtp();
    existingOtp.otp_code = await bcrypt.hash(otpCode, 10);
    existingOtp.expire_at = new Date(Date.now() + this.OTP_TTL_MS);
    existingOtp.attempt =
      hoursSinceLastAttempt >= this.OTP_BLOCK_HOURS
        ? 1
        : existingOtp.attempt + 1;
    existingOtp.updated_at = new Date();

    try {
      await this.userOTPRepository.save(existingOtp);
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not save OTP data',
      });
    }

    await this.sendEmail({
      to: user.email,
      subject: 'Verify Your OTP',
      html: OtpTemplate(otpCode),
    });

    return { id: user.id };
  }

  /** ------------------- Welcome ------------------- */

  public async sendWelcomeMail(user: User, setupUrl: string): Promise<void> {
    await this.sendEmail({
      to: user.email,
      subject: 'Welcome!',
      html: WelcomeEmailTemplate({
        email: user.email,
        password: 'Set your password using the link below',
        companyName: this.COMPANY_NAME,
        loginUrl: setupUrl,
        supportEmail: this.SUPPORT_EMAIL,
        userName: user.first_name ?? 'User',
      }),
    });
  }

  /** ------------------- Utility Methods ------------------- */

  private generateOtp(length = 6): string {
    return Math.floor(
      10 ** (length - 1) + Math.random() * 9 * 10 ** (length - 1),
    ).toString();
  }

  private async sendEmail({
    to,
    subject,
    html,
    from,
  }: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<void> {
    try {
      const transporter: Transporter = this.mailTransporter.createTransporter();
      await transporter.sendMail({
        from: from ? `no-reply@${from}` : 'support@findrmeet.com',
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Email send error:', error);
      throw new RequestTimeoutException(error, {
        description: "Can't send the email",
      });
    }
  }

  /** ------------------- Admin Utilities ------------------- */

  public async findOtpsByUser(userId: string): Promise<OTP[]> {
    return this.userOTPRepository.find({ where: { added_by: userId } });
  }
}
