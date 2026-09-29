"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getCandidates } from "@/lib/api";
import type { Candidate, CandidateStage, CandidateStatus } from "@/types/candidate";
import { stageLabels, statusLabels } from "./candidate-labels";
import CandidateFilters from "./components/candidate-filters";
import CandidateList from "./components/candidate-list";

type Result = { key: string; data: Candidate[]; total: number; error: string | null };
const pageSize = 10;

export default function CandidateDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const statusValue = searchParams.get("status") ?? "";
  const stageValue = searchParams.get("stage") ?? "";
  const pageValue = Number(searchParams.get("page"));
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const status = statusValue in statusLabels ? statusValue as CandidateStatus : undefined;
  const stage = stageValue in stageLabels ? stageValue as CandidateStage : undefined;
  const key = JSON.stringify([search, status, stage, page]);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await getCandidates({ search: search || undefined, status, stage, page, limit: pageSize });
        if (active) setResult({ key, data: response.data, total: response.total, error: null });
      } catch (error) {
        if (active) setResult({ key, data: [], total: 0, error: error instanceof Error ? error.message : "No se pudieron cargar las candidaturas." });
      }
    }

    void load();
    return () => { active = false; };
  }, [key, search, status, stage, page]);

  function updateParam(name: "search" | "status" | "stage", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    params.delete("page");
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }

  function changePage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage === 1) params.delete("page");
    else params.set("page", String(nextPage));
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <div className="brand"><span className="brand-mark" aria-hidden="true">+</span> HealthCore <span className="brand-divider" /> <span className="brand-area">Personas y Fuerza Laboral</span></div>
          <div className="header-owner"><span>Responsable del área</span><strong>Diane Foster</strong></div>
        </div>
      </header>
      <main className="workspace">
        <div className="page-intro">
          <p className="breadcrumb">Personas y Fuerza Laboral / Selección</p>
          <div className="intro-actions">
            <h1>Candidaturas</h1>
            <Link className="primary-link" href="/candidates/new">Nueva candidatura</Link>
          </div>
          <p className="subtitle">Talent Pipeline Tracker</p>
        </div>
        <section className="filters-section" aria-label="Buscar y filtrar candidaturas">
          <CandidateFilters search={search} status={status ?? ""} stage={stage ?? ""} onChange={updateParam} />
        </section>
        <section className="results-section" aria-label="Listado de candidaturas" aria-live="polite">
          {result?.key !== key ? (
            <div className="notice" role="status">Cargando candidaturas...</div>
          ) : result.error ? (
            <div className="notice notice-error" role="alert">Error al cargar candidaturas: {result.error}</div>
          ) : (
            <>
              <div className="results-heading">
                <h2>Pipeline de selección</h2>
                <span className="results-count">{result.total} {result.total === 1 ? "resultado" : "resultados"}</span>
              </div>
              <CandidateList candidates={result.data} />
              {result.total > 0 && (
                <nav className="pagination" aria-label="Páginas de candidaturas">
                  <button type="button" onClick={() => changePage(page - 1)} disabled={page === 1}>Anterior</button>
                  <span>Página {page} de {Math.max(1, Math.ceil(result.total / pageSize))}</span>
                  <button type="button" onClick={() => changePage(page + 1)} disabled={page * pageSize >= result.total}>Siguiente</button>
                </nav>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}