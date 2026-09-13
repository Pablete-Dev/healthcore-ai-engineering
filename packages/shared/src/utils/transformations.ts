/**
 * Pure aggregate/report helpers over domain models — stage 4.
 * No validation logic here yet. All functions are read-only; inputs are never mutated.
 */

import type { Appointment, AppointmentStatus, BillingClaim } from "../types/models";

export function countAppointmentsByStatus(
  appointments: readonly Appointment[]
): Record<AppointmentStatus, number> {
  const counts: Record<AppointmentStatus, number> = {
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
  };

  for (const appointment of appointments) {
    counts[appointment.status] += 1;
  }

  return counts;
}

export function calculateNoShowRate(appointments: readonly Appointment[]): number {
  if (appointments.length === 0) return 0;
  const noShows = appointments.filter((a) => a.status === "no_show").length;
  return (noShows / appointments.length) * 100;
}

export function calculateClaimRejectionRate(claims: readonly BillingClaim[]): number {
  if (claims.length === 0) return 0;
  const rejected = claims.filter((claim) => claim.status === "rejected").length;
  return (rejected / claims.length) * 100;
}

// Revenue is counted from claims that have actually been paid; "accepted" claims
// are not yet collected and "rejected"/"submitted" claims generate no revenue.
export function sumRevenueByClinic(
  claims: readonly BillingClaim[]
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const claim of claims) {
    if (claim.status !== "paid") continue;
    totals[claim.clinicId] = (totals[claim.clinicId] ?? 0) + claim.amount;
  }
  return totals;
}

export function getMinMaxClaimAmount(
  claims: readonly BillingClaim[]
): { min: number; max: number } | undefined {
  if (claims.length === 0) return undefined;
  let min = claims[0].amount;
  let max = claims[0].amount;
  for (const claim of claims) {
    if (claim.amount < min) min = claim.amount;
    if (claim.amount > max) max = claim.amount;
  }
  return { min, max };
}

export function calculateAverageClaimAmount(claims: readonly BillingClaim[]): number {
  if (claims.length === 0) return 0;
  const total = claims.reduce((sum, claim) => sum + claim.amount, 0);
  return total / claims.length;
}

export interface ExecutiveReport {
  appointmentVolume: number;
  noShowRate: number;
  claimRejectionRate: number;
}

export function generateExecutiveReport(
  appointments: readonly Appointment[],
  claims: readonly BillingClaim[]
): ExecutiveReport {
  return {
    appointmentVolume: appointments.length,
    noShowRate: calculateNoShowRate(appointments),
    claimRejectionRate: calculateClaimRejectionRate(claims),
  };
}
