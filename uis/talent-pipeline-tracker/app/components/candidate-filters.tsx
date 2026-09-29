"use client";

import { stageLabels, statusLabels } from "../candidate-labels";

type FilterName = "search" | "status" | "stage";

interface CandidateFiltersProps {
  search: string;
  status: string;
  stage: string;
  onChange: (name: FilterName, value: string) => void;
}

export default function CandidateFilters({ search, status, stage, onChange }: CandidateFiltersProps) {
  return (
    <div className="filters">
      <form
        className="search-form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const value = new FormData(event.currentTarget).get("search")?.toString().trim() ?? "";
          onChange("search", value);
        }}
      >
        <label htmlFor="candidate-search">Nombre o email</label>
        <div className="search-controls">
          <input
            id="candidate-search"
            key={search}
            name="search"
            type="search"
            defaultValue={search}
            placeholder="Buscar candidaturas"
          />
          <button type="submit">Buscar</button>
        </div>
      </form>
      <div className="filter-selects">
        <div className="filter-field">
          <label htmlFor="candidate-status">Estado</label>
          <select id="candidate-status" value={status} onChange={(event) => onChange("status", event.target.value)}>
            <option value="">Todos los estados</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="candidate-stage">Etapa</label>
          <select id="candidate-stage" value={stage} onChange={(event) => onChange("stage", event.target.value)}>
            <option value="">Todas las etapas</option>
            {Object.entries(stageLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}