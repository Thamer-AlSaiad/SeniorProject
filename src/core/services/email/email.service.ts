import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { UserType } from '../../../common/types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const smtpConfig = this.configService.get('email.smtp');
    if (!smtpConfig) {
      throw new Error('Email SMTP configuration is missing');
    }
    this.transporter = nodemailer.createTransport(smtpConfig);
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? '';
    if (!this.frontendUrl) {
      throw new Error('FRONTEND_URL is required');
    }
  }

  async sendVerificationEmail(email: string, token: string, userType: UserType): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('email.from'),
      to: email,
      subject: `Verify Your Email - EMR ${userType.charAt(0).toUpperCase() + userType.slice(1)} Portal`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to EMR System!</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>Or copy this link: ${verificationUrl}</p>
          <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string, userType: UserType): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('email.from'),
      to: email,
      subject: 'Reset Your Password - EMR System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2196F3; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy this link: ${resetUrl}</p>
          <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
        </div>
      `,
    });
  }
}
