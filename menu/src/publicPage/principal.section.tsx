import { useEffect, useState } from "react";

import { ItemModal } from "./components/modal.component";
import { DishList } from "./components/DishList.component";

import type { Category, Config, Dish, Resto, Style, MDC } from "../types";
import { getDishImageUrl } from "../services/media";

interface PrincipalSectionProps {
  resto: Resto | null;
  cart?: boolean;
}


export const PrincipalSection: React.FC<PrincipalSectionProps> = ({ resto, cart }) => {
  const [option, setOption] = useState<Config | undefined>();
  const [style, setStyle] = useState<Style | undefined>();
  const [modalData, setModalData] = useState<any>(null);
  const [menuDia, setMenuDia] = useState<Dish[] | undefined>([]);
  const [menuDayConfig, setMenuDayConfig] = useState<MDC | undefined>();

  useEffect(() => {
    setOption(resto?.config);
    setStyle(resto?.style);
  }, [resto]);

  useEffect(() => {
    const dayDishes = resto?.menu.categories.flatMap((category: Category) =>
      category.dishes
        .filter((dish: Dish) => dish.dayDish === true && dish.available === true)
        .map((dish: Dish) => ({
          ...dish,
          category: category.name,
        }))
    );

    setMenuDia(dayDishes);
    setMenuDayConfig(resto?.menu.menu_day_config);
  }, [resto]);



    
  return (
    <section key="menu-dia" className={`py-4 mx-4 mt-4 ${style?.principalSectionStyles.container}`}>
      <h2 className={`mb-4 text-center ${style?.principalSectionStyles.title}`}>{menuDayConfig?.titleCat}</h2>

          
      <div key={"menu-day"} className={`mx-10 ${style?.principalSectionStyles.descriptionText} ${style?.principalSectionStyles.descriptionBorder}`}>
        {menuDayConfig?.descriptionCat && <center><p className="text-sm font-bold mb-4">{menuDayConfig?.descriptionCat}</p></center>}
        {menuDayConfig?.item1Cat && <li className="text-sm">{menuDayConfig?.item1Cat}</li>}
        {menuDayConfig?.item2Cat && <li className="text-sm">{menuDayConfig?.item2Cat}</li>}
        {menuDayConfig?.item3Cat && <li className="text-sm">{menuDayConfig?.item3Cat}</li>}
        {menuDayConfig?.item4Cat && <li className="text-sm">{menuDayConfig?.item4Cat}</li>}
        {menuDayConfig?.item5Cat && <li className="text-sm">{menuDayConfig?.item5Cat}</li>}
        {menuDayConfig?.item6Cat && <li className="text-sm">{menuDayConfig?.item6Cat}</li>}
        {menuDayConfig?.item7Cat && <li className="text-sm">{menuDayConfig?.item7Cat}</li>}
        {menuDayConfig?.item8Cat && <li className="text-sm">{menuDayConfig?.item8Cat}</li>}
        {menuDayConfig?.item9Cat && <li className="text-sm">{menuDayConfig?.item9Cat}</li>}
        {menuDayConfig?.item10Cat && <li className="text-sm">{menuDayConfig?.item10Cat}</li>}
      </div>
                
          
      <DishList
        dishes={menuDia || []}
        resto={resto}
        cart={cart}
        option={option}
        style={style}
        mode="principal"
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
      <ItemModal open={!!modalData} onClose={() => setModalData(null)} {...modalData} />
    </section>
  );

};

