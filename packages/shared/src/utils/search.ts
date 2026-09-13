/**
 * Linear/binary search helpers over domain models — stage 3.
 * No data transformation or validation logic here yet.
 * All functions are read-only; inputs are never mutated.
 */

import type { Appointment, BillingClaim, Patient } from "../types/models";

export function searchPatientByEmailOrPhone(
  patients: readonly Patient[],
  query: string
): Patient | undefined {
  if (patients.length === 0) return undefined;
  return patients.find(
    (patient) => patient.email === query || patient.phone === query
  );
}

// BillingClaim has no billing-code field in models.ts, so a linear search by
// patientId is the closest justifiable lookup with the current model shape.
export function searchClaimsByPatientId(
  claims: readonly BillingClaim[],
  patientId: string
): BillingClaim[] {
  if (claims.length === 0) return [];
  return claims.filter((claim) => claim.patientId === patientId);
}

// Assumes `patients` is already sorted ascending by `id`.
export function binarySearchPatientById(
  patients: readonly Patient[],
  id: string
): Patient | undefined {
  let low = 0;
  let high = patients.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = patients[mid];

    if (candidate.id === id) return candidate;
    if (candidate.id < id) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return undefined;
}

// Assumes `appointments` is already sorted ascending by `id`.
export function binarySearchAppointmentById(
  appointments: readonly Appointment[],
  id: string
): Appointment | undefined {
  let low = 0;
  let high = appointments.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = appointments[mid];

    if (candidate.id === id) return candidate;
    if (candidate.id < id) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return undefined;
}
