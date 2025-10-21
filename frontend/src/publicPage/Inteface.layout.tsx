// Importing libraries


// Importing components
import { PrincipalSection } from './principal.section';
import { CategoriesLayout } from './Categories.layout';
import { usePublic } from '../contexts/PublicContext';
import { useResto } from '../contexts/RestoContext';


function Interface({mode}:any) {
  const {resto: publicResto} = usePublic();
  const {restoPreview} = useResto();
  
  // Determinar qué restaurante usar basado en el modo
  const currentResto = mode === "preview" ? restoPreview : publicResto;

  mode === "preview" ?  console.log('modePreview',restoPreview) :  console.log('modePublic',publicResto);
 

  return (
    <>
      {/* seccion principal */}
      <PrincipalSection resto={currentResto} />

      {/* seccion por categorias */}
      <CategoriesLayout resto={currentResto} />
    </>
    
  );
}

export default Interface
