import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UnauthorizedException } from '@nestjs/common';
import { DoctorRepository } from '../../../repos/repositories/doctor.repository';
import { DoctorOrganizationRepository } from '../../../repos/repositories/doctor-organization.repository';
import { JwtPayload, RequestUser, UserType, AccountStatus } from '../../../common/types';

@Injectable()
export class DoctorJwtStrategy extends PassportStrategy(Strategy, 'doctor-jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly doctorRepository: DoctorRepository,
    private readonly doctorOrganizationRepository: DoctorOrganizationRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    if (payload.userType !== UserType.DOCTOR) {
      throw new UnauthorizedException('Invalid token type');
    }

    const doctor = await this.doctorRepository.findById(payload.sub);
    if (!doctor || !doctor.isEmailVerified || doctor.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Unauthorized');
    }

    // Get doctor's primary organization
    let organizationId: string | undefined;
    const associations = await this.doctorOrganizationRepository.findByDoctor(doctor.id);
    if (associations.length > 0) {
      // Prefer primary organization, otherwise use first one
      const primary = associations.find(a => a.isPrimary);
      organizationId = primary?.organizationId || associations[0].organizationId;
    }

    return {
      userId: doctor.id,
      email: doctor.email,
      userType: UserType.DOCTOR,
      organizationId,
    };
  }
}
