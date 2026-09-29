"use client";

import { useState } from "react";
import type { Candidate, CreateCandidatePayload } from "@/types/candidate";

type FieldName = "full_name" | "email" | "phone" | "position" | "experience_years" | "linkedin_url" | "cv_url";
type Fields = Record<FieldName, string>;
type FieldErrors = Partial<Record<FieldName, string>>;

const emptyFields: Fields = {
  full_name: "",
  email: "",
  phone: "",
  position: "",
  experience_years: "",
  linkedin_url: "",
  cv_url: "",
};

function validate(fields: Fields): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.full_name.trim()) errors.full_name = "Introduce el nombre completo.";
  if (!fields.email.trim()) errors.email = "Introduce el email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) errors.email = "Introduce un email válido.";
  if (!fields.phone.trim()) errors.phone = "Introduce el teléfono.";
  if (!fields.position.trim()) errors.position = "Introduce el puesto.";
  if (!fields.experience_years.trim()) errors.experience_years = "Introduce los años de experiencia.";
  else if (!Number.isFinite(Number(fields.experience_years)) || Number(fields.experience_years) < 0) {
    errors.experience_years = "Introduce un número mayor o igual a 0.";
  }
  for (const name of ["linkedin_url", "cv_url"] as const) {
    const value = fields[name].trim();
    if (value) {
      try {
        const url = new URL(value);
        if (url.protocol !== "https:" && url.protocol !== "http:") errors[name] = "Introduce una URL http o https válida.";
      } catch {
        errors[name] = "Introduce una URL http o https válida.";
      }
    }
  }
  return errors;
}

interface CandidateFormProps {
  initial?: Candidate;
  onSave: (payload: CreateCandidatePayload) => Promise<Candidate>;
  onSuccess: (candidate: Candidate) => void;
  onCancel?: () => void;
}

export default function CandidateForm({ initial, onSave, onSuccess, onCancel }: CandidateFormProps) {
  const [fields, setFields] = useState<Fields>(initial ? {
    full_name: initial.full_name,
    email: initial.email,
    phone: initial.phone,
    position: initial.position,
    experience_years: String(initial.experience_years),
    linkedin_url: initial.linkedin_url ?? "",
    cv_url: initial.cv_url ?? "",
  } : emptyFields);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function change(name: FieldName, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setFeedback(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(fields);
    setErrors(nextErrors);
    setFeedback(null);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreateCandidatePayload = {
      full_name: fields.full_name.trim(),
      email: fields.email.trim(),
      phone: fields.phone.trim(),
      position: fields.position.trim(),
      experience_years: Number(fields.experience_years),
      linkedin_url: fields.linkedin_url.trim() || null,
      cv_url: fields.cv_url.trim() || null,
    };

    setSaving(true);
    try {
      const candidate = await onSave(payload);
      setFeedback(null);
      onSuccess(candidate);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo guardar la candidatura.");
    } finally {
      setSaving(false);
    }
  }

  const fieldList: { name: FieldName; label: string; type: string; required: boolean }[] = [
    { name: "full_name", label: "Nombre completo", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Teléfono", type: "tel", required: true },
    { name: "position", label: "Puesto", type: "text", required: true },
    { name: "experience_years", label: "Años de experiencia", type: "number", required: true },
    { name: "linkedin_url", label: "URL de LinkedIn", type: "url", required: false },
    { name: "cv_url", label: "URL del CV", type: "url", required: false },
  ];

  return (
    <form className="candidate-form" onSubmit={(event) => void submit(event)} noValidate>
      <div className="candidate-form-grid">
        {fieldList.map(({ name, label, type, required }) => (
          <div className="form-field" key={name}>
            <label htmlFor={`candidate-${name}`}>{label}{required && <span aria-hidden="true"> *</span>}</label>
            <input
              id={`candidate-${name}`}
              type={type}
              value={fields[name]}
              onChange={(event) => change(name, event.target.value)}
              min={name === "experience_years" ? 0 : undefined}
              step={name === "experience_years" ? "any" : undefined}
              aria-invalid={Boolean(errors[name])}
              aria-describedby={errors[name] ? `error-${name}` : undefined}
              disabled={saving}
            />
            {errors[name] && <span className="field-error" id={`error-${name}`}>{errors[name]}</span>}
          </div>
        ))}
      </div>
      {feedback && <p className="feedback feedback-error" role="alert">No se pudo guardar: {feedback}</p>}
      {saving && <p className="feedback" role="status">Guardando candidatura...</p>}
      <div className="form-actions">
        <button type="submit" disabled={saving}>{saving ? "Guardando..." : initial ? "Guardar cambios" : "Crear candidatura"}</button>
        {onCancel && <button type="button" className="secondary-button" onClick={onCancel} disabled={saving}>Cancelar</button>}
      </div>
    </form>
  );
}