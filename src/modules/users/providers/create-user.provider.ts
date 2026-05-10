import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { DataSource, QueryFailedError } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { MailService } from 'src/modules/mail/mail.service';

@Injectable()
export class CreateUserProvider {
  constructor(
    @Inject(HashingProvider)
    private readonly hashingProvider: HashingProvider,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new user and sends OTP for verification.
   */
  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await this.hashingProvider.hashPassword(
        createUserDto.password,
      );

      const newUser = queryRunner.manager.create(User, {
        ...createUserDto,
        password: hashedPassword,
        //  is_verified: true,
      });

      const savedUser = await queryRunner.manager.save(newUser);

      // Send OTP (same transaction)
      await this.mailService.sendOtp(savedUser, queryRunner.manager);

      await queryRunner.commitTransaction();
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Unique constraint (PostgreSQL)
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };

        if (driverError.code === '23505') {
          throw new BadRequestException('Email already exists.');
        }
      }

      console.error('Create user transaction failed:', error);
      throw new InternalServerErrorException(
        'Unable to create user at this time.',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
