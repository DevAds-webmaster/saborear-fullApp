import { useEffect, useState } from 'react';
import { useResto } from '../contexts/RestoContext';
import type { Style } from '../types';
import { useLocation } from 'react-router-dom';

export function ItemModal({ open, onClose, image, category, title, description, price, discountPrice, featuredText, featuredTextColor, glutenFree, veggie}:any) {
  if (!open) return null;
  
  
  const {resto, restoPreview} = useResto();
  const location = useLocation();
  const isPreview = location.pathname.startsWith('/preview');
  const [style, setStyle] = useState<Style | undefined>();

  useEffect(()=>{
    setStyle((isPreview ? restoPreview : resto)?.style);
  },[resto, restoPreview, isPreview]);
  
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose} // Cierra al hacer click fuera
    >
      <div
        className={style?.modalsItemsStyles.container+" "+style?.modalsItemsStyles.textColor+" p-6 max-w-md w-full relative"}
        onClick={e => e.stopPropagation()} // No cierra al hacer click dentro
      >
        {featuredText && (
          <div className="mb-2 font-bold" style={{ color: featuredTextColor || "#0f0" }}>{featuredText}</div>
        )}
        {image && (
          <img src={image} alt={title} className="w-full h-56 object-cover rounded mb-4" />
        )}
        <span className={"bg-white p-1 rounded-md float-right font-bold text-xs uppercase "+style?.modalsItemsStyles.tagsTextColor}>{category}</span>
        {(glutenFree === 'si' && 
            <span className={"bg-yellow-300 p-1 rounded-md float-right font-bold text-xs uppercase mx-1 "+style?.modalsItemsStyles.tagsTextColor}>Sin TACC</span>
        )}
        {(veggie === 'si' && 
            <span className={"bg-green-600 p-1 rounded-md float-right font-bold text-xs text-amber-50 uppercase mx-1 "+style?.modalsItemsStyles.tagsTextColor}>Veggie</span>
        )}
        <div className="font-bold italic text-xl mb-2">{title}</div>
        <div className="mb-4">{description}</div>
        <div className="flex flex-row items-center">
          {discountPrice ? (
            <>
              <div className="line-through text-gray-500 mr-2">${price}</div>
              <div className="text-green-600 font-semibold">${discountPrice.toFixed(2)}</div>
            </>
          ) : (
            <div className="font-semibold">${price}</div>
          )}
        </div>
      </div>
    </div>
  );
}


export function ParamModal({ open, onClose, enableMod, imageMod, titleMod, descriptionMod,codePromMod, featuredTextMod, featuredTextColorMod}:any) {

  if (!open) return null;

  if (enableMod!=='si') return null; // Si el modal no está habilitado, no renderiza nada

  const {resto, restoPreview} = useResto();
  const location = useLocation();
  const isPreview = location.pathname.startsWith('/preview');
  const [style, setStyle] = useState<Style | undefined>();

  useEffect(()=>{
    setStyle((isPreview ? restoPreview : resto)?.style);
  },[resto, restoPreview, isPreview]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose} // Cierra al hacer click fuera
    >
      <div
        className={style?.modalsParamStyles.container+" "+style?.modalsParamStyles.textColor+" p-6 max-w-md w-full relative"}
        onClick={e => e.stopPropagation()} // No cierra al hacer click dentro
      >
        {featuredTextMod && (
          <div className="mb-2 font-bold" style={{ color: featuredTextColorMod || "#0f0" }}>{featuredTextMod}</div>
        )}
        {imageMod && (
          <img src={imageMod} alt={titleMod} className="w-full h-56 object-cover rounded mb-4" />
        )}
    
        <div className="font-bold italic text-xl mb-2">{titleMod}</div>
        <div className="mb-4">{descriptionMod}</div>
        {(codePromMod  && 
            <span className="bg-gray-800 p-1 rounded-md text-center font-bold text-md text-amber-50 uppercase mx-1">{codePromMod}</span>
        )}
      </div>
    </div>
  );
}

