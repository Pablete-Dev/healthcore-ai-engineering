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

- Collections: appointment, claim, and clinical staff filters and sorting.
- Search: patient and claim linear lookups plus binary searches by identifier.
- Transformations: no-show and claim rejection rates, appointment counts by status, paid revenue by clinic, claim minimum/maximum and average amounts, and executive reports.
- Validations: required fields, contact and insurance rules, patient identifiers, health concern length, consent, and appointment date constraints.

## Run

```bash
npm install
npm run typecheck
npm run demo
```

## HealthCore Cases

The demo covers appointments at multiple clinics, high no-show risk, cancelled/completed/scheduled/no-show appointment status totals, rejected and paid billing claims, staff credential expiry, patient searches, consultation request validation, and empty data sets.