import { CategorySection } from "./Category.section";
import type { Resto, Category } from "../types";
import { useMemo } from "react";
import { getVisibleSortedCategories } from "./utils/categories";

interface CategoriesLayoutProps {
  resto: Resto | null;
  cart?: boolean;
}




export const CategoriesLayout: React.FC<CategoriesLayoutProps> = ({ resto, cart }) => {
  const categories: Category[] = useMemo(() => getVisibleSortedCategories(resto?.menu.categories), [resto]);

  return (
    <div className="flex flex-col place-content-center py-4 px-4">
      {categories.map((categoryObject) => (
        <CategorySection
          key={categoryObject.name}
          categoryName={categoryObject.name}
          categoryObject={categoryObject}
          sizeClass="w-full"
          resto={resto as Resto}
          cart={cart}
        />
      ))}
    </div>
  );

}

