import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PatientRepository } from '../../../repos/repositories/patient.repository';
import { VerificationTokenRepository } from '../../../repos/repositories/verification-token.repository';
import { EmailService } from '../email/email.service';
import { BaseAuthService } from './base-auth.service';
import { PatientEntity } from '../../../repos/entities/patient.entity';
import { UserType } from '../../../common/types';

@Injectable()
export class PatientAuthService extends BaseAuthService<PatientEntity> {
  protected userType = UserType.PATIENT;

  constructor(
    repository: PatientRepository,
    tokenRepository: VerificationTokenRepository,
    emailService: EmailService,
    jwtService: JwtService,
    configService: ConfigService,
  ) {
    super(repository, tokenRepository, emailService, jwtService, configService);
  }
}
