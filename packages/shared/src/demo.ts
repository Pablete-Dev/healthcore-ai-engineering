import {
  filterAppointmentsByClinic,
  filterHighNoShowRiskAppointments,
  filterRejectedClaims,
  filterStaffWithUpcomingCmeExpiry,
  sortAppointmentsByDateTime,
  sortAppointmentsByNoShowRiskDesc,
  sortClaimsByAmountDesc,
  sortStaffByCmeExpiryAsc,
} from "./utils/collections";
import {
  binarySearchAppointmentById,
  binarySearchPatientById,
  searchClaimsByPatientId,
  searchPatientByEmailOrPhone,
} from "./utils/search";
import {
  calculateAverageClaimAmount,
  calculateClaimRejectionRate,
  calculateNoShowRate,
  generateExecutiveReport,
  getMinMaxClaimAmount,
  sumRevenueByClinic,
} from "./utils/transformations";
import { validateConsultationRequest } from "./utils/validations";
import type {
  Appointment,
  BillingClaim,
  ClinicalStaff,
  ConsultationRequest,
  Patient,
} from "./types/models";

function dateAtOffset(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const patients: Patient[] = [
  {
    id: "PAT-001",
    firstName: "Ana",
    lastName: "Martinez",
    dateOfBirth: "1987-04-12",
    email: "ana.martinez@example.com",
    phone: "+1-512-555-0101",
    preferredLanguage: "Spanish",
    country: "US",
    patientId: "HC-A1B2C3",
    hasInsurance: true,
    insuranceProvider: "BlueCross",
    insuranceMemberId: "BC-1001",
  },
  {
    id: "PAT-002",
    firstName: "David",
    lastName: "Johnson",
    dateOfBirth: "1979-09-22",
    email: "david.johnson@example.com",
    phone: "+1-305-555-0102",
    preferredLanguage: "English",
    country: "US",
    hasInsurance: false,
  },
  {
    id: "PAT-003",
    firstName: "Sofia",
    lastName: "Garcia",
    dateOfBirth: "1992-01-16",
    email: "sofia.garcia@example.com",
    phone: "+1-404-555-0103",
    preferredLanguage: "Spanish",
    country: "US",
    hasInsurance: true,
    insuranceProvider: "Aetna",
    insuranceMemberId: "AE-1003",
  },
];

const appointments: Appointment[] = [
  {
    id: "APT-001",
    patientId: "PAT-001",
    clinicId: "CLINIC-AUS",
    clinicianId: "STAFF-001",
    serviceType: "Primary Care",
    date: dateAtOffset(3),
    timeWindow: "Morning (7am–12pm)",
    status: "scheduled",
    createdAt: "2026-09-01T09:00:00Z",
    noShowRiskScore: 0.2,
  },
  {
    id: "APT-002",
    patientId: "PAT-002",
    clinicId: "CLINIC-MIA",
    clinicianId: "STAFF-002",
    serviceType: "Mental Health",
    date: dateAtOffset(1),
    timeWindow: "Evening (5pm–8pm)",
    status: "no_show",
    createdAt: "2026-09-02T10:00:00Z",
    noShowRiskScore: 0.85,
  },
  {
    id: "APT-003",
    patientId: "PAT-003",
    clinicId: "CLINIC-AUS",
    clinicianId: "STAFF-001",
    serviceType: "Preventive Health",
    date: dateAtOffset(1),
    timeWindow: "Afternoon (12pm–5pm)",
    status: "completed",
    createdAt: "2026-09-03T11:00:00Z",
    noShowRiskScore: 0.45,
  },
];

const claims: BillingClaim[] = [
  {
    id: "CLM-001",
    appointmentId: "APT-001",
    patientId: "PAT-001",
    clinicId: "CLINIC-AUS",
    payerType: "commercial_insurance",
    amount: 140,
    currency: "USD",
    status: "paid",
    submittedAt: "2026-09-04T09:00:00Z",
    decidedAt: "2026-09-06T09:00:00Z",
  },
  {
    id: "CLM-002",
    appointmentId: "APT-002",
    patientId: "PAT-002",
    clinicId: "CLINIC-MIA",
    payerType: "private_pay",
    amount: 220,
    currency: "USD",
    status: "rejected",
    rejectionReason: "Missing eligibility information",
    submittedAt: "2026-09-05T09:00:00Z",
    decidedAt: "2026-09-07T09:00:00Z",
  },
  {
    id: "CLM-003",
    appointmentId: "APT-003",
    patientId: "PAT-003",
    clinicId: "CLINIC-AUS",
    payerType: "commercial_insurance",
    amount: 180,
    currency: "USD",
    status: "paid",
    submittedAt: "2026-09-06T09:00:00Z",
    decidedAt: "2026-09-08T09:00:00Z",
  },
];

const staff: ClinicalStaff[] = [
  {
    id: "STAFF-001",
    firstName: "Maya",
    lastName: "Chen",
    role: "Physician",
    clinicId: "CLINIC-AUS",
    country: "US",
    licenseExpiryDate: dateAtOffset(15),
  },
  {
    id: "STAFF-002",
    firstName: "Jordan",
    lastName: "Lee",
    role: "Nurse Practitioner",
    clinicId: "CLINIC-MIA",
    country: "US",
    licenseExpiryDate: dateAtOffset(45),
  },
  {
    id: "STAFF-003",
    firstName: "Priya",
    lastName: "Shah",
    role: "Nurse",
    clinicId: "CLINIC-AUS",
    country: "US",
  },
];

const validRequest: ConsultationRequest = {
  first_name: "Elena",
  last_name: "Rodriguez",
  date_of_birth: "1990-05-18",
  email: "elena.rodriguez@example.com",
  phone: "+1-512-555-0199",
  preferred_language: "Spanish",
  preferred_clinic: "HealthCore Austin Central",
  preferred_date: dateAtOffset(14),
  preferred_time: "Morning (7am–12pm)",
  service_type: "Primary Care",
  new_patient: "No",
  patient_id: "HC-D4E5F6",
  has_insurance: "Yes",
  insurance_provider: "BlueCross",
  insurance_member_id: "BC-2001",
  health_concern: "I would like a routine consultation to discuss persistent fatigue.",
  contact_consent: true,
};

const invalidRequest: ConsultationRequest = {
  ...validRequest,
  email: "not-an-email",
  phone: "",
  preferred_date: dateAtOffset(-1),
  patient_id: "HC-123",
  insurance_provider: "",
  insurance_member_id: "",
  health_concern: "Too short",
  contact_consent: false,
};

console.log("Collections", {
  appointmentsAtAustin: filterAppointmentsByClinic(appointments, "CLINIC-AUS"),
  highNoShowRisk: filterHighNoShowRiskAppointments(appointments),
  rejectedClaims: filterRejectedClaims(claims),
  staffWithUpcomingCmeExpiry: filterStaffWithUpcomingCmeExpiry(staff),
  appointmentsByDateTime: sortAppointmentsByDateTime(appointments),
  appointmentsByNoShowRisk: sortAppointmentsByNoShowRiskDesc(appointments),
  claimsByAmount: sortClaimsByAmountDesc(claims),
  staffByCmeExpiry: sortStaffByCmeExpiryAsc(staff),
});

console.log("Search", {
  linearFound: searchPatientByEmailOrPhone(patients, "ana.martinez@example.com"),
  linearNotFound: searchClaimsByPatientId(claims, "PAT-999"),
  binaryFound: binarySearchPatientById(patients, "PAT-002"),
  binaryNotFound: binarySearchAppointmentById(appointments, "APT-999"),
});

console.log("Transformations", {
  noShowRate: calculateNoShowRate(appointments),
  claimRejectionRate: calculateClaimRejectionRate(claims),
  revenueByClinic: sumRevenueByClinic(claims),
  minMaxClaimAmount: getMinMaxClaimAmount(claims),
  averageClaimAmount: calculateAverageClaimAmount(claims),
  executiveReport: generateExecutiveReport(appointments, claims),
});

console.log("Validations", {
  validRequest: validateConsultationRequest(validRequest),
  invalidRequest: validateConsultationRequest(invalidRequest),
});

console.log("Empty arrays", {
  noShowRate: calculateNoShowRate([]),
  minMaxClaimAmount: getMinMaxClaimAmount([]),
  linearSearch: searchPatientByEmailOrPhone([], "unknown@example.com"),
  binarySearch: binarySearchPatientById([], "PAT-001"),
});