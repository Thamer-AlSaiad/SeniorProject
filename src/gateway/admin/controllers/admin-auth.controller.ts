import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminAuthService } from '../../../core/services/auth/admin-auth.service';
import { LoginDto } from '../dto/login.dto';
import { ApiResponse } from '../../../common/types';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

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
          name: result.user.name,
        },
      },
    };
  }
}
