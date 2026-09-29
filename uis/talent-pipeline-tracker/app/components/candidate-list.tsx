import type { Candidate } from "@/types/candidate";
import CandidateRow from "./candidate-row";

export default function CandidateList({ candidates }: { candidates: Candidate[] }) {
  if (candidates.length === 0) {
    return <p className="empty-state">No se encontraron candidaturas.</p>;
  }

  return (
    <div className="list-container">
      <div className="list-heading" aria-hidden="true">
        <span>Candidatura</span>
        <span>Puesto</span>
        <span>Estado</span>
        <span>Etapa</span>
        <span>Ficha</span>
      </div>
      <ul className="candidate-list">
        {candidates.map((candidate) => <CandidateRow key={candidate.id} candidate={candidate} />)}
      </ul>
    </div>
  );
}