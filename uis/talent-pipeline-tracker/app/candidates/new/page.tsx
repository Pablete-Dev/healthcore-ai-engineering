"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CandidateForm from "@/app/components/candidate-form";
import { createCandidate } from "@/lib/api";

export default function NewCandidatePage() {
  const router = useRouter();

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <div className="brand"><span className="brand-mark" aria-hidden="true">+</span> HealthCore <span className="brand-divider" /> <span className="brand-area">Personas y Fuerza Laboral</span></div>
          <div className="header-owner"><span>Responsable del área</span><strong>Diane Foster</strong></div>
        </div>
      </header>
      <main className="workspace">
        <Link className="back-link" href="/">← Volver a candidaturas</Link>
        <div className="page-intro detail-intro">
          <p className="breadcrumb">Personas y Fuerza Laboral / Selección / Nueva candidatura</p>
          <h1>Nueva candidatura</h1>
          <p className="subtitle">Talent Pipeline Tracker</p>
        </div>
        <section className="detail-section" aria-label="Datos de la nueva candidatura">
          <CandidateForm onSave={createCandidate} onSuccess={(candidate) => router.push(`/candidates/${encodeURIComponent(candidate.id)}?created=1`)} />
        </section>
      </main>
    </>
  );
}