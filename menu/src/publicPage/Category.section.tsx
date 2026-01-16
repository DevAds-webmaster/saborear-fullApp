// Importing libraries
import { useEffect,useState } from 'react'
import { useParams } from 'react-router-dom';


// Importing components
import { ItemModal } from './modal.component';
import type { Dish ,Config,Style, Resto, Category } from '../types';
import { getDishImageUrl } from '../services/media';
import { addToCart, loadCart, saveCart } from '../utils/cart';
import { SquarePlus } from 'lucide-react';

interface CategorySectionProps {
  categoryName: string;
  categoryObject: Category;
  sizeClass: string;
  resto: Resto;
  cart?: boolean;
}

export function CategorySection({categoryName,categoryObject,sizeClass,resto, cart}:CategorySectionProps) {

    const [option, setOption] = useState<Config | undefined>(resto?.config);
    const [style, setStyle] = useState<Style | undefined>(resto?.style);

    useEffect(()=>{
        setOption(resto?.config);
        setStyle(resto?.style);
    },[resto]);

    const { category } = useParams();

    // Estado para el modal
    const [modalData, setModalData] = useState<any>(null);
 
    const SectionCategoryMP = () => {
        console.log("style",style);
        return (
            <div className={sizeClass+" "}>
                <section key={category} className={" justify-self-center p-4 "+(style?.categorySectionStyles.container)+" "+(option?.optionsConfig.enableMultiPage && " mt-5  md:mx-4 ")}>
                    <h2 className={"mb-4 text-center "+(style?.categorySectionStyles.title)}>{categoryObject.name}</h2>
                    
                        
                            <div key={category} className={" mx-10 "+style?.categorySectionStyles.descriptionText+" "+ style?.categorySectionStyles.descriptionBorder}  >
                                {categoryObject.config.descriptionCat && <center><p className='text-sm font-bold mb-4'>{categoryObject.config.descriptionCat}</p></center>}
                                {categoryObject.config.item1Cat && <li className='text-sm'>{categoryObject.config.item1Cat}</li>}
                                {categoryObject.config.item2Cat && <li className='text-sm '>{categoryObject.config.item2Cat}</li>}
                                {categoryObject.config.item3Cat && <li className='text-sm '>{categoryObject.config.item3Cat}</li>}
                                {categoryObject.config.item4Cat && <li className='text-sm '>{categoryObject.config.item4Cat}</li>}
                                {categoryObject.config.item5Cat && <li className='text-sm '>{categoryObject.config.item5Cat}</li>}
                                {categoryObject.config.item6Cat && <li className='text-sm '>{categoryObject.config.item6Cat}</li>}
                                {categoryObject.config.item7Cat && <li className='text-sm '>{categoryObject.config.item7Cat}</li>}
                                {categoryObject.config.item8Cat && <li className='text-sm '>{categoryObject.config.item8Cat}</li>}
                                {categoryObject.config.item9Cat && <li className='text-sm '>{categoryObject.config.item9Cat}</li>}
                                {categoryObject.config.item10Cat && <li className='text-sm '>{categoryObject.config.item10Cat}</li>}
                            </div> 
                
                    

                    <ul className={style?.categorySectionStyles.itemsText}>
                    { 
                            
                            categoryObject.dishes.map((item:Dish, index:number) => 
                            (
                                ( item['available']== true && 
                                    (<li
                                        key={index}
                                        className={"flex justify-between align-middle gap-4 py-4 px-2 border-b last:border-b-0 border-b-gray-400 "+ (option?.optionsConfig.enableItemModals && item.image?.secure_url &&" "&&  style?.categorySectionStyles.itemHover)  }
                                        onClick={(() => option?.optionsConfig.enableItemModals && item.image?.secure_url &&  
                                                        setModalData({
                                                            image: getDishImageUrl(item.image, 1000),
                                                            category: categoryObject.name,
                                                            title: item.title,
                                                            description: item.description,
                                                            price: item.price,
                                                            discountPrice: item.discountPrice,
                                                            featuredText: item.featuredText,
                                                            featuredTextColor: item.featuredTextColor,
                                                            glutenFree: item.glutenFree,
                                                            veggie: item.veggie
                                                        }))
                                        }
                                        >
                                        {(item['featuredText'] && 
                                            <div className='featuredText' style={{color:item['featuredTextColor']||'#0f0'}}>{item['featuredText']}</div>
                                        )}
                                        
                                        {item.image?.secure_url && (
                                            <img
                                            src={getDishImageUrl(item.image, 240)}
                                            alt={item.title}
                                            className="w-20 h-20 object-cover rounded-md m-auto"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <div className={"font-bold italic text-lg "+(style?.categorySectionStyles.itemTitle)}>{item.title}</div>
                                            <div className={"text-sm "+(style?.categorySectionStyles.itemDescription)}>{
                                            (option?.optionsConfig.enableItemModals?
                                                (item.image?.secure_url && item.description.length > 100 ?item.description.substr(0,100)+'...' : item.description)
                                            : 
                                                item.description
                                            )
                                            }</div>
                                            <div className="flex flex-row ">
                                                {(item['glutenFree'] === true && 
                                                    <span className={"bg-yellow-300 p-1 mt-2 rounded-md float-right font-bold text-xs uppercase mx-1 "+style?.categorySectionStyles.tagsTextColor}>Sin TACC</span>
                                                )}
                                                {(item['veggie'] === true && 
                                                    <span className={"bg-green-600 p-1 mt-2 rounded-md float-right font-bold text-xs text-amber-50 uppercase mx-1 "+style?.categorySectionStyles.tagsTextColor}>Veggie</span>
                                                )}
                                            {item.discountPrice ? (
                                                <>
                                                <div className="ml-auto line-through text-gray-500 mr-2">
                                                    ${item.price.toFixed(2)}
                                                </div>
                                                <div className="text-green-600 font-semibold">
                                                    ${item.discountPrice.toFixed(2)}
                                                </div>
                                                </>
                                            ) : (
                                                <div className="ml-auto font-semibold">${item.price.toFixed(2)}</div>
                                            )}
                                            {cart && (
                                            <button
                                                type="button"
                                                className="ml-2 text-emerald-600 hover:text-emerald-700"
                                                title="Agregar al carrito"
                                                onClick={(e) => {
                                                e.stopPropagation();
                                                const slug = resto?.slug || '';
                                                const c = loadCart(slug);
                                                const next = addToCart(c, item, 1);
                                                saveCart(slug, next);
                                                try { window.dispatchEvent(new Event('cart:updated')); } catch {}
                                                const btn = (e.currentTarget as HTMLButtonElement);
                                                btn.classList.add('shake-blink');
                                                setTimeout(() => btn.classList.remove('shake-blink'), 1000);
                                                const btnCart = document.getElementById('btn-cart');
                                                if (btnCart) {
                                                    btnCart.classList.add('shake-blink-cart');
                                                    setTimeout(() => btnCart.classList.remove('shake-blink-cart'), 1000);
                                                }
                                                }}
                                            >
                                                <SquarePlus size={22} />
                                            </button>
                                            )}
                                            </div>
                                        </div>
                                        </li>
                                    )
                                )
                            ))
                                        
                                    
                    }
                    </ul>
                </section>
            </div>
        );
    }

    const SectionCategorySP = () => {
        return (
            <div className={sizeClass+" "}>
                <section className={" "+(style?.categorySectionStyles.container)+"  justify-self-center p-4 md:mx-4 "}>
                    <h2 className={"mb-4 text-center "+(style?.categorySectionStyles.title)}>{categoryName}</h2>
            
                    <div key={categoryName} className={" mx-10 "+style?.categorySectionStyles.descriptionText+" "+ style?.categorySectionStyles.descriptionBorder} >
                        {categoryObject['config']['descriptionCat'] && <center><p className='text-sm  font-bold mb-4'>{categoryObject['config']['descriptionCat']}</p></center>}
                        {categoryObject['config']['item1Cat'] && <li className='text-sm '>{categoryObject['config']['item1Cat']}</li>}
                        {categoryObject['config']['item2Cat'] && <li className='text-sm '>{categoryObject['config']['item2Cat']}</li>}
                        {categoryObject['config']['item3Cat'] && <li className='text-sm '>{categoryObject['config']['item3Cat']}</li>}
                        {categoryObject['config']['item4Cat'] && <li className='text-sm '>{categoryObject['config']['item4Cat']}</li>}
                        {categoryObject['config']['item5Cat'] && <li className='text-sm '>{categoryObject['config']['item5Cat']}</li>}
                        {categoryObject['config']['item6Cat'] && <li className='text-sm '>{categoryObject['config']['item6Cat']}</li>}
                        {categoryObject['config']['item7Cat'] && <li className='text-sm '>{categoryObject['config']['item7Cat']}</li>}
                        {categoryObject['config']['item8Cat'] && <li className='text-sm '>{categoryObject['config']['item8Cat']}</li>}
                        {categoryObject['config']['item9Cat'] && <li className='text-sm '>{categoryObject['config']['item9Cat']}</li>}
                        {categoryObject['config']['item10Cat'] && <li className='text-sm '>{categoryObject['config']['item10Cat']}</li>}
                    </div> 

                    <ul className={style?.categorySectionStyles.itemsText}>
                    {
                        categoryObject.dishes.map((item:Dish, index:number) => (
                        ( item['available'] === true && 
                            (<li
                                key={index}
                                className={"flex justify-between align-middle gap-4 py-4 px-2 border-b last:border-b-0 border-b-gray-400 "+ (option?.optionsConfig.enableItemModals && " " && style?.categorySectionStyles.itemHover)  }
                                onClick={(() => option?.optionsConfig.enableItemModals && item.image?.secure_url &&  
                                                setModalData({
                                                    image: getDishImageUrl(item.image, 1000),
                                                    category: category,
                                                    title: item.title,
                                                    description: item.description,
                                                    price: item.price,
                                                    discountPrice: item.discountPrice,
                                                    featuredText: item.featuredText,
                                                    featuredTextColor: item.featuredTextColor,
                                                    glutenFree: item.glutenFree,
                                                    veggie: item.veggie
                                                }))
                                }
                                >
                                {(item['featuredText'] && 
                                <div className='featuredText' style={{color:item['featuredTextColor']||'#0f0'}}>{item['featuredText']}</div>
                                )}
                                {item.image?.secure_url && (
                                <img
                                    src={getDishImageUrl(item.image, 240)}
                                    alt={item.title}
                                    className="w-20 h-20 object-cover rounded-md m-auto"
                                />
                                )}
                                <div className="flex-1">
                                <div className="font-bold italic text-lg">{item.title}</div>
                                <div className="text-sm text-gray-500">{
                                                            (option?.optionsConfig.enableItemModals?
                                                                (item.description.length > 100 ?item.description.substr(0,100)+'...' : item.description)
                                                            : 
                                                                item.description
                                                            )
                                }</div>
                                <div className="flex flex-row ">
                                    {(item['glutenFree'] === true && 
                                        <span className={"bg-yellow-300 p-1 mt-2 rounded-md float-right font-bold text-xs uppercase mx-1 "+style?.categorySectionStyles.tagsTextColor}>Sin TACC</span>
                                    )}
                                    {(item['veggie'] === true && 
                                        <span className={"bg-green-600 p-1 mt-2 rounded-md float-right font-bold text-xs text-amber-50 uppercase mx-1 "+style?.categorySectionStyles.tagsTextColor}>Veggie</span>
                                    )}
                                    {item.discountPrice ? (
                                    <>
                                        <div className="ml-auto line-through text-gray-500 mr-2">
                                        ${item.price.toFixed(2)}
                                        </div>
                                        <div className="text-green-600 font-semibold">
                                        ${item.discountPrice.toFixed(2)}
                                        </div>
                                    </>
                                    ) : (
                                    <div className="ml-auto font-semibold">${item.price.toFixed(2)}</div>
                                    )}
                                    {cart && (
                                      <button
                                        type="button"
                                        className="ml-2 text-emerald-600 hover:text-emerald-700"
                                        title="Agregar al carrito"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const slug = resto?.slug || '';
                                          const c = loadCart(slug);
                                          const next = addToCart(c, item, 1);
                                          saveCart(slug, next);
                                          try { window.dispatchEvent(new Event('cart:updated')); } catch {}
                                          const btn = (e.currentTarget as HTMLButtonElement);
                                          btn.classList.add('shake-blink');
                                          setTimeout(() => btn.classList.remove('shake-blink'), 1000);
                                        }}
                                      >
                                        <SquarePlus size={22} />
                                      </button>
                                    )}
                                </div>
                                </div>
                            </li>
                            )
                        )
                        ))
                    }
                    </ul>
                </section>
            </div>
        );
    }

    return (
        <>
            {(option?.optionsConfig.enableMultiPage ?
                <SectionCategoryMP />
            :
                <SectionCategorySP />
            )}
            {/* Modal */}
            <ItemModal
            open={!!modalData}
            onClose={() => setModalData(null)}
            {...modalData}
            />
        </>
    );
   
}

