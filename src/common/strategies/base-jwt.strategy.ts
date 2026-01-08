import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ObjectLiteral } from 'typeorm';
import { BaseRepository } from '../../repos/repositories/base.repository';
import { JwtPayload, RequestUser, UserType, AccountStatus } from '../types';

interface UserWithAuth extends ObjectLiteral {
  id: string;
  email: string;
  isEmailVerified: boolean;
  accountStatus: AccountStatus;
}

@Injectable()
export abstract class BaseJwtStrategy extends PassportStrategy(Strategy) {
  protected abstract userType: UserType;
  protected abstract repository: BaseRepository<UserWithAuth>;

  constructor(
    protected readonly configService: ConfigService,
    strategyName: string,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    if (payload.userType !== this.userType) {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.repository.findById(payload.sub);
    if (!user || !user.isEmailVerified || user.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      userId: user.id,
      email: user.email,
      userType: this.userType,
    };
  }
}
