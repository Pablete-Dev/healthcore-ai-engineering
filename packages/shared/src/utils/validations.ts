import { ConsultationRequest } from "../types/models";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

type RequiredTextField =
  | "first_name"
  | "last_name"
  | "date_of_birth"
  | "email"
  | "phone"
  | "preferred_language"
  | "preferred_clinic"
  | "preferred_date"
  | "preferred_time"
  | "service_type"
  | "new_patient"
  | "has_insurance"
  | "health_concern";

const PATIENT_ID_PATTERN = /^HC-[A-Za-z0-9]{6}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateConsultationRequest(
  request: ConsultationRequest,
): ValidationResult {
  const errors: string[] = [];
  const requiredFields: Array<[RequiredTextField, string]> = [
    ["first_name", "First name is required."],
    ["last_name", "Last name is required."],
    ["date_of_birth", "Date of birth is required."],
    ["email", "Email is required."],
    ["phone", "Phone is required."],
    ["preferred_language", "Preferred language is required."],
    ["preferred_clinic", "Preferred clinic is required."],
    ["preferred_date", "Preferred date is required."],
    ["preferred_time", "Preferred time is required."],
    ["service_type", "Service type is required."],
    ["new_patient", "New patient status is required."],
    ["has_insurance", "Insurance status is required."],
    ["health_concern", "Health concern is required."],
  ];

  for (const [field, message] of requiredFields) {
    if (!request[field]?.trim()) {
      errors.push(message);
    }
  }

  if (request.email.trim() && !EMAIL_PATTERN.test(request.email.trim())) {
    errors.push("Email must be valid.");
  }

  if (request.new_patient === "No") {
    if (!request.patient_id?.trim()) {
      errors.push("Patient ID is required for existing patients.");
    } else if (!PATIENT_ID_PATTERN.test(request.patient_id.trim())) {
      errors.push("Patient ID must use the format HC-XXXXXX.");
    }
  }

  if (request.has_insurance === "Yes") {
    if (!request.insurance_provider?.trim()) {
      errors.push("Insurance provider is required when insurance is selected.");
    }

    if (!request.insurance_member_id?.trim()) {
      errors.push("Insurance member ID is required when insurance is selected.");
    }
  }

  const healthConcernLength = request.health_concern.trim().length;
  if (healthConcernLength > 0 && (healthConcernLength < 20 || healthConcernLength > 500)) {
    errors.push("Health concern must be between 20 and 500 characters.");
  }

  if (!request.contact_consent) {
    errors.push("Contact consent is required.");
  }

  if (request.preferred_date.trim()) {
    const preferredDate = new Date(`${request.preferred_date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maximumDate = new Date(today);
    maximumDate.setDate(maximumDate.getDate() + 60);

    if (preferredDate < today) {
      errors.push("Preferred date cannot be in the past.");
    } else if (preferredDate > maximumDate) {
      errors.push("Preferred date cannot be more than 60 days from today.");
    }
  }

  return { valid: errors.length === 0, errors };
}