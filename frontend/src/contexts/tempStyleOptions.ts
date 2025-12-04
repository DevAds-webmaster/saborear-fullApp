// Archivo temporal con opciones de estilos (clave/valor) para poblar comboboxes
// Basado en src/publicPage/customStyles.ts

export const tempStyleOptions: Record<string, Array<{ id: string; label: string; value: string }>> = {
  "header.container": [
    { id: "hdr-1", label: "Negro (sombra)", value: "bg-black text-white shadow-neutral-900 shadow-lg" },
    { id: "hdr-2", label: "Blanco (claro)", value: "bg-white text-black shadow-sm" }
  ],
  "header.sloganStyle": [
    { id: "slog-1", label: "Grande cursiva", value: " text-center sm:text-left text-xl sm:text-4xl text-amber-50 satisfy-regular italic" },
    { id: "slog-2", label: "Normal", value: " text-center sm:text-left text-xl sm:text-2xl text-gray-800" }
  ],

  "categorySection.container": [
    { id: "cat-1", label: "Oscuro redondeado", value: "bg-black/80 rounded-2xl shadow-md" },
    { id: "cat-2", label: "Claro simple", value: "bg-white rounded-md shadow-sm" }
  ],
  "categorySection.title": [
    { id: "catt-1", label: "Mayúsculas grande", value: "uppercase text-2xl font-extrabold text-gray-200 italic " },
    { id: "catt-2", label: "Título normal", value: "text-xl font-bold text-gray-800" }
  ],

  "principalSection.container": [
    { id: "pr-1", label: "Fondo oscuro", value: "bg-black/80 rounded-2xl shadow-md" },
    { id: "pr-2", label: "Fondo claro", value: "bg-white/80 rounded-lg shadow-sm" }
  ],

  "modalsItems.container": [
    { id: "mi-1", label: "Modal oscuro", value: "bg-black rounded-lg border-gray-400 border-2" },
    { id: "mi-2", label: "Modal claro", value: "bg-white rounded-lg border-gray-200 border" }
  ],

  "displayDePaso.container": [
    { id: "ddp-1", label: "Display oscuro", value: "bg-black/80 rounded-2xl shadow-md" },
    { id: "ddp-2", label: "Display minimal", value: "bg-transparent" }
  ],

  // Opciones para displays comerciales (selección de plantilla)
  "displayComercial.template": [
    { id: "dc-1", label: "Plantilla 1 (Gradiente rojo)", value: "dc-1" },
    { id: "dc-2", label: "Plantilla 2 (Clásica)", value: "dc-2" },
    { id: "dc-3", label: "Plantilla 3 (Verde)", value: "dc-3" }
  ]
};
