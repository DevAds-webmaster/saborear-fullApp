export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  is_bot_response: boolean;
  created_at: string;
}



export interface User {
  id: string;
  username: string;
  email: string;
  restos: string[];
  // lo que necesites
}

export interface AuthContextType {
  user: User | null;
  login: (usuario: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface RestoContextType {
  resto: Resto | null;
  setResto: (resto: Resto| null) => void;
  restoPreview: Resto | null;
  setRestoPreview: (resto: Resto| null) => void;
  isLoading: boolean;
  setSlug: (slug: string) => void;
  slug: string| null;
  updateResto:(restoId: string, restoData: Partial<Resto>) => Promise<Resto | null>;
  getResto:() => void;
  id: string;
  setId: (id: string) => void;
  btnSaveEnabled: boolean;
  setBtnSaveEnabled: (state: boolean) => void;
  getStylesOptions: () => Promise<StyleOptionsMap | null>;
  getThemeOptions: () => Promise<ThemeOptions | null>;
}

export interface PublicContextType {
  resto: Resto | null;
  setResto: (resto: Resto | null) => void;
  loading: boolean;
  setLoading: (state: boolean) => void;
  slug: string| null;
  setSlug: (slug: string) => void;
  bgImage: string| undefined;
  setBgImage: (bg: string | undefined) => void;
  getRestoWhatsAppLink?: (message: string) => string | null;
}

export type StyleOptionsMap = Record<string, Array<{ id: string; label: string; value: string }>>;
export interface ThemeOption {
  id: string;
  name: string;
  data: Record<string, string>;
}

export interface ThemeOptions {
  options: ThemeOption[];
}

// Resto types
export interface Resto {
  _id: string;
  name: string;
  slug: string;
  phone?: string;
  address?: string;
  params: Parameters[];
  menu: Menu;
  config: Config;
  style: Style;
  createdAt: string;

  mp_subscription_id?: string | null;
  subscription_status?: string;
  next_payment_date?: string | null;
}

export interface Style {
  headerStyles:{
      container: string;
      sloganStyle: string;
  };
  categorySectionStyles:{
      container: string;
      title: string;
      descriptionText: string;
      descriptionBorder: string;
      itemsText: string;
      itemTitle: string;
      itemDescription: string;
      itemHover: string;
      tagsTextColor: string;
  };
  principalSectionStyles:{
      container: string;
      title: string;
      descriptionText: string;
      descriptionBorder: string;
      itemsText: string;
      itemContainer: string;
      itemHover: string;
      tagsTextColor: string;
  };
  modalsItemsStyles:{
      container:  string;
      textColor:  string;
      tagsTextColor: string;
  };
  modalsParamStyles:{
      container:  string;
      textColor:  string;
  };
  displayDePasoStyles:{
      container: string;
      title: string;
      descriptionText: string;
      itemsCatText: string;
      descriptionBorder: string;
      itemsText: string;
      itemContainer: string;
      itemHover: string;
      tagsTextColor: string;
  };
  displayComercialStyles: DspComStyles[];
}

export interface DspComStyles {
  name: string;
  container: string;
  title: string;
  descriptionText: string;
  descriptionBorder: string;
  gapItems: string;
  itemsText: string;
  itemsTitle: string;
  itemsDescription: string;
  itemsPrice: string;
  itemContainer: string;
  tagsTextColor: string;
}

export interface Config {
  headerOptions : {
    enableFacebookBtn: boolean; // Si se quiere que se muestre el botón de Facebook
    enableInstagramBtn: boolean; // Si se quiere que se muestre el botón de Instagram
    enableXBtn: boolean; // Si se quiere que se muestre el botón de Twitter
    enableFacebookLink?: string; // Si se quiere que se muestre el link a la página de Facebook
    enableInstagramLink?: string; // Si se quiere que se muestre el link a la página de Instagram
    enableXLink?: string; // Si se quiere que se muestre el link a la página de Twitter
  };
  footerOptions : {
    enableFacebookBtn: boolean; // Si se quiere que se muestre el botón de Facebook
    enableInstagramBtn: boolean; // Si se quiere que se muestre el botón de Instagram
    enableXBtn: boolean;// Si se quiere que se muestre el botón de Twitter
    FacebookAlias?: string; // Si se quiere que se muestre el link a la página de Facebook
    InstagramAlias?: string; // Si se quiere que se muestre el link a la página de Instagram
    XAlias?: string; // Si se quiere que se muestre el link a la página de Twitter
  };
  optionsConfig : {
    enableMultiPage: boolean; // Si se quiere que la app funcione como una multi-page, con rutas para cada categoria
    enableItemModals: boolean; // Si se quiere que se muestren los modales de los diferentes platos
    enableParamModals: boolean; // Si se quiere que se muestren los modales de promociones al recibir parametros en la URL
    enableDisplayDePaso: boolean; // Si se quiere que la app pueda ser visualizada en minitor iteractivo en vereda
    enableCommercialDisplay: boolean; // Si se quiere que la app pueda ser visualizada en pantalla comercial
    optionsDisplayCommercial : OpDspCommercial[];
    qtyCommercialDisplay?: number; // Cantidad de displays comerciales que se quieren mostrar
  };
  optionsDisplayDePaso : {
    sectionTitle : string; // Título del display display de paso
    bgImage: string; // Imagen de fondo del display de paso
    enableItemModals: boolean; // Si se quiere que se muestren los modales de los diferentes platos
    delayCloseModal: number; // Tiempo en milisegundos para cerrar el modal de los platos
  };
  slogan:string; 
  paramModalsEnable : boolean;
  paramModalsDelay : number;
  srcImgBackground : SignedImage;
  srcImgLogo : SignedImage;
  srcImgLogoDashboard : SignedImage;
}

export interface OpDspCommercial {
  name: string;
  sectionTitle :  string; // Título del display display de paso
  bgImage: string; // Imagen de fondo del display de paso
  itemsImages: boolean;
}

export interface Parameters {
  _id: string;
  name: string;
  config: {
    enableMod: boolean;
    imageMod?: string;
    titleMod: string;
    descriptionMod?: string;
    codePromMod?: string;
    featuredTextMod?: string;
    featuredTextColorMod?: string;
  };
}

export interface Menu {
  _id: string;
  name: string;
  description?: string;
  categories: Category[];
  menu_day_config:MDC;
  createdAt: string;
}

export interface MDC {
  titleCat?: string;
  descriptionCat?: string;
  item1Cat?: string;
  item2Cat?: string;
  item3Cat?: string;
  item4Cat?: string;
  item5Cat?: string;
  item6Cat?: string;
  item7Cat?: string;
  item8Cat?: string;
  item9Cat?: string;
  item10Cat?: string;
}

export interface Category {
  _id: string;
  name: string;
  config: {
    availableCat: boolean;
    orderCat: number;
    descriptionCat?: string;
    item1Cat?: string;
    item2Cat?: string;
    item3Cat?: string;
    item4Cat?: string;
    item5Cat?: string;
    item6Cat?: string;
    item7Cat?: string;
    item8Cat?: string;
    item9Cat?: string;
    item10Cat?: string;
  };
  dishes: Dish[];
}

  export interface SignedImage {
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
    format?: string;
  }

  export interface Dish {
    _id: string;
    category?: string;
    title: string;
    description: string;
    price: number;
    discountPrice: number;
    available: boolean;
    dayDish: boolean;
    glutenFree: boolean;
    veggie: boolean;
    image?: SignedImage;
    featuredText: string;
    featuredTextColor: string;
    EnDisplayDePaso: boolean;
    "EnDisplayComercial-1": boolean;
    "EnDisplayComercial-2": boolean;
    "EnDisplayComercial-3": boolean;
  }
