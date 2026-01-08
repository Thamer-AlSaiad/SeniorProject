export enum UserType {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum TokenType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
}

// Sprint 2: Clinical Types
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

export enum AllergySeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  LIFE_THREATENING = 'life_threatening',
}

export enum AllergyType {
  DRUG = 'drug',
  FOOD = 'food',
  ENVIRONMENTAL = 'environmental',
  OTHER = 'other',
}

export enum TranscriptionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum TranscriptionSource {
  REALTIME = 'realtime',
  FILE_UPLOAD = 'file_upload',
}

export enum DocumentType {
  LAB_RESULT = 'lab_result',
  IMAGING = 'imaging',
  PRESCRIPTION = 'prescription',
  REFERRAL = 'referral',
  CONSENT = 'consent',
  OTHER = 'other',
}

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

export enum ReviewOfSystemsCategory {
  GENERAL = 'general',
  CARDIOVASCULAR = 'cardiovascular',
  RESPIRATORY = 'respiratory',
  GASTROINTESTINAL = 'gastrointestinal',
  GENITOURINARY = 'genitourinary',
  MUSCULOSKELETAL = 'musculoskeletal',
  NEUROLOGICAL = 'neurological',
  PSYCHIATRIC = 'psychiatric',
  SKIN = 'skin',
  ENDOCRINE = 'endocrine',
  HEMATOLOGIC = 'hematologic',
  ALLERGIC_IMMUNOLOGIC = 'allergic_immunologic',
}

export interface JwtPayload {
  sub: string;
  email: string;
  userType: UserType;
  organizationId?: string;
}

export interface RequestUser {
  userId: string;
  email: string;
  userType: UserType;
  organizationId?: string;
}

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

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Sprint 3-4: Scheduling Types
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

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}
