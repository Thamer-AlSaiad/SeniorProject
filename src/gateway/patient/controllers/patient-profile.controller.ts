import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PatientProfileService } from '../../../core/services/profile/patient-profile.service';
import { PatientJwtGuard } from '../guards/patient-jwt.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RequestUser, ApiResponse } from '../../../common/types';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Controller('patient/profile')
@UseGuards(PatientJwtGuard)
export class PatientProfileController {
  constructor(private readonly profileService: PatientProfileService) {}

  @Get()
  async getProfile(@CurrentUser() user: RequestUser): Promise<ApiResponse> {
    const patient = await this.profileService.getProfile(user.userId);
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: patient,
    };
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<ApiResponse> {
    const updateData = {
      ...dto,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
    };

    const patient = await this.profileService.updateProfile(user.userId, updateData);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: patient,
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

  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@CurrentUser() user: RequestUser): Promise<ApiResponse> {
    await this.profileService.deleteAccount(user.userId);
    return {
      success: true,
      message: 'Account deleted successfully',
    };
  }
}
