import { useCallback, useEffect, useMemo, useState } from "react";
import { ObjectId } from "bson";
import { PreviewModal } from "../components/PreviewModal";
import { SectionVideoHelpButton } from "../components/SectionTitleWithHelp";
import {
  GooglePlacesLocationSection,
  type GooglePlacesLocationPayload,
  DEFAULT_APPEAR_ON_RED_SABORE_AR,
  DEFAULT_SEARCH_RADIUS_KM,
} from "../components/GooglePlacesLocationSection";
import { useResto } from "../contexts/RestoContext";
import { useAuth } from "../contexts/AuthContext";
import type { Config, Dish, MDC, Resto, SignedImage, Style, ThemeOptions } from "../types";
import { getImageKitAuth, uploadToImageKit } from "../services/media";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import { normalizePhoneForWa } from "../utils/whatsapp";

type Step = 1 | 2 | 3 | 4;

const TOTAL_STEPS = 4;

/** Valor por defecto del enlace de YouTube del tutorial del paso 1. */
const DEFAULT_ONBOARDING_STEP_1_TUTORIAL_VIDEO_URL = "https://youtu.be/ggmDQF4M_LY";

export type OnBoardingProps = {
  /** URL de YouTube (`watch`, `youtu.be` o `embed`) para el botón «Video tutorial» del paso 1. */
  step1TutorialVideoUrl?: string;
};

const STEP_LABELS: { step: Step; short: string }[] = [
  { step: 1, short: "Datos" },
  { step: 2, short: "Menú" },
  { step: 3, short: "Tema" },
  { step: 4, short: "Listo" },
];

type DraftDish = {
  title: string;
  description: string;
  price: number;
  dayDish: boolean;
  /** Vista previa con imagen de relleno tipo boceto (no se sube el archivo aún). */
  withImage: boolean;
};

/** Imágenes de ejemplo para el preview del onboarding (URLs públicas, no ImageKit). */
const ONBOARDING_DISH_SKETCH_PLACEHOLDERS: [SignedImage, SignedImage] = [
  {
    secure_url:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&w=480&h=360&fit=crop&q=80",
    public_id: "onboarding-sketch-dish-1",
  },
  {
    secure_url:
      "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&w=480&h=360&fit=crop&q=80",
    public_id: "onboarding-sketch-dish-2",
  },
];

/** Valores iniciales del paso 2; el usuario los reemplaza por los reales. */
const EXAMPLE_MENU_STEP = {
  categoryName: "Pastas",
  dish1: {
    title: "Tagliatelle al pesto",
    description: "Pesto genovés, parmesano y piñones tostados.",
    price: 9800,
    dayDish: true,
    withImage: true,
  },
  dish2: {
    title: "Ñoquis a la bolognesa",
    description: "Salsa de carne casera, queso rallado y albahaca.",
    price: 10500,
    dayDish: false,
    withImage: false,
  },
} satisfies { categoryName: string; dish1: DraftDish; dish2: DraftDish };

/** Textos de la tarjeta “Menú del día” en el preview (editable luego en Gestión de Menú). */
const DEFAULT_ONBOARDING_MENU_DAY_CONFIG: MDC = {
  titleCat: "Menú del día",
  descriptionCat:
    "Sugerencias destacadas de la carta. Preguntá al equipo por disponibilidad y tiempos de preparación.",
  item1Cat: "Platos preparados al momento",
  item2Cat: "Ingredientes frescos — sujeto a stock del día",
  item3Cat: "Consultá opciones vegetarianas y sin TACC",
};

/** Nombre visible: solo letras (incl. ñ/acentos), números y espacios; sin símbolos. */
function normalizeRestaurantName(raw: string): string {
  return raw.replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ");
}

