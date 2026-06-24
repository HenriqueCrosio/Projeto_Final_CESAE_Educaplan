import { getShopCatalog, getChestsAndBoosts } from "@/actions/shop.actions";
import { getMyGameProfile } from "@/actions/gamification.actions";
import { RewardShop } from "@/components/student/shop/reward-shop";

export const dynamic = "force-dynamic";

export default async function RecompensasPage() {
  const [catalog, game, extras] = await Promise.all([
    getShopCatalog(),
    getMyGameProfile(),
    getChestsAndBoosts(),
  ]);

  return (
    <RewardShop
      items={catalog.items}
      books={catalog.books}
      level={game.level}
      xp={game.xp}
      levelInto={game.levelInto}
      levelNeeded={game.levelNeeded}
      chests={extras.chests}
      boosts={extras.boosts}
      activeBoost={extras.activeBoost}
    />
  );
}
