import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig, emailConfig, jwtConfig } from './config';
import { CoreModule } from './core/core.module';
import { PatientModule } from './gateway/patient/patient.module';
import { DoctorModule } from './gateway/doctor/doctor.module';
import { AdminModule } from './gateway/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
      load: [jwtConfig, emailConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    CoreModule,
    PatientModule,
    DoctorModule,
    AdminModule,
  ],
})
export class AppModule {}
