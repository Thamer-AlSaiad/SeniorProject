import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { DoctorAuthService } from '../../../core/services/auth/doctor-auth.service';
import { LoginDto } from '../dto/login.dto';
import { ApiResponse } from '../../../common/types';

@Controller('doctor/auth')
export class DoctorAuthController {
  constructor(private readonly authService: DoctorAuthService) {}

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
          specialization: result.user.specialization,
        },
      },
    };
  }
}
