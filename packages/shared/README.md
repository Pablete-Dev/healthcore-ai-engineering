# HealthCore Shared Utilities

## Objective

This package provides shared HealthCore domain models and pure TypeScript utilities for managing consultation requests, appointments, clinical staff, and billing claims.

## Structure

```text
src/
  demo.ts                 Executable utility demonstration
  types/models.ts         HealthCore domain models
  utils/collections.ts    Filters and sorting helpers
  utils/search.ts         Linear and binary search helpers
  utils/transformations.ts Metrics, aggregations, and reports
  utils/validations.ts    Consultation request business validation
```

## Implemented Utilities

- Collections: filter appointments by any combination of `clinicId`, `status`, and `minNoShowRisk` (or no criteria); filter claims and clinical staff; sort claims by amount with `"asc"` or `"desc"`. Filters and sorts return new arrays without mutating inputs.
- Search: linear patient lookup by email or phone and claim lookup by patient ID. Binary patient and appointment searches require IDs sorted ascending and return the found index or `-1` when missing, including empty arrays.
- Transformations: appointment counts by status, no-show and claim rejection rates, paid revenue by clinic, claim minimum/maximum and average amounts, and a HealthCore executive report with appointment volume, no-show rate, claim rejection rate, and `revenueByClinic`.
- Validations: required fields, contact and insurance rules, patient identifiers, health concern length, consent, and appointment date constraints.

## Run

From `packages/shared`, install dependencies, typecheck, and run the demo:

```bash
npm install
npm run typecheck
npm run demo
```

## HealthCore Cases

The demo covers single- and multiple-criterion filters, ascending and descending sorting, found and missing linear searches, binary indices and `-1` results, all existing aggregations, the executive report with revenue by clinic, valid and invalid consultation requests, and empty data sets.