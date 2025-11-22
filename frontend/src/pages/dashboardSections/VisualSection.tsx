import { useEffect, useState } from "react";
import { useResto } from "../../contexts/RestoContext";
import type { Resto, StyleOptionsMap, Config, ThemeOptions } from "../../types/index";

interface VisualSectionProps {
  resto: Resto | null;
  updateResto: (restoId: string, restoData: Partial<Resto>) => Promise<Resto | null>;
}

export default function VisualSection({ resto, updateResto }: VisualSectionProps) {
  const { btnSaveEnabled, setBtnSaveEnabled, restoPreview, setRestoPreview, getStylesOptions ,getThemeOptions} = useResto();

  const [localStyle, setLocalStyle] = useState<any>(resto?.style || {});
  const [localConfig, setLocalConfig] = useState<Config | undefined>(resto?.config);
  const [options, setOptions] = useState<StyleOptionsMap | null>(null);
  const [themeOptions, setThemeOptions] = useState<ThemeOptions | null>(null);
  const [optionsLoading, setOptionsLoading] = useState<boolean>(false);
  const [themeOptionsLoading, setThemeOptionsLoading] = useState<boolean>(false);
  const [themeOptionsError, setThemeOptionsError] = useState<string | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string>("");

  // Cargar opciones desde backend
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setOptionsLoading(true);
        setOptionsError(null);
        const res = await getStylesOptions();
        console.log('res',res)
        setOptions(res || null);
      } catch (e) {
        setOptionsError('No se pudieron cargar las opciones de estilos');
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, []);

  // Cargar theme options
  useEffect(() => {
    const fetchThemeOptions = async () => {
      try {
        setThemeOptionsLoading(true);
        setThemeOptionsError(null);
        const res = await getThemeOptions();
        setThemeOptions(res || null);
      } catch (e) {
        setThemeOptionsError('No se pudieron cargar los temas por defecto');
      } finally {
        setThemeOptionsLoading(false);
      }
    };
    fetchThemeOptions();
  }, []);

  // Inicializar localStyle cuando cambie resto
  useEffect(() => {
    setLocalStyle(resto?.style || {});
    setLocalConfig(resto?.config);
  }, [resto]);

  // Actualizar preview y habilitar botón cuando cambien style o config
  useEffect(() => {
    if (!resto) return;
    const nextPreview = {
      ...(restoPreview || resto),
      style: localStyle,
      config: (localConfig || resto.config) as Config,
    } as Resto;
    setRestoPreview(nextPreview);

    const base = JSON.stringify({ style: resto.style, config: resto.config });
    const next = JSON.stringify({ style: localStyle, config: localConfig || resto.config });
    setBtnSaveEnabled(base !== next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStyle, localConfig]);


  useEffect(()=>{
    console.log('localStyle',localStyle)
    console.log('restoPreview',restoPreview)
  },[restoPreview])

  if (!resto) {
    return (
      <div className="p-4 text-gray-600">
        <h1 className="text-xl font-bold mb-4">Personalización Visual</h1>
        <p>No hay restaurante seleccionado.</p>
      </div>
    );
  }

  // Funciones para manejar el estado local de las opciones
  const getNested = (obj: any, path: string) => {
    return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  };

  // Funcion para setear un valor en un objeto anidado
  const setNested = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    const newObj = { ...obj };
    let cur: any = newObj;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (i === keys.length - 1) {
        cur[k] = value;
      } else {
        cur[k] = cur[k] ? { ...cur[k] } : {};
        cur = cur[k];
      }
    }
    return newObj;
  };

  const handleSelectChange = (key: string, value: string) => {
    setLocalStyle((prev: any) => setNested(prev || {}, key, value));
  };

  // Helpers para Config (checkbox e input)
  const handleConfigToggle = (key: string, checked: boolean) => {
    setLocalConfig((prev: any) => setNested(prev || {}, key, checked) as Config);
  };

  const handleConfigInput = (key: string, value: string) => {
    setLocalConfig((prev: any) => setNested(prev || {}, key, value) as Config);
  };

  const handleReset = () => {
    const res = confirm("Se reestablecerán los valores al último estado guardado.");
    if (res) setLocalStyle(resto.style || {});
  };

  const keyMap: Record<string, string> = {
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
    "modalsItems.container": "modalsItemsStyles.container",
    "modalsItems.textColor": "modalsItemsStyles.textColor",
    "displayDePaso.container": "displayDePasoStyles.container",
    "displayComercial.template": "displayComercialStylesTemplate",
  };

  const applyTheme = (themeId: string) => {
    if (!themeOptions?.options) return;
    const theme = themeOptions.options.find(t => t.id === themeId);
    if (!theme) return;
    setLocalStyle((prev: any) => {
      let next = { ...(prev || {}) };
      Object.entries(theme.data).forEach(([k, v]) => {
        const mapped = keyMap[k];
        if (mapped) {
          const value = options?.[k]?.find(prop => prop.id === v);
          if (value) {
            next = setNested(next, mapped, value.value);
          }
        }
      });
      return next;
    });
  };

  const handleSave = async () => {
    const resConfirm = confirm("Una vez guardado los cambios ya no podrás deshacer esta acción.");
    if (!resConfirm) return;
    const updated = await updateResto(resto._id, restoPreview || {});
    if (updated) {
      alert("Cambios guardados correctamente ✅");
      setBtnSaveEnabled(false);
    } else {
      alert("Error al guardar los cambios ❌");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Personalización Visual</h1>
      <p className="text-gray-600 mb-4">Edita las plantillas visuales y observa la vista previa en tiempo real.</p>
      {optionsLoading && (
        <div className="text-sm text-gray-500 mb-2">Cargando opciones…</div>
      )}
      {optionsError && (
        <div className="text-sm text-red-600 mb-2">{optionsError}</div>
      )}

      <div className="my-6 flex gap-3">
        <button onClick={() => setLocalStyle(resto.style)} className="bg-gray-300 px-4 py-2 rounded">Reiniciar</button>
        <button onClick={handleReset} className="bg-yellow-400 px-4 py-2 rounded">Reestablecer</button>
        <button
          onClick={handleSave}
          disabled={!btnSaveEnabled}
          className={`px-4 py-2 rounded ${btnSaveEnabled ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}
        >
          Guardar Cambios
        </button>
      </div>

      {/* Temas por defecto */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Temas Por Defecto :</label>
        <div className="flex items-center gap-3">
          <select
            className="mt-1 w-80 p-2 border rounded"
            value={selectedThemeId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedThemeId(id);
              if (id) applyTheme(id);
            }}
          >
            <option value="">-- seleccionar tema --</option>
            {themeOptions?.options?.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {themeOptionsLoading && <span className="text-sm text-gray-500">Cargando temas…</span>}
          {themeOptionsError && <span className="text-sm text-red-600">{themeOptionsError}</span>}
        </div>
      </div>

      <div className="space-y-6 border p-5 rounded-lg">
        {/* Header Section */}
        <section>
          <h2 className="text-lg font-semibold">Header</h2>
          <p className="text-sm text-gray-500">Contenedor y estilo del eslogan.</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm">Contenedor</label>
              <select
                className="mt-1 w-full p-2 border rounded"
                value={getNested(localStyle, 'headerStyles.container') || ''}
                onChange={(e) => handleSelectChange('headerStyles.container', e.target.value)}
              >
                <option value="">-- seleccionar --</option>
                {options?.['header.container']?.map((o) => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm">Estilo del slogan</label>
              <select
                className="mt-1 w-full p-2 border rounded"
                value={getNested(localStyle, 'headerStyles.sloganStyle') || ''}
                onChange={(e) => handleSelectChange('headerStyles.sloganStyle', e.target.value)}
              >
                <option value="">-- seleccionar --</option>
                {options?.['header.sloganStyle']?.map((o) => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Redes Sociales */}
        <section>
          <h2 className="text-lg font-semibold">Redes sociales</h2>
          <p className="text-sm text-gray-500">Habilita los botones y define el enlace/alias para cada red.</p>
          <div className="mt-3 grid md:grid-cols-2 gap-4">
            {/* Header redes */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Header</h3>
              <div className="space-y-3">
                {/* Facebook */}
                <div className="grid grid-cols-2 gap-2 items-center">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!getNested(localConfig, 'headerOptions.enableFacebookBtn')}
                      onChange={(e) => handleConfigToggle('headerOptions.enableFacebookBtn', e.target.checked)}
                    />
                    Facebook
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="https://facebook.com/mi-pagina"
                    value={getNested(localConfig, 'headerOptions.enableFacebookLink') || ''}
                    onChange={(e) => handleConfigInput('headerOptions.enableFacebookLink', e.target.value)}
                  />
                </div>

                {/* Instagram */}
                <div className="grid grid-cols-2 gap-2 items-center">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!getNested(localConfig, 'headerOptions.enableInstagramBtn')}
                      onChange={(e) => handleConfigToggle('headerOptions.enableInstagramBtn', e.target.checked)}
                    />
                    Instagram
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="https://instagram.com/mi-pagina"
                    value={getNested(localConfig, 'headerOptions.enableInstagramLink') || ''}
                    onChange={(e) => handleConfigInput('headerOptions.enableInstagramLink', e.target.value)}
                  />
                </div>

                {/* X / Twitter */}
                <div className="grid grid-cols-2 gap-2 items-center">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!getNested(localConfig, 'headerOptions.enableXBtn')}
                      onChange={(e) => handleConfigToggle('headerOptions.enableXBtn', e.target.checked)}
                    />
                    X (Twitter)
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="https://x.com/mi-pagina"
                    value={getNested(localConfig, 'headerOptions.enableXLink') || ''}
                    onChange={(e) => handleConfigInput('headerOptions.enableXLink', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Footer redes */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Footer</h3>
              <div className="space-y-3">
                {/* Facebook */}
                <div className="grid grid-cols-2 gap-2 items-center">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!getNested(localConfig, 'footerOptions.enableFacebookBtn')}
                      onChange={(e) => handleConfigToggle('footerOptions.enableFacebookBtn', e.target.checked)}
                    />
                    Facebook
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="Alias o texto del enlace"
                    value={getNested(localConfig, 'footerOptions.FacebookAlias') || ''}
                    onChange={(e) => handleConfigInput('footerOptions.FacebookAlias', e.target.value)}
                  />
                </div>

                {/* Instagram */}
                <div className="grid grid-cols-2 gap-2 items-center">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!getNested(localConfig, 'footerOptions.enableInstagramBtn')}
                      onChange={(e) => handleConfigToggle('footerOptions.enableInstagramBtn', e.target.checked)}
                    />
                    Instagram
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="Alias o texto del enlace"
                    value={getNested(localConfig, 'footerOptions.InstagramAlias') || ''}
                    onChange={(e) => handleConfigInput('footerOptions.InstagramAlias', e.target.value)}
                  />
                </div>

                {/* X / Twitter */}
                <div className="grid grid-cols-2 gap-2 items-center">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!getNested(localConfig, 'footerOptions.enableXBtn')}
                      onChange={(e) => handleConfigToggle('footerOptions.enableXBtn', e.target.checked)}
                    />
                    X (Twitter)
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="Alias o texto del enlace"
                    value={getNested(localConfig, 'footerOptions.XAlias') || ''}
                    onChange={(e) => handleConfigInput('footerOptions.XAlias', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Principal Section */}
        <section>
          <h2 className="text-lg font-semibold">Sección Principal</h2>
          <p className="text-sm text-gray-500">Estilos para la sección principal del menú.</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm">Contenedor</label>
              <select
                className="mt-1 w-full p-2 border rounded"
                value={getNested(localStyle, 'principalSectionStyles.container') || ''}
                onChange={(e) => handleSelectChange('principalSectionStyles.container', e.target.value)}
              >
                <option value="">-- seleccionar --</option>
                {options?.['principalSection.container']?.map((o) => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm">Contenedor Items</label>
              <select
                className="mt-1 w-full p-2 border rounded"
                value={getNested(localStyle, 'principalSectionStyles.itemContainer') || ''}
                onChange={(e) => handleSelectChange('principalSectionStyles.itemContainer', e.target.value)}
              >
                <option value="">-- seleccionar --</option>
                {options?.['principalSection.itemContainer']?.map((o) => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div> 

            <div>
              <label className="block text-sm">Titulo</label>
              <select
                className="mt-1 w-full p-2 border rounded"
                value={getNested(localStyle, 'principalSectionStyles.title') || ''}
                onChange={(e) => handleSelectChange('principalSectionStyles.title', e.target.value)}
              >
                <option value="">-- seleccionar --</option>
                {options?.['principalSection.title']?.map((o) => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm">Descripción</label>
              <select
                className="mt-1 w-full p-2 border rounded"
                value={getNested(localStyle, 'principalSectionStyles.descriptionText') || ''}
                onChange={(e) => handleSelectChange('principalSectionStyles.descriptionText', e.target.value)}
              >
                <option value="">-- seleccionar --</option>
                {options?.['principalSection.descriptionText']?.map((o) => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm">Texto Items</label>
              <select
                className="mt-1 w-full p-2 border rounded"
                value={getNested(localStyle, 'principalSectionStyles.itemsText') || ''}
                onChange={(e) => handleSelectChange('principalSectionStyles.itemsText', e.target.value)}
              >
                <option value="">-- seleccionar --</option>
                {options?.['principalSection.itemsText']?.map((o) => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Category Section */}
        <section>
          <h2 className="text-lg font-semibold">Sección de Categorías</h2>
          <p className="text-sm text-gray-500">Estilos para el contenedor y títulos de categorías.</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm">Contenedor</label>
              <select
                className="mt-1 w-full p-2 border rounded"
                value={getNested(localStyle, 'categorySectionStyles.container') || ''}
                onChange={(e) => handleSelectChange('categorySectionStyles.container', e.target.value)}
              >
                <option value="">-- seleccionar --</option>
                {options?.['categorySection.container']?.map((o) => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm">Título</label>
              <select
                className="mt-1 w-full p-2 border rounded"
                value={getNested(localStyle, 'categorySectionStyles.title') || ''}
                onChange={(e) => handleSelectChange('categorySectionStyles.title', e.target.value)}
              >
                <option value="">-- seleccionar --</option>
                {options?.['categorySection.title']?.map((o) => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm">Descripción</label>
              <select
                className="mt-1 w-full p-2 border rounded"
                value={getNested(localStyle, 'categorySectionStyles.descriptionText') || ''}
                onChange={(e) => handleSelectChange('categorySectionStyles.descriptionText', e.target.value)}
              >
                <option value="">-- seleccionar --</option>
                {options?.['categorySection.descriptionText']?.map((o) => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm">Título del ítem</label>
              <select
                className="mt-1 w-full p-2 border rounded"
                value={getNested(localStyle, 'categorySectionStyles.itemTitle') || ''}
                onChange={(e) => handleSelectChange('categorySectionStyles.itemTitle', e.target.value)}
              >
                <option value="">-- seleccionar --</option>
                {options?.['categorySection.itemTitle']?.map((o) => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm">Descripción del ítem</label>
              <select
                className="mt-1 w-full p-2 border rounded"
                value={getNested(localStyle, 'categorySectionStyles.itemDescription') || ''}
                onChange={(e) => handleSelectChange('categorySectionStyles.itemDescription', e.target.value)}
              >
                <option value="">-- seleccionar --</option>
                {options?.['categorySection.itemDescription']?.map((o) => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

          </div>
        </section>

        {/* Modals Items */}
        <section>
          <h2 className="text-lg font-semibold">Modales de ítems</h2>
          <p className="text-sm text-gray-500">Estilos para los modales que muestran los platos.</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm">Contenedor modal</label>
              <select
                className="mt-1 w-full p-2 border rounded"
                value={getNested(localStyle, 'modalsItemsStyles.container') || ''}
                onChange={(e) => handleSelectChange('modalsItemsStyles.container', e.target.value)}
              >
                <option value="">-- seleccionar --</option>
                {options?.['modalsItems.container']?.map((o) => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm">Texto modal</label>
              <select
                className="mt-1 w-full p-2 border rounded"
                value={getNested(localStyle, 'modalsItemsStyles.textColor') || ''}
                onChange={(e) => handleSelectChange('modalsItemsStyles.textColor', e.target.value)}
              >
                <option value="">-- seleccionar --</option>
                {options?.['modalsItems.textColor']?.map((o) => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Display de paso */}
        <section>
          <h2 className="text-lg font-semibold">Display De Paso</h2>
          <p className="text-sm text-gray-500">Estilos del display de paso (pantalla externa).</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm">Plantilla</label>
              <select
                className="mt-1 w-full p-2 border rounded"
                value={getNested(localStyle, 'displayDePasoStyles.container') || ''}
                onChange={(e) => handleSelectChange('displayDePasoStyles.container', e.target.value)}
              >
                <option value="">-- seleccionar --</option>
                {options?.['displayDePaso.container']?.map((o) => (
                  <option key={o.id} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Display Comercial */}
        <section>
          <h2 className="text-lg font-semibold">Display Comercial</h2>
          <p className="text-sm text-gray-500">Selecciona una plantilla comercial para los displays.</p>
          <div className="mt-2 w-64">
            <select
              className="mt-1 w-full p-2 border rounded"
              value={getNested(localStyle, 'displayComercialStylesTemplate') || ''}
              onChange={(e) => handleSelectChange('displayComercialStylesTemplate', e.target.value)}
            >
              <option value="">-- seleccionar --</option>
              {options?.['displayComercial.template']?.map((o) => (
                <option key={o.id} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </section>
      </div>
    </div>
  );
}
