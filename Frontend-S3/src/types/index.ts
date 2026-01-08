// Common Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User Types
export type UserRole = 'patient' | 'doctor' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  specialization?: string;
  licenseNumber?: string;
}

// Encounter Types
export enum EncounterStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum EncounterType {
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
  ROUTINE_CHECKUP = 'routine_checkup',
  PROCEDURE = 'procedure',
}

export interface Encounter {
  id: string;
  organizationId: string;
  patientId: string;
  doctorId: string;
  patient?: Patient;
  doctor?: UserProfile;
  encounterType: EncounterType;
  status: EncounterStatus;
  encounterDate: string;
  startTime?: string;
  endTime?: string;
  reasonForVisit?: string;
  chiefComplaint?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEncounterDto {
  patientId: string;
  encounterType: EncounterType;
  encounterDate: string;
  reasonForVisit?: string;
  chiefComplaint?: string;
  location?: string;
  notes?: string;
  idempotencyKey?: string;
}

// Patient Types
export interface Patient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
}

// Medical Record Types
export interface MedicalRecord {
  id: string;
  organizationId: string;
  patientId: string;
  encounterId?: string;
  doctorId: string;
  patient?: Patient;
  doctor?: UserProfile;
  encounter?: Encounter;
  presentComplaint?: string;
  historyOfPresentingComplaint?: string;
  pastMedicalHistory?: string;
  pastSurgicalHistory?: string;
  drugHistory?: string;
  familyHistory?: string;
  socialHistory?: string;
  physicalExamination?: Record<string, any>;
  assessment?: string;
  plan?: string;
  additionalNotes?: string;
  isFinalized: boolean;
  finalizedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalRecordDto {
  patientId: string;
  encounterId?: string;
  presentComplaint?: string;
  historyOfPresentingComplaint?: string;
  pastMedicalHistory?: string;
  pastSurgicalHistory?: string;
  drugHistory?: string;
  familyHistory?: string;
  socialHistory?: string;
  physicalExamination?: Record<string, any>;
  assessment?: string;
  plan?: string;
  additionalNotes?: string;
}

// Allergy Types
export enum AllergyType {
  DRUG = 'drug',
  FOOD = 'food',
  ENVIRONMENTAL = 'environmental',
  OTHER = 'other',
}

export enum AllergySeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  LIFE_THREATENING = 'life_threatening',
}

export interface Allergy {
  id: string;
  patientId: string;
  patient?: Patient;
  allergyType: AllergyType;
  allergen: string;
  severity: AllergySeverity;
  reaction?: string;
  onsetDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export interface CreateAllergyDto {
  patientId: string;
  allergyType: AllergyType;
  allergen: string;
  severity: AllergySeverity;
  reaction?: string;
  onsetDate?: string;
  notes?: string;
}

// Vital Signs Types
export enum VitalSignType {
  BLOOD_PRESSURE = 'blood_pressure',
  HEART_RATE = 'heart_rate',
  TEMPERATURE = 'temperature',
  RESPIRATORY_RATE = 'respiratory_rate',
  OXYGEN_SATURATION = 'oxygen_saturation',
  WEIGHT = 'weight',
  HEIGHT = 'height',
  BMI = 'bmi',
}

export interface VitalSign {
  id: string;
  patientId: string;
  encounterId?: string;
  type: VitalSignType;
  value: number;
  secondaryValue?: number;
  unit: string;
  recordedAt: string;
  notes?: string;
}

export interface CreateVitalSignDto {
  patientId: string;
  encounterId?: string;
  type: VitalSignType;
  value: number;
  secondaryValue?: number;
  unit: string;
  notes?: string;
}

// Transcription Types
export enum TranscriptionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface VoiceTranscription {
  id: string;
  patientId?: string;
  encounterId?: string;
  medicalRecordId?: string;
  status: TranscriptionStatus;
  rawTranscription?: string;
  processedTranscription?: string;
  targetField?: string;
  confidence?: number;
  createdAt: string;
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface OrganizationStats {
  totalDoctors: number;
  totalAppointments: number;
  activeSchedules: number;
}

// Doctor Management Types
export interface Doctor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  specialization?: string;
  licenseNumber?: string;
  isActive: boolean;
  isSuspended: boolean;
  organizationId?: string;
  organization?: Organization;
  organizations?: DoctorOrganization[];
  createdAt: string;
  updatedAt: string;
}

export interface DoctorOrganization {
  id: string;
  doctorId: string;
  organizationId: string;
  organization?: Organization;
  isPrimary: boolean;
  joinedAt: string;
  leftAt?: string;
}

export interface CreateDoctorDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  specialization?: string;
  licenseNumber?: string;
  organizationId: string;
}

export interface UpdateDoctorDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  specialization?: string;
  licenseNumber?: string;
}

// Schedule Types
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum TimeSlotStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  BLOCKED = 'blocked',
  EXPIRED = 'expired',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export interface Schedule {
  id: string;
  doctorId: string;
  organizationId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
  effectiveFrom?: string;
  effectiveUntil?: string;
}

export interface UpdateScheduleDto {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  slotDurationMinutes?: number;
  isActive?: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
}

export interface GenerateSlotsDto {
  fromDate: string;
  toDate: string;
}

export interface TimeSlot {
  id: string;
  scheduleId: string;
  doctorId: string;
  organizationId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: TimeSlotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleException {
  id: string;
  doctorId: string;
  organizationId: string;
  exceptionDate: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  createdAt: string;
}

export interface CreateScheduleExceptionDto {
  exceptionDate: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  organizationId: string;
  timeSlotId: string;
  encounterId?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reasonForVisit?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  patient?: Patient;
  doctor?: Doctor;
  timeSlot?: TimeSlot;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentFilters {
  patientId?: string;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CancelAppointmentDto {
  reason: string;
}
