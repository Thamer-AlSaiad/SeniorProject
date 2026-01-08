import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { BaseRepository } from '../../../repos/repositories/base.repository';
import { VerificationTokenRepository } from '../../../repos/repositories/verification-token.repository';
import { EmailService } from '../email/email.service';
import { JwtPayload, UserType, TokenType, AccountStatus } from '../../../common/types';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

@Injectable()
export abstract class BaseAuthService<
  T extends {
    id: string;
    email: string;
    passwordHash: string;
    isEmailVerified: boolean;
    accountStatus: AccountStatus;
  },
> {
  protected abstract userType: UserType;
  protected readonly logger = new Logger(BaseAuthService.name);

  constructor(
    protected readonly repository: BaseRepository<T>,
    protected readonly tokenRepository: VerificationTokenRepository,
    protected readonly emailService: EmailService,
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
  ) {}

  async register(data: RegisterData): Promise<{ user: T; message: string }> {
    if (await this.repository.exists(data.email)) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    
    const user = await this.repository.create({
      ...data,
      passwordHash,
      accountStatus: AccountStatus.INACTIVE,
      isEmailVerified: false,
    } as any);

    await this.generateVerificationToken(user.id, user.email);

    return {
      user,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: T }> {
    const user = await this.repository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    await (this.repository as any).updateLastLogin(user.id);
    const tokens = await this.generateTokens(user);

    return { ...tokens, user };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const verificationToken = await this.tokenRepository.findValidToken(
      this.hashToken(token),
      TokenType.EMAIL_VERIFICATION,
    );

    if (!verificationToken || verificationToken.userType !== this.userType) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    if (verificationToken.isUsed) {
      throw new BadRequestException('Verification token has already been used');
    }

    await (this.repository as any).verifyEmail(verificationToken.userId);
    await this.tokenRepository.markAsUsed(verificationToken.id);

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.tokenRepository.deleteByUser(user.id, TokenType.EMAIL_VERIFICATION, this.userType);
    await this.generateVerificationToken(user.id, user.email);

    return { message: 'Verification email sent successfully' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    await this.tokenRepository.deleteByUser(user.id, TokenType.PASSWORD_RESET, this.userType);
    await this.generatePasswordResetToken(user.id, user.email);

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const resetToken = await this.tokenRepository.findValidToken(
      this.hashToken(token),
      TokenType.PASSWORD_RESET,
    );

    if (!resetToken || resetToken.userType !== this.userType) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    if (resetToken.isUsed) {
      throw new BadRequestException('Reset token has already been used');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await (this.repository as any).updatePassword(resetToken.userId, passwordHash);
    await this.tokenRepository.markAsUsed(resetToken.id);

    return { message: 'Password reset successfully' };
  }

  protected async generateTokens(user: T): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      userType: this.userType,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  protected async generateVerificationToken(userId: string, email: string): Promise<void> {
    const rawToken = this.generateRandomToken();
    const hashedToken = this.hashToken(rawToken);
    const expiresIn = this.configService.get<string>('email.verificationTokenExpiresIn')!;
    const expiresAt = this.calculateExpiration(expiresIn);

    await this.tokenRepository.create({
      userId,
      userType: this.userType,
      token: hashedToken,
      type: TokenType.EMAIL_VERIFICATION,
      expiresAt,
    });

    try {
      await this.emailService.sendVerificationEmail(email, rawToken, this.userType);
    } catch (error: any) {
      this.logger.error(
        `Failed to send verification email to ${email}`,
        error.stack || error.message,
      );
    }
  }

  protected async generatePasswordResetToken(userId: string, email: string): Promise<void> {
    const rawToken = this.generateRandomToken();
    const hashedToken = this.hashToken(rawToken);
    const expiresIn = this.configService.get<string>('email.passwordResetTokenExpiresIn')!;
    const expiresAt = this.calculateExpiration(expiresIn);

    await this.tokenRepository.create({
      userId,
      userType: this.userType,
      token: hashedToken,
      type: TokenType.PASSWORD_RESET,
      expiresAt,
    });

    try {
      await this.emailService.sendPasswordResetEmail(email, rawToken, this.userType);
    } catch (error: any) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error.stack || error.message,
      );
    }
  }

  protected generateRandomToken(): string {
    return randomBytes(32).toString('hex');
  }

  protected hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  protected calculateExpiration(duration: string): Date {
    const now = new Date();
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error('Invalid duration format');

    const value = parseInt(match[1], 10);
    const unit = match[2] as 's' | 'm' | 'h' | 'd';
    const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };

    return new Date(now.getTime() + value * multipliers[unit]);
  }
}
