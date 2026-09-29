"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createCandidateNote, deleteCandidateNote, getCandidate, getCandidateNotes, patchCandidate, updateCandidate } from "@/lib/api";
import type { Candidate, CandidateNote, CandidateStage, CandidateStatus, PatchCandidatePayload } from "@/types/candidate";
import { stageLabels, statusLabels } from "@/app/candidate-labels";
import CandidateForm from "@/app/components/candidate-form";

type CandidateResult = { id: string; data: Candidate | null; error: string | null };
type NotesResult = { id: string; data: CandidateNote[]; error: string | null };
type Feedback = { kind: "success" | "error"; message: string };

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Inténtalo de nuevo.";
}

export default function CandidateDetail({ id, created = false }: { id: string; created?: boolean }) {
  const [candidateResult, setCandidateResult] = useState<CandidateResult | null>(null);
  const [notesResult, setNotesResult] = useState<NotesResult | null>(null);
  const [editing, setEditing] = useState(false);
  const [editFeedback, setEditFeedback] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<Feedback | null>(null);
  const [content, setContent] = useState("");
  const [notePending, setNotePending] = useState<string | null>(null);
  const [noteFeedback, setNoteFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCandidate() {
      try {
        const data = await getCandidate(id);
        if (active) setCandidateResult({ id, data, error: null });
      } catch (error) {
        if (active) setCandidateResult({ id, data: null, error: errorMessage(error) });
      }
    }

    async function loadNotes() {
      try {
        const response = await getCandidateNotes(id);
        if (active) setNotesResult({ id, data: response.data, error: null });
      } catch (error) {
        if (active) setNotesResult({ id, data: [], error: errorMessage(error) });
      }
    }

    void loadCandidate();
    void loadNotes();
    return () => { active = false; };
  }, [id]);

  const candidate = candidateResult?.id === id ? candidateResult.data : null;
  const notes = notesResult?.id === id ? notesResult : null;

  async function updateField(payload: PatchCandidatePayload, label: string) {
    setUpdating(true);
    setUpdateFeedback(null);
    try {
      const updated = await patchCandidate(id, payload);
      setCandidateResult((current) => current?.id === id ? { id, data: updated, error: null } : current);
      setUpdateFeedback({ kind: "success", message: `${label} actualizado correctamente.` });
    } catch (error) {
      setUpdateFeedback({ kind: "error", message: `No se pudo actualizar ${label.toLowerCase()}: ${errorMessage(error)}` });
    } finally {
      setUpdating(false);
    }
  }

  async function addNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setNoteFeedback({ kind: "error", message: "Escribe una nota antes de guardarla." });
      return;
    }

    setNotePending("creating");
    setNoteFeedback(null);
    try {
      await createCandidateNote(id, trimmed);
      const response = await getCandidateNotes(id);
      setNotesResult((current) => current?.id === id ? { id, data: response.data, error: null } : current);
      setContent("");
      setNoteFeedback({ kind: "success", message: "Nota añadida correctamente." });
    } catch (error) {
      setNoteFeedback({ kind: "error", message: `No se pudo añadir la nota: ${errorMessage(error)}` });
    } finally {
      setNotePending(null);
    }
  }

  async function removeNote(noteId: string) {
    setNotePending(noteId);
    setNoteFeedback(null);
    try {
      await deleteCandidateNote(id, noteId);
      const response = await getCandidateNotes(id);
      setNotesResult((current) => current?.id === id ? { id, data: response.data, error: null } : current);
      setNoteFeedback({ kind: "success", message: "Nota eliminada correctamente." });
    } catch (error) {
      setNoteFeedback({ kind: "error", message: `No se pudo eliminar la nota: ${errorMessage(error)}` });
    } finally {
      setNotePending(null);
    }
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
        <Link className="back-link" href="/">← Volver a candidaturas</Link>
        {created && <p className="feedback feedback-success" role="status">Candidatura creada correctamente.</p>}
        {candidateResult?.id !== id ? (
          <div className="notice" role="status">Cargando candidatura...</div>
        ) : candidateResult.error ? (
          <div className="notice notice-error" role="alert">Error al cargar la candidatura: {candidateResult.error}</div>
        ) : candidate && (
          <>
            <div className="page-intro detail-intro">
              <p className="breadcrumb">Personas y Fuerza Laboral / Selección / Candidatura</p>
              <h1>{candidate.full_name}</h1>
              <p className="subtitle">{candidate.position}</p>
            </div>
            <section className="detail-section" aria-labelledby="candidate-info-title">
              <div className="section-heading">
                <h2 id="candidate-info-title">Datos de la candidatura</h2>
                {!editing && <button type="button" className="text-button" onClick={() => { setEditFeedback(null); setEditing(true); }}>Editar datos</button>}
              </div>
              {editFeedback && <p className="feedback feedback-success" role="status">{editFeedback}</p>}
              {editing ? (
                <CandidateForm
                  key={candidate.id}
                  initial={candidate}
                  onSave={(payload) => updateCandidate(id, payload)}
                  onSuccess={(updated) => {
                    setCandidateResult({ id, data: updated, error: null });
                    setEditFeedback("Candidatura actualizada correctamente.");
                    setEditing(false);
                  }}
                  onCancel={() => setEditing(false)}
                />
              ) : <dl className="detail-grid">
                <div><dt>Nombre completo</dt><dd>{candidate.full_name}</dd></div>
                <div><dt>Puesto</dt><dd>{candidate.position}</dd></div>
                <div><dt>Email</dt><dd><a href={`mailto:${candidate.email}`}>{candidate.email}</a></dd></div>
                <div><dt>Teléfono</dt><dd><a href={`tel:${candidate.phone}`}>{candidate.phone}</a></dd></div>
                <div><dt>Experiencia</dt><dd>{candidate.experience_years} {candidate.experience_years === 1 ? "año" : "años"}</dd></div>
                <div><dt>Fecha de solicitud</dt><dd>{new Date(candidate.applied_at).toLocaleDateString("es-ES")}</dd></div>
                <div><dt>LinkedIn</dt><dd>{candidate.linkedin_url ? <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer">Ver perfil</a> : "No disponible"}</dd></div>
                <div><dt>Currículum</dt><dd>{candidate.cv_url ? <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer">Ver CV</a> : "No disponible"}</dd></div>
              </dl>}
            </section>
            <section className="detail-section" aria-labelledby="candidate-process-title">
              <h2 id="candidate-process-title">Proceso de selección</h2>
              <div className="process-controls">
                <div className="filter-field">
                  <label htmlFor="detail-status">Estado</label>
                  <select id="detail-status" value={candidate.status} disabled={updating} onChange={(event) => void updateField({ status: event.target.value as CandidateStatus }, "Estado")}>
                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div className="filter-field">
                  <label htmlFor="detail-stage">Etapa</label>
                  <select id="detail-stage" value={candidate.stage} disabled={updating} onChange={(event) => void updateField({ stage: event.target.value as CandidateStage }, "Etapa")}>
                    {Object.entries(stageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
              </div>
              {updating && <p role="status">Guardando cambios...</p>}
              {updateFeedback && <p className={`feedback feedback-${updateFeedback.kind}`} role={updateFeedback.kind === "error" ? "alert" : "status"}>{updateFeedback.message}</p>}
            </section>
          </>
        )}
        <section className="detail-section" aria-labelledby="candidate-notes-title">
          <h2 id="candidate-notes-title">Notas</h2>
          {notes === null ? <p role="status">Cargando notas...</p> : notes.error ? (
            <p className="notice notice-error" role="alert">Error al cargar las notas: {notes.error}</p>
          ) : (
            <>
              {notes.data.length === 0 ? <p className="empty-notes">Aún no hay notas.</p> : (
                <ul className="notes-list">{notes.data.map((note) => (
                  <li key={note.id}>
                    <div><time dateTime={note.created_at}>{new Date(note.created_at).toLocaleDateString("es-ES")}</time><p>{note.content}</p></div>
                    <button type="button" disabled={notePending !== null} onClick={() => void removeNote(note.id)} aria-label={`Eliminar nota del ${new Date(note.created_at).toLocaleDateString("es-ES")}`}>
                      {notePending === note.id ? "Eliminando..." : "Eliminar"}
                    </button>
                  </li>
                ))}</ul>
              )}
              <form className="note-form" onSubmit={(event) => void addNote(event)}>
                <label htmlFor="note-content">Nueva nota</label>
                <textarea id="note-content" value={content} onChange={(event) => setContent(event.target.value)} rows={4} placeholder="Escribe una nota sobre esta candidatura" disabled={notePending !== null} />
                <button type="submit" disabled={notePending !== null}>{notePending === "creating" ? "Guardando..." : "Añadir nota"}</button>
              </form>
              {notePending !== null && <p role="status">{notePending === "creating" ? "Guardando nota..." : "Eliminando nota..."}</p>}
              {noteFeedback && <p className={`feedback feedback-${noteFeedback.kind}`} role={noteFeedback.kind === "error" ? "alert" : "status"}>{noteFeedback.message}</p>}
            </>
          )}
        </section>
      </main>
    </>
  );
}