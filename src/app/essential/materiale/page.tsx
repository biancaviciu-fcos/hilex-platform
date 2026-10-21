import { EssentialLibrary, type EssentialFilters } from "@/components/EssentialLibrary";

export default async function EssentialVideosPage({ searchParams }: { searchParams: Promise<EssentialFilters> }) {
  return <EssentialLibrary filters={await searchParams} />;
}
