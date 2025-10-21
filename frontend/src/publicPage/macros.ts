
/* se encarga de mappear los nopmbres de los encabezados que escribimos en la hoja de google sheets con los campos reconocidos en el código */
export const fieldMapping = {
    Categoría: "category",
    Título: "title",
    Descripción: "description",
    Precio: "price",
    PrecioDescuento: "discountPrice",
    MenuDelDia: "menu-dia",
    Disponible: "available",
    SinTACC: "glutenFree",
    Veggie: "veggie",
    Imagen: "image",
    TextoDestacado: "featuredText",
    ColorTextoDestacado: "featuredTextColor",
    EnDisplayDePaso: "display-de-paso",
    'EnDisplayComercial-1': "dc-1",
    'EnDisplayComercial-2': "dc-2",
    'EnDisplayComercial-3': "dc-3",
    
    
    NombreCat: "nameCat",
    DisponibleCat: "availableCat",
    OrdenCat: "orderCat",
    DescripcionCat: "descriptionCat",
    Item1Cat: "item1Cat",
    Item2Cat: "item2Cat",
    Item3Cat: "item3Cat",
    Item4Cat: "item4Cat",
    Item5Cat: "item5Cat",
    Item6Cat: "item6Cat",
    Item7Cat: "item7Cat",
    Item8Cat: "item8Cat",
    Item9Cat: "item9Cat",
    Item10Cat: "item10Cat",

    ParametroMod: "paramMod",
    HabilitadoMod:"enableMod",
    ImagenMod:"imageMod",
    TituloMod:"titleMod",
    DescripcionMod:"descriptionMod",
    CodigoPromoMod:"codePromMod",
    TextoDestacadoMod:"featuredTextMod",
    ColorTextoDestacadoMod:"featuredTextColorMod",

    'DSP-IdDisplay':'DSP-IdDisplay',
    'DSP-Titulo': 'DSP-Title',
    'DSP-Descripcion': 'DSP-Description',
    'DSP-item1'	: 'DSP-item1',
    'DSP-item2'	: 'DSP-item2',
    'DSP-item3'	: 'DSP-item3',
    'DSP-ImagenFondo': 'DSP-bgImage',
  };

/* Variables de configuración de la app */
export const appName = "Saborear - Menú Digital";
export const appVersion = "1.0.0";
export const appDescription = "Un menú digital interactivo para restaurantes y bares, con opciones personaizadas";

export const headerOptions = {
  enableFacebookBtn: true, // Si se quiere que se muestre el botón de Facebook
  enableInstagramBtn: true, // Si se quiere que se muestre el botón de Instagram
  enableXBtn: true, // Si se quiere que se muestre el botón de Twitter
  enableFacebookLink: "https://www.facebook.com/mi_resto", // Si se quiere que se muestre el link a la página de Facebook
  enableInstagramLink: "https://www.instagram.com/mi_resto", // Si se quiere que se muestre el link a la página de Instagram
  enableXLink: "https://x.com/mi_resto", // Si se quiere que se muestre el link a la página de Twitter
}

export const optionsConfig = {
  enableMultiPage: false, // Si se quiere que la app funcione como una multi-page, con rutas para cada categoria
  enableItemModals: true, // Si se quiere que se muestren los modales de los diferentes platos
  enableParamModals: true, // Si se quiere que se muestren los modales de promociones al recibir parametros en la URL
  enableDisplayDePaso: true, // Si se quiere que la app pueda ser visualizada en minitor iteractivo en vereda
  enableCommercialDisplay: false, // Si se quiere que la app pueda ser visualizada en pantalla comercial
  qtyCommercialDisplay: 3, // Cantidad de displays comerciales que se quieren mostrar
};

/* variables para configuracion de display externo de paso*/
export const optionsDisplayDePaso = {
  sectionTitle : "Especialidades de hoy", // Título del display display de paso
  bgImage: "assets/goku.gif", // Imagen de fondo del display de paso
  enableItemModals: true, // Si se quiere que se muestren los modales de los diferentes platos
  delayCloseModal: 20000, // Tiempo en milisegundos para cerrar el modal de los platos
}

/* variables para configuracion de display externo comercial*/
export const optionsDisplayCommercial = {
  'dc-1': {
    sectionTitle : "PROMOCIONES", // Título del display display de paso
    bgImage: "assets/goku.gif", // Imagen de fondo del display de paso
    itemsImages: true,
  },
  'dc-2': {
    sectionTitle : "Mas Pedidos", // Título del display display de paso
    bgImage: "assets/goku.gif", // Imagen de fondo del display de paso
    itemsImages: true,
  },
  'dc-3': {
    sectionTitle : "VEGGIES", // Título del display display de paso
    bgImage: "assets/goku.gif", // Imagen de fondo del display de paso
    itemsImages: false,
  },
};

export const footerOptions = {
  enableFacebookBtn: false, // Si se quiere que se muestre el botón de Facebook
  enableInstagramBtn: true, // Si se quiere que se muestre el botón de Instagram
  enableXBtn: true, // Si se quiere que se muestre el botón de Twitter
  FacebookAlias: "mi_resto", // Si se quiere que se muestre el link a la página de Facebook
  InstagramAlias: "@mi_resto", // Si se quiere que se muestre el link a la página de Instagram
  XAlias: "@mi_resto", // Si se quiere que se muestre el link a la página de Twitter
}

/* Variables de configuración */
export const slogan = "Sabores que enamoran";

/*Variables de modales por parametros en la URL */
export const paramModalsEnable = true; // Si se quiere que los modales abran al recibir parametros en la URL
export const paramModalsDelay = 1000; // Tiempo de espera para abrir los mod

/*Variables de rutas de imagenes */
export const srcImgBackground = "./assets/background.png";
export const srcImgLogo = "./assets/logo.png";

/*Variables de fuente de datos */
export const urlGS= 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQMnzH9VFoDvEoKEt7v0_kWvXrrqxTEDfxHNiPo4SXqcgvqJDqWRs0JL-V1pupTZaMmI7qZfVPw2O8z/pub?gid=374664570&single=true&output=tsv';
export const nLineEncab = 1; // Número de línea donde están los encabezados
