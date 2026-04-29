import { twMerge } from "tailwind-merge";

interface ButtonCategoryProps {
  title: string;
  srcImg?: string;
  sizeClass?: string;
  classButton?: string;
  classText?: string;
  onClick?: () => void;
}

/** Estilos por defecto del botón; las mismas utilidades en `classButton` las reemplazan (tailwind-merge). */
const defaultButtonClass =
  "content-center rounded-md items-center justify-center object-cover h-40 bg-gray-300 bg-cover bg-center bg-no-repeat hover:bg-top";

export function ButtonCategory({
  title,
  srcImg,
  sizeClass = "",
  classButton,
  classText,
  onClick,
}: ButtonCategoryProps) {
  const bgImage = srcImg ? srcImg.replaceAll(" ", "_") : undefined;

  return (
    <div className={twMerge("w-full p-2", sizeClass)}>
      <button
        type="button"
        style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
        className={twMerge("block w-full", defaultButtonClass, classButton)}
        onClick={onClick}
      >
        <h2 className={twMerge(classText)}>{title}</h2>
      </button>
    </div>
  );
}
