import type { Category } from "../../types";

export function getVisibleSortedCategories(categories?: Category[]): Category[] {
  if (!categories) return [];

  return categories
    .filter((category) => category.config.availableCat && category.dishes.length > 0)
    .sort((a, b) => {
      const aOrder = Number(a.config.orderCat) || 0;
      const bOrder = Number(b.config.orderCat) || 0;
      return aOrder - bOrder;
    });
}
