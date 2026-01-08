import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PatientAuthService } from '../../../core/services/auth/patient-auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerificationDto } from '../dto/resend-verification.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ApiResponse } from '../../../common/types';

@Controller('patient/auth')
export class PatientAuthController {
  constructor(private readonly authService: PatientAuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<ApiResponse> {
    const result = await this.authService.register(dto);
    return {
      success: true,
      message: result.message,
      data: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<ApiResponse> {
    const result = await this.authService.login(dto.email, dto.password);
    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
        },
      },
    };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<ApiResponse> {
    const result = await this.authService.verifyEmail(dto.token);
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto): Promise<ApiResponse> {
    const result = await this.authService.resendVerificationEmail(dto.email);
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<ApiResponse> {
    const result = await this.authService.forgotPassword(dto.email);
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<ApiResponse> {
    const result = await this.authService.resetPassword(dto.token, dto.newPassword);
    return {
      success: true,
      message: result.message,
    };
  }
}
