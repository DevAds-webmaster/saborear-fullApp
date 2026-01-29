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
  cart_settings: CartSettings;
  mp_subscription_id?: string | null;
  subscription_status?: string;
  next_payment_date?: string | null;
}

export interface CartSettings {
  template: string;
  deliveryFee: number;
  orderTypes: Array<{ type: "delivery" | "local" | "retiro"; enabled: boolean }>;
}

export interface Style {
  colorBackground: string;
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
    enableFacebookBtn: boolean;
    enableInstagramBtn: boolean;
    enableXBtn: boolean;
    enableFacebookLink?: string;
    enableInstagramLink?: string;
    enableXLink?: string;
  };
  footerOptions : {
    enableFacebookBtn: boolean;
    enableInstagramBtn: boolean;
    enableXBtn: boolean;
    FacebookAlias?: string;
    InstagramAlias?: string;
    XAlias?: string;
  };
  optionsConfig : {
    enableMultiPage: boolean;
    enableItemModals: boolean;
    enableParamModals: boolean;
    enableDisplayDePaso: boolean;
    enableCommercialDisplay: boolean;
    optionsDisplayCommercial : OpDspCommercial[];
    qtyCommercialDisplay?: number;
  };
  optionsDisplayDePaso : {
    sectionTitle : string;
    bgImage: string;
    enableItemModals: boolean;
    delayCloseModal: number;
  };
  slogan:string; 
  paramModalsEnable : boolean;
  paramModalsDelay : number;
  flgSolidBackground : boolean;
  srcImgBackground : SignedImage;
  srcImgLogo : SignedImage;
  srcImgLogoDashboard : SignedImage;
}

export interface OpDspCommercial {
  name: string;
  sectionTitle :  string;
  bgImage: string;
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

export type StyleOptionsMap = Record<string, Array<{ id: string; label: string; value: string }>>;
export interface ThemeOption {
  id: string;
  name: string;
  data: Record<string, string>;
}

export interface ThemeOptions {
  options: ThemeOption[];
}

