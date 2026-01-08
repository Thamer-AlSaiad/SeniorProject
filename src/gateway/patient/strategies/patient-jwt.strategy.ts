import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UnauthorizedException } from '@nestjs/common';
import { PatientRepository } from '../../../repos/repositories/patient.repository';
import { JwtPayload, RequestUser, UserType, AccountStatus } from '../../../common/types';

@Injectable()
export class PatientJwtStrategy extends PassportStrategy(Strategy, 'patient-jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly patientRepository: PatientRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    if (payload.userType !== UserType.PATIENT) {
      throw new UnauthorizedException('Invalid token type');
    }

    const patient = await this.patientRepository.findById(payload.sub);
    if (!patient || !patient.isEmailVerified || patient.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Unauthorized');
    }

    return {
      userId: patient.id,
      email: patient.email,
      userType: UserType.PATIENT,
    };
  }
}
