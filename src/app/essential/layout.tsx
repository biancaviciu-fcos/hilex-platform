import { EssentialHeader } from "@/components/EssentialHeader";
import { getEssentialContent } from "@/lib/essential";
import "./essential.css";

export default async function EssentialLayout({ children }: { children: React.ReactNode }) {
  const { categories } = await getEssentialContent();
  return (
    <div className="essential-shell">
      <EssentialHeader categories={categories} />
      <div className="essential-workspace">
        {children}
        <footer className="essential-footer">HiLex Essential</footer>
      </div>
    </div>
  );
}
