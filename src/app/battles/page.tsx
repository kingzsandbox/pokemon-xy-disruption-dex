import BattlesReference from "@/components/battles-reference";
import PageNavigation from "@/components/page-navigation";
import { getBattles } from "@/lib/data/battles";

export default function BattlesPage() {
  const battles = getBattles();

  return (
    <main style={{ margin: "0 auto", maxWidth: "1200px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <BattlesReference battles={battles} embedded />
    </main>
  );
}
