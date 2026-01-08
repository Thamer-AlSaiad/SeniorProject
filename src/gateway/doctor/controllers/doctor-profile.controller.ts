import { Controller, Get, Put, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { DoctorProfileService } from '../../../core/services/profile/doctor-profile.service';
import { DoctorJwtGuard } from '../guards/doctor-jwt.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequestUser, ApiResponse } from '../../../common/types';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Controller('doctor/profile')
@UseGuards(DoctorJwtGuard)
export class DoctorProfileController {
  constructor(private readonly profileService: DoctorProfileService) {}

  @Get()
  async getProfile(@CurrentUser() user: RequestUser): Promise<ApiResponse> {
    const doctor = await this.profileService.getProfile(user.userId);
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: doctor,
    };
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<ApiResponse> {
    const doctor = await this.profileService.updateProfile(user.userId, dto);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: doctor,
    };
  }

  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: RequestUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<ApiResponse> {
    await this.profileService.changePassword(user.userId, dto.currentPassword, dto.newPassword);
    return {
      success: true,
      message: 'Password changed successfully',
    };
  }
}
