import { useEffect, useState } from 'react'

// Importing components
import { ItemModal } from './modal.component';


import type { Category, Config, Dish ,Resto, Style , MDC} from '../types';

// Importing data configuration
import { optionsConfig } from './macros';
import { principalSectionStyles } from './customStyles';

interface PrincipalSectionProps {
  resto: Resto | null;
}


export const PrincipalSection: React.FC<PrincipalSectionProps> = ({ resto }) => {


    const [option, setOption] = useState<Config | undefined>();
    const [style, setStyle] = useState<Style | undefined>();

    useEffect(()=>{
      setOption(resto?.config);
      setStyle(resto?.style);
    },[resto]);

    // Estado para el modal
    const [modalData, setModalData] = useState<any>(null);
    
    const [menuDia, setMenuDia] = useState<Dish[] | undefined>([]);
    const [menuDayConfig,setMenuDayConfig] =  useState<MDC | undefined>();

    useEffect(()=>{
        const dayDishes = resto?.menu.categories.flatMap((category:Category) =>
            category.dishes
              .filter((dish:Dish) => (dish.dayDish === true && dish.available === true))
              .map((dish:Dish) => ({
                ...dish,
                category: category.name, // 👈 agrega el nombre de la categoría
              }))
          );
  
        setMenuDia(dayDishes);

        setMenuDayConfig(resto?.menu.menu_day_config);

    },[resto]);



    
    return(
        <section key="menu-dia" className= {"py-4 m-4 "+style?.principalSectionStyles.container}>
          <h2 className={"mb-4 text-center "+(style?.principalSectionStyles.title)}>{menuDayConfig?.titleCat}</h2>

          
              <div key={'menu-day'} className={" mx-10 " +style?.principalSectionStyles.descriptionText+" "+ style?.principalSectionStyles.descriptionBorder}>
                {menuDayConfig?.descriptionCat && <center><p className='text-sm font-bold mb-4'>{menuDayConfig?.descriptionCat }</p></center>}
                {menuDayConfig?.item1Cat && <li className='text-sm '>{menuDayConfig?.item1Cat }</li>}
                {menuDayConfig?.item2Cat && <li className='text-sm '>{menuDayConfig?.item2Cat }</li>}
                {menuDayConfig?.item3Cat && <li className='text-sm '>{menuDayConfig?.item3Cat }</li>}
                {menuDayConfig?.item4Cat && <li className='text-sm '>{menuDayConfig?.item4Cat }</li>}
                {menuDayConfig?.item5Cat && <li className='text-sm '>{menuDayConfig?.item5Cat }</li>}
                {menuDayConfig?.item6Cat && <li className='text-sm '>{menuDayConfig?.item6Cat }</li>}
                {menuDayConfig?.item7Cat && <li className='text-sm '>{menuDayConfig?.item7Cat }</li>}
                {menuDayConfig?.item8Cat && <li className='text-sm '>{menuDayConfig?.item8Cat }</li>}
                {menuDayConfig?.item9Cat && <li className='text-sm '>{menuDayConfig?.item9Cat }</li>}
                {menuDayConfig?.item10Cat && <li className='text-sm '>{menuDayConfig?.item10Cat }</li>}
              </div> 
                
          
              

          <ul className={"grid grid-cols-1 lg:grid-cols-2 gap-6 py-4 sm:px-4 "+style?.principalSectionStyles.itemsText}> 
          {  menuDia?.map((Dish,index) => 
              (

                <li 
                  key={index} 
                  className={"flex flex-row items-start justify-between gap-4 px-3 w-full h-full  py-5 place-self-center "+(style?.principalSectionStyles.itemContainer) +" " + (option?.optionsConfig.enableItemModals &&" "&& style?.principalSectionStyles.itemHover)}
                  onClick={()=> (
                    option?.optionsConfig.enableItemModals && 
                            Dish.image && (() => setModalData({
                                                  image: "/assets/menu-fotos/" + Dish.image,
                                                  category: Dish.category,
                                                  title: Dish.title,
                                                  description: Dish.description,
                                                  price: Dish.price,
                                                  discountPrice: Dish.discountPrice,
                                                  featuredText: Dish.featuredText,
                                                  featuredTextColor: Dish.featuredTextColor,
                                                  glutenFree: Dish.glutenFree,
                                                  veggie: Dish.veggie
                                              }))
                    )}
                  >
                  {(Dish['featuredText'] && 
                    <div className='featuredText' style={{color:Dish['featuredTextColor']||'#0f0'}}>{Dish['featuredText']}</div>
                  )}
                  {Dish.image && (
                  <img src={"./assets/menu-fotos/"+Dish.image} alt={Dish.title} className="w-20 h-30 object-cover rounded-md place-self-center" />
                  )}
                  <div className="flex-1">
                   
                    <div className="flex flex-row justify-end">  
                     
                      {(Dish['glutenFree'] === true && 
                        <span className={"bg-yellow-300 p-1  rounded-md float-right font-bold text-xs uppercase mx-1 "+style?.principalSectionStyles.tagsTextColor}>Sin TACC</span>
                      )}
                      {(Dish['veggie'] === true && 
                          <span className={"bg-green-600 p-1 rounded-md float-right font-bold text-xs text-amber-50 uppercase mx-1 "+style?.principalSectionStyles.tagsTextColor}>Veggie</span>
                      )}
                       <span className={"bg-white p-1 rounded-md float-right font-bold text-xs uppercase "+style?.principalSectionStyles.tagsTextColor}>{Dish.category}</span>
                    </div>
                    <div className="font-bold italic text-lg">{Dish.title}</div>
                    {
                      Dish.description?
                      <div className="text-sm text-gray-500">{(Dish.description.length > 100 ?Dish.description.substr(0,100)+'...' : Dish.description)}</div>  
                      :
                      <></>
                    }<div className="flex flex-row ">
                      

                          {Dish.discountPrice ? (
                            <>
                              <div className="ml-auto line-through text-gray-500 mr-2">
                                ${Dish.price.toFixed(2)}
                              </div>
                              <div className="text-green-600 font-semibold">
                                ${Dish.discountPrice.toFixed(2)}
                              </div>
                            </>
                          ) : (
                            <div className="ml-auto font-semibold">
                              ${Dish.price.toFixed(2)}
                            </div>
                          )}
                    </div>
                  </div>
                </li>
              )
            )
          }
          </ul>
          {/* Modal */}
          <ItemModal
            open={!!modalData}
            onClose={() => setModalData(null)}
            {...modalData}
          />
        </section>

    );

}