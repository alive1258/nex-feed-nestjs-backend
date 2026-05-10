import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DataSource } from 'typeorm';
import { RoleBasedPermissions } from 'src/config/roles.config';
import { Role } from 'src/auth/enums/role-type.enum';
import { Permission } from 'src/auth/enums/permission-type.enum';
import { ActiveUserData } from '../interface/active-user-data.interface';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: string;
    email?: string;
    role?: Role;
  }): Promise<ActiveUserData> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Fetch user from database using TypeORM
    const userRepository = this.dataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: payload?.sub },
      select: ['id', 'email', 'role'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Get permissions based on role
    const permissions: Permission[] =
      RoleBasedPermissions[user.role as Role] || [];

    return {
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      permissions,
    };
  }
}
