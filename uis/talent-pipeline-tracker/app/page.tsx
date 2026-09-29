import { Suspense } from "react";
import CandidateDashboard from "./candidate-dashboard";

export default function Home() {
  return (
    <Suspense fallback={<main className="workspace" aria-live="polite">Cargando candidaturas...</main>}>
      <CandidateDashboard />
    </Suspense>
  );
}
