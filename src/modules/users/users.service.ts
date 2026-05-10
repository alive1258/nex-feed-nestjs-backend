import { CreateUserProvider } from './providers/create-user.provider';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { DataQueryService } from 'src/common/data-query/data-query.service';
import { UpdateUserDto } from './dto/update-user.dto';
import profileConfig from './config/profile.config';
import * as config from '@nestjs/config';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { Request } from 'express';
import { GetUsersDto } from './dto/get-users.dto';
import { IPagination } from 'src/common/data-query/pagination.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @Inject(profileConfig.KEY)
    private readonly profileConfiguration: config.ConfigType<
      typeof profileConfig
    >,

    private readonly createUserProvider: CreateUserProvider,
    private readonly hashingProvider: HashingProvider,
    private readonly dataQueryService: DataQueryService,
  ) {}

  //Create New user
  public async createUser(createUserDto: CreateUserDto) {
    return await this.createUserProvider.createUser(createUserDto);
  }

  public async findAllUser(
    query: GetUsersDto,
  ): Promise<IPagination<Partial<User>>> {
    return this.dataQueryService.execute<Partial<User>>({
      repository: this.usersRepository,
      alias: 'user',
      pagination: query,

      // searchable fields updated
      searchableFields: ['email', 'first_name', 'last_name'],

      // select fields updated based on entity
      select: [
        'id',
        'first_name',
        'last_name',
        'email',
        'role',
        'is_verified',
        'token_version',
        'has_refresh_token',
        'created_at',
        'updated_at',
      ],
    });
  }

  public async findOneById(id: string) {
    let user = undefined as User | null | undefined;
    try {
      user = await this.usersRepository.findOneBy({
        id,
      });
    } catch (error) {
      throw new RequestTimeoutException(
        `We are currently ${error} experiencing a temporary issue processing your request. Please try again later.`,
        {
          description:
            'Error connecting to the Database. Please try again later',
        },
      );
    }
    // handle the user dose not exist
    if (!user) {
      throw new BadRequestException(`The User dose not exist.`);
    }
    return user;
  }

  public async findOneForResendOTP(id: string): Promise<User> {
    // Validate the ID
    if (!id) {
      throw new BadRequestException('You have to provide User ID.');
    }

    // Fetch user with valid relations
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'first_name', 'last_name', 'email', 'role'],
    });

    // Throw error if user not found
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  public async updateUserById(
    targetUserId: string,
    dto: UpdateUserDto,
    requesterId: string,
  ): Promise<User> {
    // 1️⃣ Fetch user
    const user = await this.usersRepository.findOne({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    //  Authorization (industry standard)
    const isOwner = user.id === requesterId;

    if (!isOwner) {
      throw new ForbiddenException('You are not allowed to update this user');
    }

    // Handle password securely
    if (dto.password) {
      user.password = await this.hashingProvider.hashPassword(dto.password);
      delete dto.password;
    }

    // Assign allowed fields only
    Object.assign(user, dto);

    // 5️⃣ Save and return
    return this.usersRepository.save(user);
  }

  // Update a user by ID.
  public async update(id: string, updateUserDto: UpdateUserDto) {
    // Validate the ID

    // Check if the user exists
    const existUser = await this.usersRepository.findOneBy({ id });

    if (!existUser) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    // updated password hashing
    if (updateUserDto?.password) {
      // If a new password is provided, hash it
      updateUserDto.password = await this.hashingProvider.hashPassword(
        updateUserDto.password,
      );
    }

    // Update the user properties
    Object.assign(existUser, updateUserDto);

    // Save and return the updated user
    return await this.usersRepository.save(existUser);
  }

  // Find a single user by email
  public async findOneByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    // Throw error if user not found
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    return user;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
