
import {ButtonCategory} from './button.component.tsx';
import {CategorySection} from './Category.section';


import type { Menu ,Resto ,Category} from '../types';
import { useEffect, useState } from 'react'
//importing Options Config
import { optionsConfig } from './macros';

interface CategoriesLayoutProps {
  resto: Resto | null;
}




export const CategoriesLayout: React.FC<CategoriesLayoutProps> = ({ resto }) => {

   // Estado para el modal
   const [modalData, setModalData] = useState<any>(null);
    
   const [menu, setMenu] = useState<Category[] | undefined>([]);

   useEffect(()=>{
      const getMenu=()=>{
        const dishes = resto?.menu.categories;
        setMenu(dishes);
        console.log('dishes',dishes);
      };
      getMenu();
   },[]);


   return (
    <div className="flex flex-wrap place-content-center ">
      {
        // Filtrar categorías que no son 'Menu Del Dia', no están vacías y están disponibles
        menu
          ?.filter((category: Category) => category.config.availableCat)
          ?.sort((aObj, bObj) => {
            const aOrder = Number(aObj.config.orderCat) || 0;
            const bOrder = Number(bObj.config.orderCat) || 0;
            return aOrder - bOrder;
          })
          ?.map((categoryObject, idx) => {
            const categoryName = categoryObject.name; // ajusta si tu propiedad se llama distinto
  
            const isLastOne =
              categoryObject.dishes.length % 3 === 1 &&
              idx > categoryObject.dishes.length - 2;
  
            const isLastTwo =
              categoryObject.dishes.length % 3 === 2 &&
              idx > categoryObject.dishes.length - 3;
  
            const sizeClass = isLastOne
              ? "w-full"
              : isLastTwo
              ? "md:w-1/2 w-full"
              : "xl:w-1/3 md:w-1/2 w-full";
  
            if (categoryObject.dishes.length === 0) return null;
            if (categoryObject.config.availableCat === false) return null;
  
            return (
              <CategorySection
                key={categoryName}
                categoryName={categoryName}
                categoryObject={categoryObject}
                sizeClass={sizeClass}
              />
            );
          })
      }
    </div>
  );

}