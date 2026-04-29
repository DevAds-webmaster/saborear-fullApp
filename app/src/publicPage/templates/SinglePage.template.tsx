import { useEffect, useState } from "react";

import type { Config, Resto, Style } from "../../types";
import { PrincipalSection } from "../principal.section";
import { CategorySection } from "../Category.section";
import { getVisibleSortedCategories } from "../utils/categories";

interface SinglePageTemplateProps {
  resto: Resto | null;
  cart?: boolean;
}

export function SinglePageTemplate({ resto, cart }: SinglePageTemplateProps) {
  const [option, setOption] = useState<Config | undefined>();
  const [style, setStyle] = useState<Style | undefined>();

  useEffect(() => {
    setOption(resto?.config);
    setStyle(resto?.style);
  }, [resto]);

  const categories = getVisibleSortedCategories(resto?.menu.categories);

  return (
    <div className={`flex flex-col py-2 ${style?.categorySectionStyles.itemsText || ""}`}>
      <PrincipalSection resto={resto} cart={cart} />
      {categories.map((category) => (
        <CategorySection key={category.name} categoryName={category.name} categoryObject={category} sizeClass="w-full" resto={resto as Resto} cart={cart} />
      ))}
      <div className="hidden">{option?.template}</div>
    </div>
  );
}
