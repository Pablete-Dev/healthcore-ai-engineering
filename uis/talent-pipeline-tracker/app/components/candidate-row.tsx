import Link from "next/link";
import type { Candidate } from "@/types/candidate";
import { stageLabels, statusLabels } from "../candidate-labels";

export default function CandidateRow({ candidate }: { candidate: Candidate }) {
  return (
    <li className="candidate-row">
      <div className="candidate-person">
        <strong>{candidate.full_name}</strong>
        <span>{candidate.email}</span>
      </div>
      <span className="candidate-position" data-label="Puesto">{candidate.position}</span>
      <span className={`candidate-status status-${candidate.status}`} data-label="Estado">
        {statusLabels[candidate.status]}
      </span>
      <span className="candidate-stage" data-label="Etapa">{stageLabels[candidate.stage]}</span>
      <Link className="candidate-link" href={`/candidates/${encodeURIComponent(candidate.id)}`} aria-label={`Ver detalle de ${candidate.full_name}`}>
        Ver detalle <span aria-hidden="true">→</span>
      </Link>
    </li>
  );
}