import { useEffect, useMemo, useState } from "react";

import { usePublic } from "../../contexts/PublicContext";
import type { Category, Config, Resto, Style } from "../../types";
import { PrincipalSection } from "../principal.section";
import { CategorySection } from "../Category.section";
import { ButtonCategory } from "../components/button.component";
import { getVisibleSortedCategories } from "../utils/categories";

interface MultiPageTemplateProps {
  resto: Resto | null;
  cart?: boolean;
}

export function MultiPageTemplate({ resto, cart }: MultiPageTemplateProps) {
  const [option, setOption] = useState<Config | undefined>();
  const [style, setStyle] = useState<Style | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { setSelectedCategoryName, setMultiPageBackHandler } = usePublic();

  useEffect(() => {
    setOption(resto?.config);
    setStyle(resto?.style);
  }, [resto]);

  const categories = useMemo(() => getVisibleSortedCategories(resto?.menu.categories), [resto]);

  useEffect(() => {
    setSelectedCategoryName(selectedCategory?.name || null);
  }, [selectedCategory, setSelectedCategoryName]);

  useEffect(() => {
    setMultiPageBackHandler(selectedCategory ? () => setSelectedCategory(null) : null);
    return () => setMultiPageBackHandler(null);
  }, [selectedCategory, setMultiPageBackHandler]);

  return (
    <div className={`flex flex-col py-2 ${style?.categorySectionStyles.itemsText || ""}`}>


      {!selectedCategory ? (
        <>
          <PrincipalSection resto={resto} cart={cart} />
          <section className="w-full px-4 py-2 flex flex-col gap-2">
            {categories.map((category) => (
              <ButtonCategory
                key={category.name}
                title={category.name}
                sizeClass="w-full"
                classButton={style?.categorySectionStyles.container}
                classTitle={style?.categorySectionStyles.title}
                onClick={() => setSelectedCategory(category)}
              />
            ))}
          </section>
        </>
      ) : (
        <CategorySection
          categoryName={selectedCategory.name}
          categoryObject={selectedCategory}
          sizeClass="w-full"
          resto={resto as Resto}
          cart={cart}
        />
      )}

      <div className="hidden">{option?.template}</div>
    </div>
  );
}
