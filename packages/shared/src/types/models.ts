/**
 * HealthCore domain models — stage 1 (structure + types only).
 * No filtering, search, transformation, or validation logic here yet.
 */

export type Country = "US" | "UK";

export type YesNo = "Yes" | "No";

// Mirrors the live values in uis/website/application.html (#preferred_language).
export type PreferredLanguage = "English" | "Spanish";

// Mirrors the live <option> values in uis/website/application.html (#preferred_clinic).
// Only the 6 US clinics currently exposed by the form; CONTEXT.es.md references
// 3 additional UK clinics that are not yet represented in the web form.
export type FormClinicName =
  | "HealthCore Austin Central"
  | "HealthCore Austin North"
  | "HealthCore San Antonio"
  | "HealthCore Miami"
  | "HealthCore Orlando"
  | "HealthCore Atlanta";

// Mirrors the live <option> values in uis/website/application.html (#preferred_time).
export type PreferredTimeWindow =
  | "Morning (7am–12pm)"
  | "Afternoon (12pm–5pm)"
  | "Evening (5pm–8pm)";

// Mirrors the live <option> values in uis/website/application.html (#service_type).
export type ServiceType =
  | "Primary Care"
  | "Chronic Disease Management"
  | "Specialist Consultation"
  | "Preventive Health"
  | "Women's Health"
  | "Paediatric Care"
  | "Mental Health";

export interface Clinic {
  id: string;
  name: FormClinicName | string;
  country: Country;
  city: string;
  state?: string;
  closingHour: number; // 24h local time, e.g. 20 for 8pm
  ehrSystem: string;
}

// Field names mirror uis/website/validation.js (`fields` map / #applicationForm) exactly,
// since this is the shape submitted by the live web form.
export interface ConsultationRequest {
  first_name: string;
  last_name: string;
  date_of_birth: string; // ISO date (YYYY-MM-DD)
  email: string;
  phone: string;
  preferred_language: PreferredLanguage;
  preferred_clinic: FormClinicName;
  preferred_date: string; // ISO date (YYYY-MM-DD)
  preferred_time: PreferredTimeWindow;
  service_type: ServiceType;
  new_patient: YesNo;
  patient_id?: string; // format HC-XXXXXX, relevant when new_patient === "No"
  has_insurance: YesNo;
  insurance_provider?: string; // required when has_insurance === "Yes"
  insurance_member_id?: string; // required when has_insurance === "Yes"
  health_concern: string;
  contact_consent: boolean;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date (YYYY-MM-DD)
  email: string;
  phone: string;
  preferredLanguage: PreferredLanguage;
  country: Country;
  patientId?: string; // format HC-XXXXXX
  hasInsurance: boolean;
  insuranceProvider?: string;
  insuranceMemberId?: string;
}

export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Appointment {
  id: string;
  patientId: string;
  clinicId: string;
  clinicianId?: string;
  serviceType: ServiceType;
  date: string; // ISO date (YYYY-MM-DD)
  timeWindow: PreferredTimeWindow;
  status: AppointmentStatus;
  createdAt: string; // ISO datetime
  noShowRiskScore?: number;
}

export type PayerType =
  | "commercial_insurance"
  | "medicare"
  | "medicaid"
  | "nhs"
  | "private_pay";

export type BillingClaimStatus = "submitted" | "accepted" | "rejected" | "paid";

export interface BillingClaim {
  id: string;
  appointmentId: string;
  patientId: string;
  clinicId: string;
  payerType: PayerType;
  amount: number;
  currency: "USD" | "GBP";
  status: BillingClaimStatus;
  rejectionReason?: string;
  submittedAt: string; // ISO datetime
  decidedAt?: string; // ISO datetime
}

export type ClinicalRole =
  | "Physician"
  | "Nurse Practitioner"
  | "Nurse"
  | "Medical Assistant";

export interface ClinicalStaff {
  id: string;
  firstName: string;
  lastName: string;
  role: ClinicalRole;
  clinicId: string;
  country: Country;
  licenseExpiryDate?: string; // ISO date (YYYY-MM-DD)
  continuingEducationHours?: number;
}