/** Slug desde el nombre ya normalizado: minúsculas, sin acentos, espacios → "-". */
function nameToSlugFromRestaurantName(nameNormalized: string): string {
  return nameNormalized
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Edición manual del slug: minúsculas, guiones, sin espacios ni caracteres raros. */
function normalizeSlugInput(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type HeaderSocialRow = { enabled: boolean; url: string };
type WhatsCountry = {
  region: CountryCode;
  callingCode: string; // sin "+"
  flag: string;
  label: string;
};

const WHATS_COUNTRIES: WhatsCountry[] = [
  { region: "AR" as CountryCode, callingCode: "54", flag: "🇦🇷", label: "Argentina" },
  { region: "CL" as CountryCode, callingCode: "56", flag: "🇨🇱", label: "Chile" },
  { region: "UY" as CountryCode, callingCode: "598", flag: "🇺🇾", label: "Uruguay" },
  { region: "ES" as CountryCode, callingCode: "34", flag: "🇪🇸", label: "España" },
  { region: "MX" as CountryCode, callingCode: "52", flag: "🇲🇽", label: "Mexico" },
];

const EMPTY_LOGO: SignedImage = { secure_url: "", public_id: "" };

const DEFAULT_STYLE: Style = {
  colorBackground: "bg-gray-100",
  headerStyles: {
    container: "bg-white shadow-sm rounded-xl p-4",
    sloganStyle: "text-gray-500 text-sm",
  },
  categorySectionStyles: {
    container: "bg-white rounded-xl border p-4",
    title: "text-xl font-bold text-gray-800",
    descriptionText: "text-sm text-gray-600",
    descriptionBorder: "border-gray-200",
    itemsText: "text-gray-700",
    itemTitle: "text-base font-semibold text-gray-800",
    itemDescription: "text-sm text-gray-600",
    itemHover: "hover:bg-gray-50",
    tagsTextColor: "text-gray-700",
  },
  principalSectionStyles: {
    container: "bg-white rounded-xl border p-4",
    title: "text-2xl font-bold text-gray-900",
    descriptionText: "text-sm text-gray-600",
    descriptionBorder: "border-gray-200",
    itemsText: "text-gray-700",
    itemContainer: "rounded-lg border border-gray-200 p-3",
    itemHover: "hover:bg-gray-50",
    tagsTextColor: "text-gray-700",
  },
  modalsItemsStyles: {
    container: "bg-white rounded-xl p-4",
    textColor: "text-gray-800",
    tagsTextColor: "text-gray-700",
  },
  modalsParamStyles: {
    container: "bg-white rounded-xl p-4",
    textColor: "text-gray-800",
  },
  displayDePasoStyles: {
    container: "bg-white p-4",
    title: "text-2xl font-bold text-gray-900",
    descriptionText: "text-sm text-gray-600",
    itemsCatText: "text-base text-gray-700",
    descriptionBorder: "border-gray-200",
    itemsText: "text-gray-800",
    itemContainer: "rounded-lg border border-gray-200 p-3",
    itemHover: "hover:bg-gray-50",
    tagsTextColor: "text-gray-700",
  },
  displayComercialStyles: [
    {
      name: "default",
      container: "bg-white p-4",
      title: "text-2xl font-bold text-gray-900",
      descriptionText: "text-sm text-gray-600",
      descriptionBorder: "border-gray-200",
      gapItems: "gap-3",
      itemsText: "text-gray-800",
      itemsTitle: "text-lg font-semibold text-gray-900",
      itemsDescription: "text-sm text-gray-600",
      itemsPrice: "text-lg font-bold text-gray-900",
      itemContainer: "rounded-lg border border-gray-200 p-3",
      tagsTextColor: "text-gray-700",
    },
  ],
};

const DEFAULT_CONFIG: Config = {
  headerOptions: {
    enableFacebookBtn: false,
    enableInstagramBtn: false,
    enableXBtn: false,
    enableFacebookLink: "",
    enableInstagramLink: "",
    enableXLink: "",
  },
  footerOptions: {
    enableFacebookBtn: false,
    enableInstagramBtn: false,
    enableXBtn: false,
    FacebookAlias: "",
    InstagramAlias: "",
    XAlias: "",
  },
  optionsConfig: {
    enableMultiPage: false,
    enableItemModals: true,
    enableParamModals: false,
    enableDisplayDePaso: false,
    enableCommercialDisplay: false,
    optionsDisplayCommercial: [],
    qtyCommercialDisplay: 0,
  },
  optionsDisplayDePaso: {
    sectionTitle: "",
    bgImage: "",
    enableItemModals: true,
    delayCloseModal: 0,
  },
  slogan: "",
  template: "single-page",
  paramModalsEnable: false,
  paramModalsDelay: 0,
  flgSolidBackground: true,
  srcImgBackground: { secure_url: "", public_id: "" },
  srcImgLogo: { secure_url: "", public_id: "" },
  srcImgLogoDashboard: { secure_url: "", public_id: "" },
};

const DEFAULT_CART_TEMPLATE = `Pedido para {restoName}
{items}

Subtotal: {subTotal}
Precio Delivery: {deliveryFee}
Total: {total}

Datos:
Nombre: {customerName}
Tipo: {orderType}
Dirección: {address}
Tel: {phone}`;

export default function OnBoarding({
  step1TutorialVideoUrl = DEFAULT_ONBOARDING_STEP_1_TUTORIAL_VIDEO_URL,
}: OnBoardingProps) {
  const { user, logout } = useAuth();
  const { setRestoPreview, getThemeOptions, getStylesOptions, createResto, setId } = useResto();

  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  /** Si el usuario editó el slug a mano, deja de generarse automáticamente desde el nombre. */
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [phone, setPhone] = useState("");
  // Teléfono separado por prefijo/país y número (nacional). El campo `phone` guarda el E.164 (+...).
  const [whatsCountry, setWhatsCountry] = useState<WhatsCountry>(() => WHATS_COUNTRIES[0]);
  const [phoneNational, setPhoneNational] = useState("");
  const [slogan, setSlogan] = useState("");
  const [locationPayload, setLocationPayload] = useState<GooglePlacesLocationPayload>({
    selectedLocation: null,
    locationReferences: "",
    appearOnRedSaboreAr: DEFAULT_APPEAR_ON_RED_SABORE_AR,
    searchRadiusKm: DEFAULT_SEARCH_RADIUS_KM,
  });
  const handleLocationChange = useCallback((p: GooglePlacesLocationPayload) => {
    setLocationPayload(p);
  }, []);
  const [logoImage, setLogoImage] = useState<SignedImage>(EMPTY_LOGO);
  const [logoUploading, setLogoUploading] = useState(false);
  const [headerSocial, setHeaderSocial] = useState<{
    facebook: HeaderSocialRow;
    instagram: HeaderSocialRow;
    x: HeaderSocialRow;
  }>({
    facebook: { enabled: false, url: "" },
    instagram: { enabled: false, url: "" },
    x: { enabled: false, url: "" },
  });

  const [categoryName, setCategoryName] = useState(EXAMPLE_MENU_STEP.categoryName);
  const [dish1, setDish1] = useState<DraftDish>({ ...EXAMPLE_MENU_STEP.dish1 });
  const [dish2, setDish2] = useState<DraftDish>({ ...EXAMPLE_MENU_STEP.dish2 });

  const [themes, setThemes] = useState<ThemeOptions | null>(null);
  const [styleOptions, setStyleOptions] = useState<Record<string, Array<{ id: string; label: string; value: string }>> | null>(null);
  const [macrosLoading, setMacrosLoading] = useState(true);
  const [selectedThemeId, setSelectedThemeId] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<Style>(DEFAULT_STYLE);

  useEffect(() => {
    let cancelled = false;
    const loadMacros = async () => {
      setMacrosLoading(true);
      const [themeRes, styleRes] = await Promise.all([getThemeOptions(), getStylesOptions()]);
      if (cancelled) return;
      setThemes(themeRes);
      setStyleOptions(styleRes);
      setMacrosLoading(false);
    };
    void loadMacros();
    return () => {
      cancelled = true;
    };
  }, [getThemeOptions, getStylesOptions]);

  const themeList = themes?.options ?? [];
  const noThemesAvailable = !macrosLoading && themeList.length === 0;
  const themesFetchFailed = !macrosLoading && themes === null;

  const keyMap: Record<string, string> = useMemo(
    () => ({
      "bk.color": "colorBackground",
      "header.container": "headerStyles.container",
      "header.sloganStyle": "headerStyles.sloganStyle",
      "categorySection.container": "categorySectionStyles.container",
      "categorySection.descriptionText": "categorySectionStyles.descriptionText",
      "categorySection.itemTitle": "categorySectionStyles.itemTitle",
      "categorySection.itemDescription": "categorySectionStyles.itemDescription",
      "categorySection.title": "categorySectionStyles.title",
      "principalSection.container": "principalSectionStyles.container",
      "principalSection.itemContainer": "principalSectionStyles.itemContainer",
      "principalSection.title": "principalSectionStyles.title",
      "principalSection.descriptionText": "principalSectionStyles.descriptionText",
      "principalSection.itemsText": "principalSectionStyles.itemsText",
      "principalSection.tagsTextColor": "principalSectionStyles.tagsTextColor",
      "modalsItems.container": "modalsItemsStyles.container",
      "modalsItems.textColor": "modalsItemsStyles.textColor",
      "displayDePaso.container": "displayDePasoStyles.container",
    }),
    []
  );

  const setNested = useCallback(<T extends object>(obj: T, path: string, value: unknown): T => {
    const keys = path.split(".");
    const newObj = { ...(obj as Record<string, unknown>) } as Record<string, unknown>;
    let cur: Record<string, unknown> = newObj;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (i === keys.length - 1) {
        cur[k] = value;
      } else {
        const existing = cur[k];
        const child: Record<string, unknown> =
          existing && typeof existing === "object" ? (existing as Record<string, unknown>) : {};
        cur[k] = { ...child };
        cur = cur[k] as Record<string, unknown>;
      }
    }
    return newObj as T;
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = themes?.options?.find((t) => t.id === themeId);
    if (!theme) return;

    let nextStyle: Style = { ...DEFAULT_STYLE };
    Object.entries(theme.data).forEach(([k, v]) => {
      const mapped = keyMap[k];
      if (!mapped) return;
      const option = styleOptions?.[k]?.find((prop) => prop.id === v);
      if (!option) return;
      nextStyle = setNested(nextStyle, mapped, option.value);
    });
    setSelectedStyle(nextStyle);
  };

  useEffect(() => {
    if (macrosLoading || !themes?.options?.length || !styleOptions) return;
    if (selectedThemeId !== "") return;

    const first = themes.options[0];
    setSelectedThemeId(first.id);

    let nextStyle: Style = { ...DEFAULT_STYLE };
    Object.entries(first.data).forEach(([k, v]) => {
      const mapped = keyMap[k];
      if (!mapped) return;
      const option = styleOptions[k]?.find((prop) => prop.id === v);
      if (!option) return;
      nextStyle = setNested(nextStyle, mapped, option.value);
    });
    setSelectedStyle(nextStyle);
    // Solo precargar una vez al montar cuando aún no hay tema elegido; setNested/keyMap estables vía closure del render
  }, [macrosLoading, themes, styleOptions, selectedThemeId, keyMap, setNested]);

  const uploadLogoFile = async (file: File) => {
    setLogoUploading(true);
    try {
      const auth = await getImageKitAuth();
      const r = await uploadToImageKit(file, auth);
      const img: SignedImage = { secure_url: r.url, public_id: r.fileId };
      setLogoImage(img);
    } catch {
      alert("No se pudo subir el logo. Intentá de nuevo.");
    } finally {
      setLogoUploading(false);
    }
  };

  const patchHeaderSocial = (key: keyof typeof headerSocial, patch: Partial<HeaderSocialRow>) => {
    setHeaderSocial((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const buildOnboardingConfig = (): Config => ({
    ...DEFAULT_CONFIG,
    slogan: slogan.trim(),
    srcImgLogo: logoImage,
    srcImgLogoDashboard: logoImage.secure_url ? logoImage : DEFAULT_CONFIG.srcImgLogoDashboard,
    headerOptions: {
      ...DEFAULT_CONFIG.headerOptions,
      enableFacebookBtn: headerSocial.facebook.enabled,
      enableInstagramBtn: headerSocial.instagram.enabled,
      enableXBtn: headerSocial.x.enabled,
      enableFacebookLink: headerSocial.facebook.url.trim(),
      enableInstagramLink: headerSocial.instagram.url.trim(),
      enableXLink: headerSocial.x.url.trim(),
    },
  });

  const toDish = (draft: DraftDish, sketchSlot: 0 | 1): Dish & { "menu-dia": boolean } => ({
    _id: new ObjectId().toHexString(),
    title: draft.title,
    description: draft.description || "",
    price: Number(draft.price || 0),
    discountPrice: 0,
    available: true,
    dayDish: !!draft.dayDish,
    glutenFree: false,
    veggie: false,
    image: draft.withImage ? { ...ONBOARDING_DISH_SKETCH_PLACEHOLDERS[sketchSlot] } : { secure_url: "", public_id: "" },
    featuredText: "",
    featuredTextColor: "#000000",
    EnDisplayDePaso: false,
    "EnDisplayComercial-1": false,
    "EnDisplayComercial-2": false,
    "EnDisplayComercial-3": false,
    "menu-dia": !!draft.dayDish,
  });

  const buildDraftResto = (): Partial<Resto> => {
    const { selectedLocation, locationReferences } = locationPayload;
    const locationSave = selectedLocation
      ? {
          ...selectedLocation,
          references: locationReferences.trim() || undefined,
          appearOnRedSaboreAr: locationPayload.appearOnRedSaboreAr,
          searchRadiusKm: locationPayload.searchRadiusKm,
        }
      : undefined;

    return {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      location: locationSave,
      params: [],
      style: selectedStyle,
      config: buildOnboardingConfig(),
      cart_settings: {
        template: DEFAULT_CART_TEMPLATE,
        deliveryFee: 0,
        orderTypes: [
          { type: "delivery", enabled: true },
          { type: "local", enabled: true },
          { type: "retiro", enabled: true },
        ],
      },
      menu: {
        _id: new ObjectId().toHexString(),
        name: "Menu Principal",
        description: "",
        createdAt: new Date().toISOString(),
        menu_day_config: { ...DEFAULT_ONBOARDING_MENU_DAY_CONFIG },
        categories: [
          {
            _id: new ObjectId().toHexString(),
            name: categoryName.trim(),
            config: {
              availableCat: true,
              orderCat: 1,
              descriptionCat: "",
              item1Cat: "",
              item2Cat: "",
              item3Cat: "",
              item4Cat: "",
              item5Cat: "",
              item6Cat: "",
              item7Cat: "",
              item8Cat: "",
              item9Cat: "",
              item10Cat: "",
            },
            dishes: [toDish(dish1, 0), toDish(dish2, 1)],
          },
        ],
      },
      createdAt: new Date().toISOString(),
    };
  };

  const phoneToParse = (): string => {
    if (!phoneNational.trim()) return "";
    return `+${whatsCountry.callingCode}${phoneNational.trim()}`;
  };

  const handleVerifyPhone = () => {
    const raw = phoneToParse();
    if (!raw) {
      alert("Ingresá un número de WhatsApp para verificar el formato.");
      return;
    }
    const parsed = parsePhoneNumberFromString(raw, whatsCountry.region);
    if (!parsed) {
      alert("No se pudo interpretar el número. Revisá el prefijo y el número ingresado.");
      return;
    }
    if (!parsed.isValid()) {
      alert("El número no parece válido para el país seleccionado. Podés usar “Corregir formato”.");
      return;
    }
    alert(`Formato válido. Número: ${parsed.format("E.164")}`);
  };

  const handleCorrectPhone = () => {
    const raw = phoneToParse();
    if (!raw) {
      alert("Ingresá un número de WhatsApp para corregir el formato.");
      return;
    }
    const parsed = parsePhoneNumberFromString(raw, whatsCountry.region);
    if (!parsed || !parsed.isValid()) {
      alert("No pudimos corregir el formato. Revisá el prefijo y el número ingresado.");
      return;
    }

    // Guardar el formato correcto (E.164 con +) para el resto.
    const e164 = parsed.format("E.164");
    setPhone(e164);
    setPhoneNational(String(parsed.nationalNumber ?? phoneNational));

    // Botón de prueba: abrir una pestaña con wa.me.
    const message =
      "👋 Si ves este mensaje dentro de tu conversación de WhatsApp, significa que tu número configurado para el carrito es correcto ✅. Puedes seguir con la configuración de tu Menú Digital 🍽️📲";
    const waDigits = normalizePhoneForWa(e164); // wa.me no acepta '+'
    const url = `https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    setRestoPreview(buildDraftResto() as Resto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, slug, phone, locationPayload, slogan, logoImage, headerSocial, categoryName, dish1, dish2, selectedStyle]);

  const validateStep = (currentStep: Step) => {
    if (currentStep === 1) {
      if (!name.trim() || !slug.trim()) {
        alert("Completa nombre y slug para continuar.");
        return false;
      }
      if (!locationPayload.selectedLocation?.formattedAddress) {
        alert("Selecciona y confirma una dirección del local para continuar.");
        return false;
      }
      const nets: { key: keyof typeof headerSocial; label: string }[] = [
        { key: "facebook", label: "Facebook" },
        { key: "instagram", label: "Instagram" },
        { key: "x", label: "X (Twitter)" },
      ];
      for (const { key, label } of nets) {
        const row = headerSocial[key];
        if (row.enabled && !row.url.trim()) {
          alert(`Activaste ${label}: ingresá el enlace o desactivá la red.`);
          return false;
        }
      }
      return true;
    }

    if (currentStep === 2) {
      const dishesValid =
        !!dish1.title.trim() &&
        !!dish2.title.trim() &&
        Number(dish1.price) > 0 &&
        Number(dish2.price) > 0;
      if (!categoryName.trim() || !dishesValid) {
        alert("Debes cargar 1 categoría y al menos 2 platos con nombre y precio.");
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      if (!selectedThemeId) {
        alert("Selecciona un tema por defecto para continuar.");
        return false;
      }
      return true;
    }

    return true;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(4, (prev + 1) as Step) as Step);
  };

  const back = () => setStep((prev) => Math.max(1, (prev - 1) as Step) as Step);

  const confirmCreate = async () => {
    if (!user?.id) return;
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    const ok = confirm("Se creará tu restaurante con esta configuración inicial. ¿Deseas continuar?");
    if (!ok) return;

    setSaving(true);
    const created = await createResto(buildDraftResto(), user.id);
    setSaving(false);

    if (!created?._id) {
      alert("No se pudo crear el restaurante.");
      return;
    }

    setId(created._id);
    alert("Restaurante creado correctamente.");
    window.location.reload();
  };

  const progressPct = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-300/40 via-amber-200/35 to-amber-400/30 p-4 sm:p-6">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-6 rounded-2xl border border-amber-400/60 bg-white shadow-md shadow-amber-400/20 overflow-hidden">
          <div className="h-1.5 w-full bg-amber-300/70">
            <div
              className="h-full bg-gradient-to-r from-yellow-600 to-amber-700 transition-all duration-500 ease-out rounded-r-full"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={step}
              aria-valuemin={1}
              aria-valuemax={TOTAL_STEPS}
              aria-label={`Paso ${step} de ${TOTAL_STEPS}`}
            />
          </div>
          <div className="px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                  Saborear
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5">
                  Configuración inicial
                </h1>
                <p className="text-sm text-gray-600 mt-1 max-w-xl">
                  Completa estos pasos para crear tu primer restaurante.
                </p>
              </div>
              <p className="text-sm font-medium text-amber-900 whitespace-nowrap">
                Paso <span className="text-yellow-700 font-bold">{step}</span> de {TOTAL_STEPS}
              </p>
            </div>

            <div className="mt-6 relative px-1 sm:px-4">
              <div
                className="absolute left-[12.5%] right-[12.5%] top-[18px] sm:top-[20px] h-0.5 rounded-full bg-amber-400/90 -z-0"
                aria-hidden
              />
              <div className="relative z-10 flex justify-between gap-1">
                {STEP_LABELS.map(({ step: s, short }) => {
                  const done = step > s;
                  const active = step === s;
                  return (
                    <div key={s} className="flex flex-col items-center w-1/4 min-w-0">
                      <div
                        className={[
                          "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-sm font-bold border-2 transition-all duration-300",
                          done
                            ? "border-yellow-600 bg-yellow-600 text-white shadow-sm shadow-amber-600/40"
                            : active
                              ? "border-amber-600 bg-white text-amber-900 ring-4 ring-amber-300/80"
                              : "border-amber-500 bg-amber-200/90 text-amber-900",
                        ].join(" ")}
                      >
                        {done ? "✓" : s}
                      </div>
                      <span
                        className={[
                          "mt-2 text-[10px] sm:text-xs font-semibold text-center leading-tight px-0.5",
                          active ? "text-amber-950" : done ? "text-amber-900" : "text-amber-800/75",
                        ].join(" ")}
                      >
                        {short}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <section className="lg:col-span-3 rounded-2xl border border-amber-400/55 bg-white shadow-md shadow-amber-500/15 p-5 sm:p-6 min-h-[75vh]">
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 border-l-4 border-yellow-600 py-0.5 pl-4">
                    <h2 className="text-lg font-bold text-gray-900">Paso 1: Datos principales</h2>
                    <p className="mt-0.5 text-sm text-gray-600">Identidad básica de tu local</p>
                  </div>
                  <SectionVideoHelpButton
                    videoUrl={step1TutorialVideoUrl}
                    buttonLabel="Video tutorial"
                    modalTitle="Video tutorial — Onboarding"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5" htmlFor="onb-name">
                    Nombre del restaurante
                  </label>
                  <input
                    id="onb-name"
                    value={name}
                    onChange={(e) => {
                      const next = normalizeRestaurantName(e.target.value);
                      setName(next);
                      if (!slugManuallyEdited) {
                        setSlug(nameToSlugFromRestaurantName(next));
                      }
                    }}
                    className="w-full rounded-xl border border-amber-400 bg-white px-3 py-2.5 text-gray-900 placeholder:text-amber-900/45 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600/35"
                    placeholder="Ej: El Resto de Pepe"
                  />
                  <p className="text-xs text-amber-900/70 mt-1.5">
                    Solo letras, números y espacios (sin símbolos). Este nombre se muestra en el menú público y en el carrito.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5" htmlFor="onb-slug">
                    Slug
                  </label>
                  <input
                    id="onb-slug"
                    value={slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setSlug(normalizeSlugInput(e.target.value));
                    }}
                    className="w-full rounded-xl border border-amber-400 bg-white px-3 py-2.5 text-gray-900 placeholder:text-amber-900/45 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600/35"
                    placeholder="el-resto-de-pepe"
                  />
                  <p className="text-xs text-amber-900/70 mt-1.5">
                    Por defecto sigue al nombre (minúsculas y guiones). Podés cambiarlo aquí si querés otra URL.{" "}
                    {import.meta.env.VITE_MENU_PUBLIC_URL}/{"{slug}"}
                  </p>
                </div>
                <GooglePlacesLocationSection
                  variant="onboarding"
                  mapVisible={step === 1}
                  syncKey="onboarding"
                  initialLocation={null}
                  htmlIdPrefix="onb-location"
                  onChange={handleLocationChange}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5">WhatsApp (opcional)</label>
                  <div className="flex flex-row flex-wrap gap-3 items-start">
                    <div className="flex flex-col">
                      <select
                        value={whatsCountry.region}
                        onChange={(e) => {
                          const next = WHATS_COUNTRIES.find((c) => c.region === e.target.value);
                          if (!next) return;
                          setWhatsCountry(next);
                          const digits = phoneNational.trim();
                          setPhone(digits ? `+${next.callingCode}${digits}` : "");
                        }}
                        className="rounded-xl border border-amber-400 bg-white px-3 py-2.5 text-gray-900 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600/35"
                      >
                        {WHATS_COUNTRIES.map((c) => (
                          <option key={c.region} value={c.region}>
                            {c.flag} +{c.callingCode}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-amber-900/70 mt-1">Prefijo</p>
                    </div>

                    <input
                      value={phoneNational}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, "");
                        setPhoneNational(cleaned);
                        setPhone(cleaned ? `+${whatsCountry.callingCode}${cleaned}` : "");
                      }}
                      inputMode="numeric"
                      className="max-w-40 rounded-xl border border-amber-400 bg-white px-3 py-2.5 text-gray-900 placeholder:text-amber-900/45 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600/35"
                      placeholder="Ej: 9112233445"
                    />

                    <div className="flex flex-row flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleVerifyPhone}
                        disabled={!phoneNational.trim()}
                        className="px-3 py-2 rounded-xl border border-amber-500 bg-white text-amber-900 font-medium hover:bg-amber-200/50 hover:border-amber-600 disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap"
                      >
                        Verificar formato
                      </button>
                      <button
                        type="button"
                        onClick={handleCorrectPhone}
                        disabled={!phoneNational.trim()}
                        className="px-3 py-2 rounded-xl bg-yellow-600 text-white font-semibold shadow-md shadow-amber-700/35 hover:bg-yellow-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                      >
                        Enviar mensaje de prueba
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-amber-900/70 mt-1.5">
                    Se utilizará para el carrito de pedidos por WhatsApp. El botón prueba abre un <code className="text-xs">wa.me/...</code> con un mensaje de ejemplo.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5" htmlFor="onb-logo">
                    Logo del restaurante (opcional)
                  </label>
                  <p className="text-xs text-amber-900/70 mb-2">
                    Recomendamos <strong className="font-medium">PNG con fondo transparente</strong> para que se vea bien sobre cualquier color del menú.
                  </p>
                  <div className="flex flex-wrap items-start gap-4">
                    <div
                      className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-amber-500/60 bg-[repeating-conic-gradient(#e7e5e4_0%_25%,#f5f5f4_0%_50%)] bg-[length:12px_12px]"
                      title="Vista previa (el patrón ayuda a ver transparencia)"
                    >
                      {logoImage.secure_url ? (
                        <img
                          src={logoImage.secure_url}
                          alt="Logo"
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-2 text-center text-[11px] text-amber-900/50">
                          Sin logo
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <input
                        id="onb-logo"
                        type="file"
                        accept="image/png,image/webp,image/jpeg,.png,.webp,.jpg,.jpeg"
                        disabled={logoUploading}
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (!f) return;
                          await uploadLogoFile(f);
                        }}
                        className="max-w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-amber-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-amber-950 hover:file:bg-amber-300 disabled:opacity-50"
                      />
                      {logoUploading && (
                        <p className="text-xs text-amber-900">Subiendo imagen…</p>
                      )}
                      {!!logoImage.secure_url && !logoUploading && (
                        <button
                          type="button"
                          onClick={() => setLogoImage(EMPTY_LOGO)}
                          className="w-fit rounded-lg border border-amber-500 bg-white px-3 py-1 text-xs font-medium text-amber-900 hover:bg-amber-200/40"
                        >
                          Quitar logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5" htmlFor="onb-slogan">
                    Eslogan (opcional)
                  </label>
                  <input
                    id="onb-slogan"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    className="w-full rounded-xl border border-amber-400 bg-white px-3 py-2.5 text-gray-900 placeholder:text-amber-900/45 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600/35"
                    placeholder="Ej: El sabor que te acompaña"
                  />
                  <p className="text-xs text-amber-900/70 mt-1.5">
                    Se muestra en el encabezado del menú público junto al logo.
                  </p>
                </div>

                <div className="rounded-xl border border-amber-500/70 bg-amber-200/35 p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-amber-950">Redes sociales</h3>
                    <p className="text-xs text-amber-900/70 mt-1">
                      Activá cada red y pegá el enlace completo. Los íconos aparecen en el encabezado del menú cuando están habilitados.
                    </p>
                  </div>

                  {(
                    [
                      { key: "facebook" as const, label: "Facebook" },
                      { key: "instagram" as const, label: "Instagram" },
                      { key: "x" as const, label: "X (Twitter)" },
                    ] as const
                  ).map(({ key, label }) => {
                    const row = headerSocial[key];
                    return (
                      <div key={key} className="rounded-lg border border-amber-400/80 bg-white/80 p-3 space-y-2">
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
                          <input
                            type="checkbox"
                            checked={row.enabled}
                            onChange={(e) => patchHeaderSocial(key, { enabled: e.target.checked })}
                            className="h-4 w-4 rounded border-amber-500 text-yellow-600 focus:ring-yellow-600/40"
                          />
                          Mostrar {label} en el menú
                        </label>
                        <div>
                          <label className="sr-only" htmlFor={`onb-social-${key}`}>
                            Enlace de {label}
                          </label>
                          <input
                            id={`onb-social-${key}`}
                            type="url"
                            value={row.url}
                            onChange={(e) => patchHeaderSocial(key, { url: e.target.value })}
                            disabled={!row.enabled}
                            placeholder="https://…"
                            className="w-full rounded-lg border border-amber-400 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-amber-900/40 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600/35 disabled:bg-amber-100/50 disabled:text-amber-900/40"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="border-l-4 border-yellow-600 pl-4 py-0.5">
                  <h2 className="text-lg font-bold text-gray-900">Paso 2: Categoría y platos iniciales</h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Luego podrás editar todo desde <strong className="text-amber-900">Gestión de Menú</strong>.
                  </p>
                </div>
                <p className="rounded-xl border border-amber-500/80 bg-amber-200/50 px-3.5 py-2.5 text-sm text-amber-950">
                  <span className="font-semibold text-amber-900">Solo de ejemplo:</span> la categoría, los nombres, descripciones y precios
                  precargados son ilustrativos. Sustitúyelos por los de tu restaurante; también podrás cambiarlos después.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5" htmlFor="onb-category">
                    Nombre de la categoría
                  </label>
                  <input
                    id="onb-category"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full rounded-xl border border-amber-400 bg-white px-3 py-2.5 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600/35"
                    placeholder="Ej. Pastas, Postres…"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-amber-500/70 bg-amber-200/35 p-4">
                    <h3 className="font-semibold text-amber-950 mb-3 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-600 text-xs font-bold text-white">
                        1
                      </span>
                      Plato 1
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1" htmlFor="onb-d1-title">
                          Nombre del plato
                        </label>
                        <input
                          id="onb-d1-title"
                          value={dish1.title}
                          onChange={(e) => setDish1((p) => ({ ...p, title: e.target.value }))}
                          className="w-full rounded-lg border border-amber-400 bg-white px-3 py-2 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600/35"
                          placeholder="Nombre visible en el menú"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1" htmlFor="onb-d1-desc">
                          Descripción
                        </label>
                        <textarea
                          id="onb-d1-desc"
                          value={dish1.description}
                          onChange={(e) => setDish1((p) => ({ ...p, description: e.target.value }))}
                          className="w-full rounded-lg border border-amber-400 bg-white px-3 py-2 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600/35"
                          placeholder="Ingredientes o detalle breve"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1" htmlFor="onb-d1-price">
                          Precio
                        </label>
                        <input
                          id="onb-d1-price"
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step={1}
                          value={dish1.price === 0 ? "" : dish1.price}
                          onChange={(e) =>
                            setDish1((p) => ({ ...p, price: e.target.value === "" ? 0 : Number(e.target.value) }))
                          }
                          className="w-full rounded-lg border border-amber-400 bg-white px-3 py-2 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600/35"
                          placeholder="0"
                        />
                        <p className="text-[11px] text-amber-900/70 mt-1">Solo número (sin símbolo de moneda).</p>
                      </div>
                      <div>
                        <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900">
                          <input
                            type="checkbox"
                            checked={dish1.withImage}
                            onChange={(e) => setDish1((p) => ({ ...p, withImage: e.target.checked }))}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-amber-500 text-yellow-600 focus:ring-yellow-600/40"
                          />
                          <span>
                            Con imagen
                            <span className="block text-[11px] font-normal text-amber-900/70">
                              Muestra una foto de ejemplo en la vista previa; luego podrás subir la imagen real en Gestión de Menú.
                            </span>
                          </span>
                        </label>
                      </div>
                      <div>
                        <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900">
                          <input
                            type="checkbox"
                            checked={dish1.dayDish}
                            onChange={(e) => setDish1((p) => ({ ...p, dayDish: e.target.checked }))}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-amber-500 text-yellow-600 focus:ring-yellow-600/40"
                          />
                          <span>
                            Destacar / menú del día
                            <span className="block text-[11px] font-normal text-amber-900/70">
                              El plato aparece en la sección destacada del menú público.
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-500/70 bg-amber-200/35 p-4">
                    <h3 className="font-semibold text-amber-950 mb-3 flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-600 text-xs font-bold text-white">
                        2
                      </span>
                      Plato 2
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1" htmlFor="onb-d2-title">
                          Nombre del plato
                        </label>
                        <input
                          id="onb-d2-title"
                          value={dish2.title}
                          onChange={(e) => setDish2((p) => ({ ...p, title: e.target.value }))}
                          className="w-full rounded-lg border border-amber-400 bg-white px-3 py-2 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600/35"
                          placeholder="Nombre visible en el menú"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1" htmlFor="onb-d2-desc">
                          Descripción
                        </label>
                        <textarea
                          id="onb-d2-desc"
                          value={dish2.description}
                          onChange={(e) => setDish2((p) => ({ ...p, description: e.target.value }))}
                          className="w-full rounded-lg border border-amber-400 bg-white px-3 py-2 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600/35"
                          placeholder="Ingredientes o detalle breve"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-800 mb-1" htmlFor="onb-d2-price">
                          Precio
                        </label>
                        <input
                          id="onb-d2-price"
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step={1}
                          value={dish2.price === 0 ? "" : dish2.price}
                          onChange={(e) =>
                            setDish2((p) => ({ ...p, price: e.target.value === "" ? 0 : Number(e.target.value) }))
                          }
                          className="w-full rounded-lg border border-amber-400 bg-white px-3 py-2 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600/35"
                          placeholder="0"
                        />
                        <p className="text-[11px] text-amber-900/70 mt-1">Solo número (sin símbolo de moneda).</p>
                      </div>
                      <div>
                        <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900">
                          <input
                            type="checkbox"
                            checked={dish2.withImage}
                            onChange={(e) => setDish2((p) => ({ ...p, withImage: e.target.checked }))}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-amber-500 text-yellow-600 focus:ring-yellow-600/40"
                          />
                          <span>
                            Con imagen
                            <span className="block text-[11px] font-normal text-amber-900/70">
                              Muestra una foto de ejemplo en la vista previa; luego podrás subir la imagen real en Gestión de Menú.
                            </span>
                          </span>
                        </label>
                      </div>
                      <div>
                        <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900">
                          <input
                            type="checkbox"
                            checked={dish2.dayDish}
                            onChange={(e) => setDish2((p) => ({ ...p, dayDish: e.target.checked }))}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-amber-500 text-yellow-600 focus:ring-yellow-600/40"
                          />
                          <span>
                            Destacar / menú del día
                            <span className="block text-[11px] font-normal text-amber-900/70">
                              El plato aparece en la sección destacada del menú público.
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="border-l-4 border-yellow-600 pl-4 py-0.5">
                  <h2 className="text-lg font-bold text-gray-900">Paso 3: Tema por defecto</h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Es lo mismo que “Temas por defecto” en la sección visual: elegís un estilo base para tu menú.
                  </p>
                </div>
                {macrosLoading && (
                  <p className="text-sm text-amber-900 flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-amber-800" />
                    Cargando temas disponibles…
                  </p>
                )}
                {themesFetchFailed && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-900">
                    <strong className="font-semibold">No pudimos cargar los estilos.</strong> Puedes actualizar la página o volver a intentarlo en unos minutos. Si el problema continúa, contacta con soporte.
                  </div>
                )}
                {noThemesAvailable && !themesFetchFailed && (
                  <div className="rounded-xl border border-amber-500/80 bg-amber-200/45 px-3.5 py-3 text-sm text-amber-950">
                    <strong className="font-semibold">Todavía no hay estilos para elegir.</strong> Cuando estén disponibles, aparecerán en esta lista. Si crees que deberían mostrarse, contacta con soporte.
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5" htmlFor="onb-theme">
                    Tema por defecto
                  </label>
                  <select
                    id="onb-theme"
                    disabled={macrosLoading || noThemesAvailable || themesFetchFailed}
                    className="w-full rounded-xl border border-amber-400 bg-white px-3 py-3 text-gray-900 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600/35 disabled:bg-amber-200/50 disabled:text-amber-900/60 disabled:cursor-not-allowed"
                    value={selectedThemeId}
                    onChange={(e) => {
                      const themeId = e.target.value;
                      setSelectedThemeId(themeId);
                      if (themeId) applyTheme(themeId);
                    }}
                  >
                    <option value="">
                      {macrosLoading
                        ? "Cargando…"
                        : noThemesAvailable || themesFetchFailed
                          ? "Sin temas disponibles"
                          : "-- seleccionar tema --"}
                    </option>
                    {themeList.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div className="border-l-4 border-yellow-600 pl-4 py-0.5">
                  <h2 className="text-lg font-bold text-gray-900">Paso 4: Confirmación</h2>
                  <p className="text-sm text-gray-600 mt-0.5">Revisa los datos antes de crear el restaurante</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-amber-400 bg-white p-4">
                    <h3 className="font-semibold text-amber-900 mb-3 pb-2 border-b border-amber-300">Restaurante</h3>
                    <p className="text-sm text-gray-800"><strong className="text-amber-900/80">Nombre:</strong> {name || "-"}</p>
                    <p className="text-sm text-gray-800 mt-1"><strong className="text-amber-900/80">Slug:</strong> {slug || "-"}</p>
                    <p className="text-sm text-gray-800 mt-1"><strong className="text-amber-900/80">WhatsApp:</strong> {phone || "No definido"}</p>
                    <p className="text-sm text-gray-800 mt-1"><strong className="text-amber-900/80">Eslogan:</strong> {slogan.trim() || "—"}</p>
                    <p className="text-sm text-gray-800 mt-1 flex items-start gap-2">
                      <strong className="text-amber-900/80 shrink-0">Logo:</strong>
                      {logoImage.secure_url ? (
                        <img src={logoImage.secure_url} alt="" className="h-12 w-12 object-contain rounded border border-amber-200" />
                      ) : (
                        <span>—</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-800 mt-2">
                      <strong className="text-amber-900/80">Redes en el menú:</strong>{" "}
                      {[
                        headerSocial.facebook.enabled && "Facebook",
                        headerSocial.instagram.enabled && "Instagram",
                        headerSocial.x.enabled && "X",
                      ]
                        .filter(Boolean)
                        .join(", ") || "Ninguna"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-400 bg-white p-4">
                    <h3 className="font-semibold text-amber-900 mb-3 pb-2 border-b border-amber-300">Menú inicial</h3>
                    <p className="text-sm text-gray-800"><strong className="text-amber-900/80">Categoría:</strong> {categoryName || "-"}</p>
                    <p className="text-sm text-gray-800 mt-1">
                      <strong className="text-amber-900/80">Plato 1:</strong> {dish1.title || "-"}
                      {dish1.withImage && (
                        <span className="ml-1 text-amber-800 font-medium">· Con imagen (ejemplo)</span>
                      )}
                      {dish1.dayDish && (
                        <span className="ml-1 text-amber-800 font-medium">· Menú del día</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-800 mt-1">
                      <strong className="text-amber-900/80">Plato 2:</strong> {dish2.title || "-"}
                      {dish2.withImage && (
                        <span className="ml-1 text-amber-800 font-medium">· Con imagen (ejemplo)</span>
                      )}
                      {dish2.dayDish && (
                        <span className="ml-1 text-amber-800 font-medium">· Menú del día</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-amber-500/70 bg-amber-200/40 p-4">
                  <h3 className="font-semibold text-amber-900 mb-3 pb-2 border-b border-amber-300">Ubicación</h3>
                  <p className="text-sm text-gray-800">
                    <strong className="text-amber-900/80">Dirección de la casa de comidas:</strong>{" "}
                    {locationPayload.selectedLocation?.formattedAddress?.trim() || "—"}
                  </p>
                  <p className="text-sm text-gray-800 mt-2">
                    <strong className="text-amber-900/80">Referencia adicional:</strong>{" "}
                    {(locationPayload.locationReferences.trim() || locationPayload.selectedLocation?.references || "").trim() || "—"}
                  </p>
                  {locationPayload.selectedLocation?.lat != null && locationPayload.selectedLocation?.lng != null && (
                    <p className="text-xs text-gray-600 mt-2">
                      Coordenadas (WGS84): {locationPayload.selectedLocation.lat.toFixed(6)}, {locationPayload.selectedLocation.lng.toFixed(6)}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-amber-500/70 bg-amber-200/40 p-4">
                  <h3 className="font-semibold text-amber-900 mb-2">Tema</h3>
                  <p className="text-sm text-gray-800">
                    {themes?.options?.find((t) => t.id === selectedThemeId)?.name || "Sin seleccionar"}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-5 border-t border-amber-300 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={step === 1 ? () => logout() : back}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl border-2 border-amber-500 bg-white text-amber-900 font-medium hover:bg-amber-200/50 hover:border-amber-600 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                {step === 1 ? "Cerrar sesión" : "Atrás"}
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-yellow-600 text-white font-semibold shadow-md shadow-amber-700/35 hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={confirmCreate}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-amber-700 text-white font-semibold shadow-md shadow-amber-800/35 hover:bg-amber-800 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Confirmando..." : "Confirmar y crear"}
                </button>
              )}
            </div>
          </section>

          <aside className="lg:col-span-1">
            <PreviewModal open mode="embedded" className="h-full" />
          </aside>
        </div>
      </div>
    </div>
  );
}

