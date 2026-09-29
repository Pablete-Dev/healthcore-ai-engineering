import type {
  Candidate,
  CandidateNote,
  CandidatesResponse,
  CandidateStage,
  CandidateStatus,
  CreateCandidatePayload,
  CreateCandidateNotePayload,
  NotesResponse,
  PatchCandidatePayload,
  UpdateCandidatePayload,
} from "@/types/candidate";

export interface GetCandidatesOptions {
  page?: number;
  limit?: number;
  status?: CandidateStatus;
  stage?: CandidateStage;
  search?: string;
}

function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return apiUrl.replace(/\/+$/, "");
}

function getBackendError(body: string): string {
  try {
    const error: unknown = JSON.parse(body);
    if (typeof error === "object" && error !== null) {
      const details = error as Record<string, unknown>;
      const message = [details.message, details.error, details.detail].find(
        (value): value is string => typeof value === "string",
      );
      if (message) return message;
    }
  } catch {
    return body;
  }
  return body;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, options);

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const message = getBackendError(body) || response.statusText || "Unknown error";
    throw new Error(`API request failed (${response.status}): ${message}`);
  }

  const body = await response.text();
  return body ? (JSON.parse(body) as T) : (undefined as T);
}

export async function getCandidates(
  options: GetCandidatesOptions = {},
): Promise<CandidatesResponse> {
  const params = new URLSearchParams();
  if (options.page !== undefined) params.set("page", String(options.page));
  if (options.limit !== undefined) params.set("limit", String(options.limit));
  if (options.status !== undefined) params.set("status", options.status);
  if (options.stage !== undefined) params.set("stage", options.stage);
  if (options.search !== undefined) params.set("search", options.search);

  const query = params.toString();
  return request<CandidatesResponse>(`/records${query ? `?${query}` : ""}`);
}

export async function getCandidate(id: string): Promise<Candidate> {
  return request<Candidate>(`/records/${encodeURIComponent(id)}`);
}

export async function getCandidateNotes(id: string): Promise<NotesResponse> {
  return request<NotesResponse>(`/records/${encodeURIComponent(id)}/notes`);
}

export async function createCandidate(
  payload: CreateCandidatePayload,
): Promise<Candidate> {
  return request<Candidate>("/records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateCandidate(
  id: string,
  payload: UpdateCandidatePayload,
): Promise<Candidate> {
  return request<Candidate>(`/records/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function patchCandidate(
  id: string,
  payload: PatchCandidatePayload,
): Promise<Candidate> {
  return request<Candidate>(`/records/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function createCandidateNote(
  id: string,
  content: string,
): Promise<CandidateNote> {
  const payload: CreateCandidateNotePayload = { content };
  return request<CandidateNote>(`/records/${encodeURIComponent(id)}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteCandidateNote(
  candidateId: string,
  noteId: string,
): Promise<void> {
  return request<void>(
    `/records/${encodeURIComponent(candidateId)}/notes/${encodeURIComponent(noteId)}`,
    { method: "DELETE" },
  );
}