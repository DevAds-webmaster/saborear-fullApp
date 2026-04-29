import { useEffect, useState } from "react";

import { ItemModal } from "./components/modal.component";
import { DishList } from "./components/DishList.component";
import type { Dish, Config, Style, Resto, Category } from "../types";
import { getDishImageUrl } from "../services/media";

interface CategorySectionProps {
  categoryName: string;
  categoryObject: Category;
  sizeClass?: string;
  resto: Resto;
  cart?: boolean;
}

export function CategorySection({ categoryName, categoryObject, sizeClass = "", resto, cart }: CategorySectionProps) {
  const [option, setOption] = useState<Config | undefined>(resto?.config);
  const [style, setStyle] = useState<Style | undefined>(resto?.style);
  const [modalData, setModalData] = useState<any>(null);

  useEffect(() => {
    setOption(resto?.config);
    setStyle(resto?.style);
  }, [resto]);

  return (
    <>
      <div className={`${sizeClass} p-4 w-full`}>
        <section className={`${style?.categorySectionStyles.container} justify-self-center p-4 w-full`}>
          <h2 className={`mb-4 text-center ${style?.categorySectionStyles.title}`}>{categoryName}</h2>
          <div className={`mx-10 ${style?.categorySectionStyles.descriptionText} ${style?.categorySectionStyles.descriptionBorder}`}>
            {categoryObject.config.descriptionCat && <center><p className="text-sm font-bold mb-4">{categoryObject.config.descriptionCat}</p></center>}
            {categoryObject.config.item1Cat && <li className="text-sm">{categoryObject.config.item1Cat}</li>}
            {categoryObject.config.item2Cat && <li className="text-sm">{categoryObject.config.item2Cat}</li>}
            {categoryObject.config.item3Cat && <li className="text-sm">{categoryObject.config.item3Cat}</li>}
            {categoryObject.config.item4Cat && <li className="text-sm">{categoryObject.config.item4Cat}</li>}
            {categoryObject.config.item5Cat && <li className="text-sm">{categoryObject.config.item5Cat}</li>}
            {categoryObject.config.item6Cat && <li className="text-sm">{categoryObject.config.item6Cat}</li>}
            {categoryObject.config.item7Cat && <li className="text-sm">{categoryObject.config.item7Cat}</li>}
            {categoryObject.config.item8Cat && <li className="text-sm">{categoryObject.config.item8Cat}</li>}
            {categoryObject.config.item9Cat && <li className="text-sm">{categoryObject.config.item9Cat}</li>}
            {categoryObject.config.item10Cat && <li className="text-sm">{categoryObject.config.item10Cat}</li>}
          </div>

          <DishList
            dishes={categoryObject.dishes as Dish[]}
            resto={resto}
            cart={cart}
            option={option}
            style={style}
            mode="category"
            categoryName={categoryObject.name}
            onOpenModal={(dish, categoryLabel) =>
              setModalData({
                image: getDishImageUrl(dish.image, 1000),
                category: categoryLabel,
                title: dish.title,
                description: dish.description,
                price: dish.price,
                discountPrice: dish.discountPrice,
                featuredText: dish.featuredText,
                featuredTextColor: dish.featuredTextColor,
                glutenFree: dish.glutenFree,
                veggie: dish.veggie,
              })
            }
          />
        </section>
      </div>
      <ItemModal open={!!modalData} onClose={() => setModalData(null)} {...modalData} />
    </>
  );
}

