import { Schema, model, Document } from "mongoose";


export interface IConfig {
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
        optionsDisplayCommercial : IOpDspCommercial[];
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
    flgSolidBackground : boolean;
    srcImgBackground : {
        secure_url: string;
        public_id: string;
        width?: number;
        height?: number;
        format?: string;
    };
    srcImgLogo : {
        secure_url: string;
        public_id: string;
        width?: number;
        height?: number;
        format?: string;
    };
    srcImgLogoDashboard : {
        secure_url: string;
        public_id: string;
        width?: number;
        height?: number;
        format?: string;
    };
  }

  export interface IOpDspCommercial {
    name: string;
    sectionTitle :  string; // Título del display display de paso
    bgImage: string; // Imagen de fondo del display de paso
    itemsImages: boolean;
  }
  export const opDspComSchema = new Schema<IOpDspCommercial>({
    name: { type: String },
    sectionTitle :  { type: String }, // Título del display display de paso
    bgImage: { type: String }, // Imagen de fondo del display de paso
    itemsImages: { type: Boolean }
  });


export const configSchema = new Schema<IConfig>({
    headerOptions : {
        enableFacebookBtn: { type: Boolean }, // Si se quiere que se muestre el botón de Facebook
        enableInstagramBtn: { type: Boolean },// Si se quiere que se muestre el botón de Instagram
        enableXBtn: { type: Boolean }, // Si se quiere que se muestre el botón de Twitter
        enableFacebookLink: { type: String},// Si se quiere que se muestre el link a la página de Facebook
        enableInstagramLink: { type: String}, // Si se quiere que se muestre el link a la página de Instagram
        enableXLink: { type: String} // Si se quiere que se muestre el link a la página de Twitter
    },
    footerOptions : {
        enableFacebookBtn: { type: Boolean }, // Si se quiere que se muestre el botón de Facebook
        enableInstagramBtn: { type: Boolean },// Si se quiere que se muestre el botón de Instagram
        enableXBtn: { type: Boolean },// Si se quiere que se muestre el botón de Twitter
        FacebookAlias: { type: String}, // Si se quiere que se muestre el link a la página de Facebook
        InstagramAlias: { type: String }, // Si se quiere que se muestre el link a la página de Instagram
        XAlias: { type: String} // Si se quiere que se muestre el link a la página de Twitter
    },
    optionsConfig : {
        enableMultiPage: { type: Boolean },// Si se quiere que la app funcione como una multi-page, con rutas para cada categoria
        enableItemModals: { type: Boolean }, // Si se quiere que se muestren los modales de los diferentes platos
        enableParamModals: { type: Boolean }, // Si se quiere que se muestren los modales de promociones al recibir parametros en la URL
        enableDisplayDePaso: { type: Boolean }, // Si se quiere que la app pueda ser visualizada en minitor iteractivo en vereda
        enableCommercialDisplay: { type: Boolean }, // Si se quiere que la app pueda ser visualizada en pantalla comercial
        optionsDisplayCommercial: [opDspComSchema],
        qtyCommercialDisplay: { type: Number} // Cantidad de displays comerciales que se quieren mostrar
    },
    optionsDisplayDePaso : {
        sectionTitle : { type: String }, // Título del display display de paso
        bgImage: { type: String }, // Imagen de fondo del display de paso
        enableItemModals: { type: Boolean }, // Si se quiere que se muestren los modales de los diferentes platos
        delayCloseModal: { type: Number } // Tiempo en milisegundos para cerrar el modal de los platos
    },
    slogan:{ type: String },
    paramModalsEnable : { type: Boolean },
    paramModalsDelay : { type: Number },
    flgSolidBackground : { type: Boolean },
    srcImgBackground : {
        secure_url: { type: String },
        public_id: { type: String },
        width: { type: Number },
        height: { type: Number },
        format: { type: String }
    },
    srcImgLogo : {
        secure_url: { type: String },
        public_id: { type: String },
        width: { type: Number },
        height: { type: Number },
        format: { type: String }
    },
    srcImgLogoDashboard : {
        secure_url: { type: String },
        public_id: { type: String },
        width: { type: Number },
        height: { type: Number },
        format: { type: String }
    }
  });

export default model<IConfig>("Config", configSchema);