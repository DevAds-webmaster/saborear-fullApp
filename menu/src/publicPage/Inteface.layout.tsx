// Importing libraries


// Importing components
import { PrincipalSection } from './principal.section';
import { CategoriesLayout } from './Categories.layout';
import { usePublic } from '../contexts/PublicContext';
import { useResto } from '../contexts/RestoContext';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';


function Interface({mode}:any) {
  const [searchParams] = useSearchParams();
  const cart = searchParams.get('cart') === 'true';
  const {resto: publicResto} = usePublic();
  const {restoPreview} = useResto();
  
  // Determinar instancia de restaurante a usar según el modo
  let currentResto = mode === "preview" ? restoPreview : publicResto;

  mode === "preview" ?  console.log('modePreview',restoPreview) :  console.log('modePublic',publicResto);
 
  useEffect(()=>{
    currentResto = mode === "preview" ? restoPreview : publicResto;
  },[restoPreview,publicResto])

  return (
    <>
      {/* seccion principal */}
      <PrincipalSection resto={currentResto} cart={cart} />

      {/* seccion por categorias */}
      <CategoriesLayout resto={currentResto} cart={cart} />
    </>
    
  );
}

export default Interface

