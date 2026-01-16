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
    name: { type: String, required: true },
    sectionTitle :  { type: String, required: true }, // Título del display display de paso
    bgImage: { type: String, required: true }, // Imagen de fondo del display de paso
    itemsImages: { type: Boolean, required: true }
  });


export const configSchema = new Schema<IConfig>({
    headerOptions : {
        enableFacebookBtn: { type: Boolean, required: true }, // Si se quiere que se muestre el botón de Facebook
        enableInstagramBtn: { type: Boolean, required: true },// Si se quiere que se muestre el botón de Instagram
        enableXBtn: { type: Boolean, required: true }, // Si se quiere que se muestre el botón de Twitter
        enableFacebookLink: { type: String},// Si se quiere que se muestre el link a la página de Facebook
        enableInstagramLink: { type: String}, // Si se quiere que se muestre el link a la página de Instagram
        enableXLink: { type: String} // Si se quiere que se muestre el link a la página de Twitter
    },
    footerOptions : {
        enableFacebookBtn: { type: Boolean, required: true }, // Si se quiere que se muestre el botón de Facebook
        enableInstagramBtn: { type: Boolean, required: true },// Si se quiere que se muestre el botón de Instagram
        enableXBtn: { type: Boolean, required: true },// Si se quiere que se muestre el botón de Twitter
        FacebookAlias: { type: String}, // Si se quiere que se muestre el link a la página de Facebook
        InstagramAlias: { type: String }, // Si se quiere que se muestre el link a la página de Instagram
        XAlias: { type: String} // Si se quiere que se muestre el link a la página de Twitter
    },
    optionsConfig : {
        enableMultiPage: { type: Boolean, required: true },// Si se quiere que la app funcione como una multi-page, con rutas para cada categoria
        enableItemModals: { type: Boolean, required: true }, // Si se quiere que se muestren los modales de los diferentes platos
        enableParamModals: { type: Boolean, required: true }, // Si se quiere que se muestren los modales de promociones al recibir parametros en la URL
        enableDisplayDePaso: { type: Boolean, required: true }, // Si se quiere que la app pueda ser visualizada en minitor iteractivo en vereda
        enableCommercialDisplay: { type: Boolean, required: true }, // Si se quiere que la app pueda ser visualizada en pantalla comercial
        optionsDisplayCommercial: [opDspComSchema],
        qtyCommercialDisplay: { type: Number} // Cantidad de displays comerciales que se quieren mostrar
    },
    optionsDisplayDePaso : {
        sectionTitle : { type: String, required: true }, // Título del display display de paso
        bgImage: { type: String, required: true }, // Imagen de fondo del display de paso
        enableItemModals: { type: Boolean, required: true }, // Si se quiere que se muestren los modales de los diferentes platos
        delayCloseModal: { type: Number, required: true } // Tiempo en milisegundos para cerrar el modal de los platos
    },
    slogan:{ type: String, required: true },
    paramModalsEnable : { type: Boolean, required: true },
    paramModalsDelay : { type: Number, required: true },
    flgSolidBackground : { type: Boolean, required: true },
    srcImgBackground : {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
        width: { type: Number, required: false },
        height: { type: Number, required: false },
        format: { type: String, required: false }
    },
    srcImgLogo : {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
        width: { type: Number, required: false },
        height: { type: Number, required: false },
        format: { type: String, required: false }
    },
    srcImgLogoDashboard : {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
        width: { type: Number, required: false },
        height: { type: Number, required: false },
        format: { type: String, required: false }
    }
  });

export default model<IConfig>("Config", configSchema);