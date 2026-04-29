import { SquarePlus } from "lucide-react";

import type { Config, Dish, Resto, Style } from "../../types";
import { getDishImageUrl } from "../../services/media";
import { addToCart, loadCart, saveCart } from "../../utils/cart";

interface DishListProps {
  dishes: Dish[];
  resto: Resto | null;
  cart?: boolean;
  option?: Config;
  style?: Style;
  mode: "principal" | "category";
  categoryName?: string;
  onOpenModal: (dish: Dish, categoryLabel: string) => void;
}

export function DishList({
  dishes,
  resto,
  cart,
  option,
  style,
  mode,
  categoryName,
  onOpenModal,
}: DishListProps) {
  const isPrincipal = mode === "principal";

  return (
    <ul className={isPrincipal ? `grid grid-cols-1 lg:grid-cols-2 gap-6 py-4 sm:px-4 ${style?.principalSectionStyles.itemsText || ""}` : style?.categorySectionStyles.itemsText}>
      {dishes.map((dish, index) => {
        if (!dish.available) return null;

        const categoryLabel = categoryName || (dish as Dish & { category?: string }).category || "";
        const hoverClass = isPrincipal ? style?.principalSectionStyles.itemHover : style?.categorySectionStyles.itemHover;

        return (
          <li
            key={`${dish.title}-${index}`}
            className={
              isPrincipal
                ? `flex flex-row items-start justify-between gap-4 px-3 w-full h-full py-5 place-self-center ${style?.principalSectionStyles.itemContainer || ""} ${option?.optionsConfig.enableItemModals && dish.image?.secure_url ? hoverClass || "" : ""}`
                : `flex justify-between align-middle gap-4 py-4 px-2 border-b last:border-b-0 border-b-gray-400 ${option?.optionsConfig.enableItemModals && dish.image?.secure_url ? hoverClass || "" : ""}`
            }
            onClick={() => option?.optionsConfig.enableItemModals && dish.image?.secure_url && onOpenModal(dish, categoryLabel)}
          >
            {dish.featuredText && <div className="featuredText" style={{ color: dish.featuredTextColor || "#0f0" }}>{dish.featuredText}</div>}
            {dish.image?.secure_url && <img src={getDishImageUrl(dish.image, 240)} alt={dish.title} className={isPrincipal ? "w-20 h-30 object-cover rounded-md place-self-center" : "w-20 h-20 object-cover rounded-md m-auto"} />}
            <div className={isPrincipal ? `flex-1 ${style?.principalSectionStyles.itemsText || ""}` : "flex-1"}>
              {isPrincipal && (
                <div className="flex flex-row justify-end">
                  {dish.glutenFree === true && <span className={`bg-yellow-300 p-1 rounded-md float-right font-bold text-xs uppercase mx-1 ${style?.principalSectionStyles.tagsTextColor}`}>Sin TACC</span>}
                  {dish.veggie === true && <span className={`bg-green-600 p-1 rounded-md float-right font-bold text-xs text-amber-50 uppercase mx-1 ${style?.principalSectionStyles.tagsTextColor}`}>Veggie</span>}
                  <span className={`bg-white p-1 rounded-md float-right font-bold text-xs uppercase ${style?.principalSectionStyles.tagsTextColor}`}>{categoryLabel}</span>
                </div>
              )}
              {!isPrincipal && (
                <div className="flex flex-row ">
                  {dish.glutenFree === true && <span className={`bg-yellow-300 p-1 mt-2 rounded-md float-right font-bold text-xs uppercase mx-1 ${style?.categorySectionStyles.tagsTextColor}`}>Sin TACC</span>}
                  {dish.veggie === true && <span className={`bg-green-600 p-1 mt-2 rounded-md float-right font-bold text-xs text-amber-50 uppercase mx-1 ${style?.categorySectionStyles.tagsTextColor}`}>Veggie</span>}
                </div>
              )}
              <div className={isPrincipal ? "font-bold italic text-lg" : `font-bold italic text-lg ${style?.categorySectionStyles.itemTitle || ""}`}>{dish.title}</div>
              <div className={isPrincipal ? "text-sm text-gray-500" : `text-sm ${style?.categorySectionStyles.itemDescription || ""}`}>
                {option?.optionsConfig.enableItemModals
                  ? dish.image?.secure_url && dish.description.length > 100
                    ? `${dish.description.substr(0, 100)}...`
                    : dish.description
                  : dish.description}
              </div>
              <div className="flex flex-row ">
                {dish.discountPrice ? (
                  <>
                    <div className="ml-auto line-through text-gray-500 mr-2">${dish.price.toFixed(2)}</div>
                    <div className="text-green-600 font-semibold">${dish.discountPrice.toFixed(2)}</div>
                  </>
                ) : (
                  <div className="ml-auto font-semibold">${dish.price.toFixed(2)}</div>
                )}
                {cart && (
                  <button
                    type="button"
                    className="ml-2 text-emerald-600 hover:text-emerald-700"
                    title="Agregar al carrito"
                    onClick={(e) => {
                      e.stopPropagation();
                      const slug = resto?.slug || "";
                      const c = loadCart(slug);
                      const next = addToCart(c, dish, 1);
                      saveCart(slug, next);
                      try {
                        window.dispatchEvent(new Event("cart:updated"));
                      } catch {}
                      const btn = e.currentTarget as HTMLButtonElement;
                      btn.classList.add("shake-blink");
                      setTimeout(() => btn.classList.remove("shake-blink"), 1000);
                      const btnCart = document.getElementById("btn-cart");
                      if (btnCart) {
                        btnCart.classList.add("shake-blink-cart");
                        setTimeout(() => btnCart.classList.remove("shake-blink-cart"), 1000);
                      }
                    }}
                  >
                    <SquarePlus size={22} />
                  </button>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
