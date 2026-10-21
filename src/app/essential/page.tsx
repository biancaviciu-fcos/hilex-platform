import { EssentialLibrary, type EssentialFilters } from "@/components/EssentialLibrary";

export const dynamic = "force-dynamic";

export default async function EssentialPage({ searchParams }: { searchParams: Promise<EssentialFilters> }) {
  const filters = await searchParams;
  return <EssentialLibrary filters={filters} home={!filters.q && !filters.category && filters.favorites !== "1"} />;
}
