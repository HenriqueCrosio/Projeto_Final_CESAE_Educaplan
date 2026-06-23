import { getShopCatalog, getMyCollection, getChestsAndBoosts } from "@/actions/shop.actions";
import { getMyGameProfile } from "@/actions/gamification.actions";
import { RewardShop } from "@/components/student/shop/reward-shop";

export const dynamic = "force-dynamic";

export default async function RecompensasPage() {
  const [catalog, collection, game, extras] = await Promise.all([
    getShopCatalog(),
    getMyCollection(),
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
      collection={collection.map((c) => ({
        id: c.item.id,
        code: c.item.code,
        type: c.item.type,
        name: c.item.name,
        rarity: c.item.rarity,
        payload: c.item.payload,
        acquiredAt: c.acquiredAt,
      }))}
    />
  );
}
