import ItemsReference from "../../components/items-reference";
import PageNavigation from "../../components/page-navigation";
import { getBrowseItems } from "../../lib/data/items";

export default function ItemsPage() {
  const items = getBrowseItems();

  return (
    <main style={{ margin: "0 auto", maxWidth: "980px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <h1 style={{ marginTop: 0 }}>Items</h1>
      <ItemsReference items={items} />
    </main>
  );
}
