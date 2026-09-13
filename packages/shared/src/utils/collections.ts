/**
 * Pure filter/sort helpers over domain models — stage 2.
 * No search, data transformation, or validation logic here yet.
 * All functions return new arrays; inputs are never mutated.
 */

import type {
  Appointment,
  BillingClaim,
  ClinicalStaff,
  PreferredTimeWindow,
} from "../types/models";

const TIME_WINDOW_ORDER: Record<PreferredTimeWindow, number> = {
  "Morning (7am–12pm)": 0,
  "Afternoon (12pm–5pm)": 1,
  "Evening (5pm–8pm)": 2,
};

export function filterAppointmentsByClinic(
  appointments: readonly Appointment[],
  clinicId: string
): Appointment[] {
  return appointments.filter((appointment) => appointment.clinicId === clinicId);
}

export function filterHighNoShowRiskAppointments(
  appointments: readonly Appointment[],
  threshold = 0.7
): Appointment[] {
  return appointments.filter(
    (appointment) => (appointment.noShowRiskScore ?? 0) >= threshold
  );
}

export function filterRejectedClaims(
  claims: readonly BillingClaim[]
): BillingClaim[] {
  return claims.filter((claim) => claim.status === "rejected");
}

// ClinicalStaff has no dedicated CME expiry field yet; `licenseExpiryDate` is the
// closest proxy since CME hours are tracked to maintain that same license (per
// CONTEXT.es.md, Personas y Fuerza Laboral).
export function filterStaffWithUpcomingCmeExpiry(
  staff: readonly ClinicalStaff[],
  withinDays = 30,
  referenceDate: Date = new Date()
): ClinicalStaff[] {
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() + withinDays);

  return staff.filter((member) => {
    if (!member.licenseExpiryDate) return false;
    const expiry = new Date(member.licenseExpiryDate);
    return expiry >= referenceDate && expiry <= cutoff;
  });
}

export function sortAppointmentsByDateTime(
  appointments: readonly Appointment[]
): Appointment[] {
  return [...appointments].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return TIME_WINDOW_ORDER[a.timeWindow] - TIME_WINDOW_ORDER[b.timeWindow];
  });
}

export function sortAppointmentsByNoShowRiskDesc(
  appointments: readonly Appointment[]
): Appointment[] {
  return [...appointments].sort(
    (a, b) => (b.noShowRiskScore ?? 0) - (a.noShowRiskScore ?? 0)
  );
}

export function sortClaimsByAmountDesc(
  claims: readonly BillingClaim[]
): BillingClaim[] {
  return [...claims].sort((a, b) => b.amount - a.amount);
}

// Staff without a licenseExpiryDate are sorted last (treated as farthest from expiring).
export function sortStaffByCmeExpiryAsc(
  staff: readonly ClinicalStaff[]
): ClinicalStaff[] {
  return [...staff].sort((a, b) => {
    if (!a.licenseExpiryDate && !b.licenseExpiryDate) return 0;
    if (!a.licenseExpiryDate) return 1;
    if (!b.licenseExpiryDate) return -1;
    return a.licenseExpiryDate < b.licenseExpiryDate ? -1 : 1;
  });
}
