import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserResponseDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiDoc } from 'src/auth/decorators/swagger.decorator';
import { GetUsersDto } from './dto/get-users.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { Permission } from 'src/auth/enums/permission-type.enum';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiDoc({
    summary: 'Create a new user',
    description:
      'Creates a new user and returns the user data without sensitive fields.',
    response: UserResponseDto,
    status: HttpStatus.OK,
  })
  @Post('sign-up')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @ApiDoc({
    summary: 'Get all users',
    description: 'Retrieves all users. Returns total count and user list.',
    response: UserResponseDto,
    status: HttpStatus.OK,
  })
  @RequirePermissions(Permission.USER_READ)
  @UseGuards(JwtOrApiKeyGuard, PermissionsGuard)
  @Get()
  async findAllUser(@Query() getUsersDto: GetUsersDto) {
    // Pass both request and DTO to service
    return this.usersService.findAllUser(getUsersDto);
  }

  @ApiDoc({
    summary: 'Get user by ID',
    description: 'Retrieves a user by their unique ID.',
    response: UserResponseDto,
    status: HttpStatus.OK,
  })
  @Get(':id')
  async getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findOneById(id);
  }

  @ApiDoc({
    summary: 'Update user',
    description: 'Updates user information by ID',
    response: UserResponseDto,
    status: HttpStatus.OK,
  })
  @UseGuards(AuthGuard('jwt'))
  // @RequirePermissions(Permission.USER_UPDATE)
  // @UseGuards(JwtOrApiKeyGuard, RolesGuard, PermissionsGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request & { user: { id: string; role: string } },
  ) {
    return this.usersService.updateUserById(id, dto, req.user.id);
  }
}
