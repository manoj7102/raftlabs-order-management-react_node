import type { MenuItem } from "../api";
import { fallbackArt } from "../art";

export function DishImage({
  item,
  eager = false,
}: {
  item: MenuItem;
  eager?: boolean;
}) {
  return (
    <img
      src={item.image || fallbackArt(item.name)}
      alt={item.name}
      loading={eager ? "eager" : "lazy"}
      onError={(event) => {
        const image = event.currentTarget;
        image.onerror = null;
        image.src = fallbackArt(item.name);
      }}
    />
  );
}
