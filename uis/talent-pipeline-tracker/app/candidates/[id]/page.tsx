import CandidateDetail from "./candidate-detail";

export default async function CandidatePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  return <CandidateDetail id={id} created={created === "1"} />;
}
