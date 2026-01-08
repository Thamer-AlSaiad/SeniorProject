import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AdminRepository } from '../../../repos/repositories/admin.repository';
import { JwtPayload, RequestUser, UserType, AccountStatus } from '../../../common/types';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly adminRepository: AdminRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    if (payload.userType !== UserType.ADMIN) {
      throw new UnauthorizedException('Invalid token type');
    }

    const admin = await this.adminRepository.findById(payload.sub);
    if (!admin || !admin.isEmailVerified || admin.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      userId: admin.id,
      email: admin.email,
      userType: UserType.ADMIN,
    };
  }
}
