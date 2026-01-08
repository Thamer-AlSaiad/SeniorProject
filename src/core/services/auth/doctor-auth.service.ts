import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DoctorRepository } from '../../../repos/repositories/doctor.repository';
import { VerificationTokenRepository } from '../../../repos/repositories/verification-token.repository';
import { EmailService } from '../email/email.service';
import { BaseAuthService } from './base-auth.service';
import { DoctorEntity } from '../../../repos/entities/doctor.entity';
import { UserType } from '../../../common/types';

@Injectable()
export class DoctorAuthService extends BaseAuthService<DoctorEntity> {
  protected userType = UserType.DOCTOR;

  constructor(
    repository: DoctorRepository,
    tokenRepository: VerificationTokenRepository,
    emailService: EmailService,
    jwtService: JwtService,
    configService: ConfigService,
  ) {
    super(repository, tokenRepository, emailService, jwtService, configService);
  }
}
