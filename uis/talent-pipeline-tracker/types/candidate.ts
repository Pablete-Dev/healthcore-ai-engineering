export type CandidateStatus = "received" | "in_progress" | "selected" | "discarded";

export type CandidateStage =
  | "pending"
  | "review"
  | "personal_interview"
  | "technical_interview"
  | "offer_presented";

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string | null;
  cv_url: string | null;
  status: CandidateStatus;
  stage: CandidateStage;
  experience_years: number;
  notes_count: number;
  applied_at: string;
  updated_at: string;
}

export interface CandidateNote {
  id: string;
  record_id: string;
  content: string;
  created_at: string;
}

export interface CandidatesResponse {
  total: number;
  page: number;
  limit: number;
  data: Candidate[];
}

export interface NotesResponse {
  data: CandidateNote[];
  meta: {
    total: number;
  };
}

export type CreateCandidatePayload = Pick<
  Candidate,
  "full_name" | "email" | "phone" | "position" | "experience_years"
> &
  Partial<Pick<Candidate, "linkedin_url" | "cv_url">>;

export type UpdateCandidatePayload = CreateCandidatePayload;

export type PatchCandidatePayload =
  | Pick<Candidate, "status"> & Partial<Pick<Candidate, "stage">>
  | Pick<Candidate, "stage"> & Partial<Pick<Candidate, "status">>;

export type CreateCandidateNotePayload = Pick<CandidateNote, "content">;