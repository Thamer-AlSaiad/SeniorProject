import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminRepository } from '../../../repos/repositories/admin.repository';
import { VerificationTokenRepository } from '../../../repos/repositories/verification-token.repository';
import { EmailService } from '../email/email.service';
import { BaseAuthService } from './base-auth.service';
import { AdminEntity } from '../../../repos/entities/admin.entity';
import { UserType } from '../../../common/types';

@Injectable()
export class AdminAuthService extends BaseAuthService<AdminEntity> {
  protected userType = UserType.ADMIN;

  constructor(
    repository: AdminRepository,
    tokenRepository: VerificationTokenRepository,
    emailService: EmailService,
    jwtService: JwtService,
    configService: ConfigService,
  ) {
    super(repository, tokenRepository, emailService, jwtService, configService);
  }
}
