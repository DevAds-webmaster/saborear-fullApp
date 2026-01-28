import { useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

import { useResto } from "../contexts/RestoContext";
import type { Category, Dish, Resto } from "../types";
import { getDishImageUrl } from "../services/media";

const waitForImages = async (root: HTMLElement) => {
  const images = Array.from(root.querySelectorAll("img"));
  if (images.length === 0) return;

  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) return resolve();
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }),
    ),
  );
};

export const PrintMenuModal = ({ onClose }: { onClose: () => void }) => {
  const { resto, restoPreview, setRestoPreview, updateResto } = useResto();
  const data = restoPreview || resto;

  const [showImages, setShowImages] = useState<boolean>(true);
  const [description, setDescription] = useState<string>("");
  const [headerPage, setHeaderPage] = useState<string>("");
  const [footerPage, setFooterPage] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const initializedRef = useRef(false);
  useEffect(() => {
    if (!data) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    setShowImages(data.print_setup?.showImages ?? true);
    setDescription(data.print_setup?.description ?? "");
    setHeaderPage(data.print_setup?.headerPage ?? "");
    setFooterPage(data.print_setup?.footerPage ?? "");
  }, [data]);

  // Mantener el restoPreview actualizado con lo que se edita en el modal (como en el dashboard)
  useEffect(() => {
    if (!data) return;
    const base = (restoPreview || resto || data) as Resto;
    setRestoPreview({
      ...base,
      print_setup: {
        showImages,
        description,
        headerPage,
        footerPage,
      },
    } as Resto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showImages, description, headerPage, footerPage]);

  const hasChanges = useMemo(() => {
    const base = {
      showImages: resto?.print_setup?.showImages ?? true,
      description: resto?.print_setup?.description ?? "",
      headerPage: resto?.print_setup?.headerPage ?? "",
      footerPage: resto?.print_setup?.footerPage ?? "",
    };
    const next = { showImages, description, headerPage, footerPage };
    return JSON.stringify(base) !== JSON.stringify(next);
  }, [resto, showImages, description, headerPage, footerPage]);

  const handleSave = async () => {
    if (!resto) return;
    const ok = confirm("¿Guardar los cambios?");
    if (!ok) return;

    try {
      setIsSaving(true);
      const updated = await updateResto(resto._id, {
        print_setup: { showImages, description, headerPage, footerPage },
      } as Partial<Resto>);
      if (updated) {
        alert("Cambios guardados correctamente ✅");
      } else {
        alert("Error al guardar los cambios ❌");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${data?.name || "menu"}-menu`,
    onBeforePrint: async () => {
      // Asegura que las imágenes estén cargadas antes de imprimir (evita “recuadros grises”).
      if (printRef.current) await waitForImages(printRef.current);
    },
  });

  const { orderedCategories, featuredDishes, featuredTitle } = useMemo(() => {
    const categories = (data?.menu?.categories || []) as Category[];

    const enabledCategories = categories.filter((c) => c?.config?.availableCat === true);

    const ordered = [...enabledCategories].sort((a, b) => {
      const oa = typeof a?.config?.orderCat === "number" ? a.config.orderCat : Number.POSITIVE_INFINITY;
      const ob = typeof b?.config?.orderCat === "number" ? b?.config?.orderCat : Number.POSITIVE_INFINITY;
      return oa - ob;
    });

    const featured = enabledCategories
      .flatMap((c) => (c?.dishes || []) as Dish[])
      .filter((d) => d?.available === true && d?.dayDish === true);

    const title = data?.menu?.menu_day_config?.titleCat?.trim() || "Categoría Destacada";

    return { orderedCategories: ordered, featuredDishes: featured, featuredTitle: title };
  }, [data]);

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="rounded-lg bg-white px-6 py-4 shadow-lg">
          <div className="text-sm text-gray-600">Cargando vista previa…</div>
        </div>
      </div>
    );
  }

  const DishRow = ({ dish }: { dish: Dish }) => {
    const hasDiscount = typeof dish.discountPrice === "number" && dish.discountPrice > 0;
    const hasImage = Boolean(showImages && dish.image?.secure_url);
    const featuredText = dish.featuredText?.trim();

    return (
      <li className="flex gap-3 py-3">
        {hasImage && (
          <div className="w-[72px] h-[72px] shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
            <img
              src={getDishImageUrl(dish.image, 240)}
              alt={dish.title}
              className="w-full h-full object-cover block"
              loading="eager"
              decoding="sync"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 truncate">{dish.title}</div>
              {dish.description?.trim() ? (
                <div className="mt-0.5 text-sm text-gray-600">{dish.description}</div>
              ) : null}
            </div>

            <div className="shrink-0 text-right">
              {hasDiscount ? (
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm text-gray-500 line-through">${dish.price.toFixed(2)}</span>
                  <span className="font-semibold text-green-700">${dish.discountPrice.toFixed(2)}</span>
                </div>
              ) : (
                <div className="font-semibold text-gray-900">${dish.price.toFixed(2)}</div>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {dish.veggie === true && (
              <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">Veggie</span>
            )}
            {dish.glutenFree === true && (
              <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-900">Sin gluten</span>
            )}
            {featuredText ? (
              <span
                className="px-2 py-0.5 rounded text-xs border"
                style={{
                  color: dish.featuredTextColor || "#111827",
                  borderColor: dish.featuredTextColor || "#D1D5DB",
                }}
              >
                {featuredText}
              </span>
            ) : null}
          </div>
        </div>
      </li>
    );
  };

  const CategoryBlock = ({ category }: { category: Category }) => {
    const categoryDishes = (category?.dishes || []).filter((d) => d?.available === true);

    if (categoryDishes.length === 0) return null;

    return (
      <section className="print-section">
        <div className="mt-8 mb-3">
          <h3 className="text-2xl font-semibold text-gray-900 text-center">{category.name}</h3>
          <div className="mt-2 h-px bg-gray-300" />
        </div>
        <ul className="divide-y divide-gray-200">
          {categoryDishes.map((dish) => (
            <DishRow key={dish._id} dish={dish} />
          ))}
        </ul>
      </section>
    );
  };

  return (
    <div className="print-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-6xl h-[90vh] rounded-xl bg-white shadow-xl flex flex-col overflow-hidden">
        <div className="no-print flex items-center justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div className="font-semibold text-gray-900">Vista previa de menú</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePrint()}
              className="rounded-md border-2 border-black px-4 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              imprimir
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-100"
            >
              cerrar
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-4 sm:p-6">
          <div className="h-full flex flex-col lg:flex-row gap-6 lg:gap-8 overflow-auto lg:overflow-hidden">
            {/* Panel izquierdo (controles) */}
            <div className="no-print w-full lg:w-[320px] shrink-0 space-y-6 lg:overflow-auto lg:pr-2">
              <label className="flex items-center gap-3 text-sm font-semibold text-gray-900 select-none">
                <input
                  type="checkbox"
                  checked={showImages}
                  onChange={(e) => setShowImages(e.target.checked)}
                  className="h-5 w-5 border-2 border-black"
                />
                <span>Mostrar Imagenes</span>
              </label>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-900">Descripcion</div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-md border-2 border-black/80 p-2 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-900">Encabezado de pagina</div>
                <input
                  value={headerPage}
                  onChange={(e) => setHeaderPage(e.target.value)}
                  className="w-full rounded-md border-2 border-black/80 p-2 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-900">Pie de pagina</div>
                <input
                  value={footerPage}
                  onChange={(e) => setFooterPage(e.target.value)}
                  className="w-full rounded-md border-2 border-black/80 p-2 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className={`w-full rounded-md px-4 py-2 text-sm font-semibold ${
                    !hasChanges || isSaving ? "bg-gray-200 text-gray-500" : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isSaving ? "guardando..." : "guardar"}
                </button>
              </div>
            </div>

            {/* Panel derecho (preview) */}
            <div className="w-full flex-1 lg:overflow-auto">
              <div className="border-4 border-black/80 bg-white p-6 min-h-full">
                <div ref={printRef} className="print-area">
                  {/* Header/Footer repetibles por página usando table header/footer groups */}
                  <table className="w-full print-table">
                    <thead>
                      <tr>
                        <td>
                          {headerPage?.trim() ? (
                            <div className="print-page-header text-left text-sm text-gray-700">{headerPage}</div>
                          ) : (
                            <div className="print-page-header" />
                          )}
                        </td>
                      </tr>
                    </thead>

                    <tfoot>
                      <tr>
                        <td>
                          {footerPage?.trim() ? (
                            <div className="print-page-footer text-left text-sm text-gray-700">{footerPage}</div>
                          ) : (
                            <div className="print-page-footer" />
                          )}
                        </td>
                      </tr>
                    </tfoot>

                    <tbody>
                      <tr>
                        <td>
                          <div className="py-4">
                            <div className="text-4xl font-bold text-gray-900 text-center">{data.name}</div>
                            {description?.trim() ? (
                              <div className="mt-2 text-center text-sm text-gray-600">{description}</div>
                            ) : null}
                          </div>

                          {featuredDishes.length > 0 ? (
                            <section className="print-section">
                              <div className="mb-3">
                                <h2 className="text-2xl font-semibold text-gray-900 text-center">
                                  {featuredTitle}
                                </h2>
                                <div className="mt-2 h-px bg-gray-300" />
                              </div>
                              <ul className="divide-y divide-gray-200">
                                {featuredDishes.map((dish) => (
                                  <DishRow key={dish._id} dish={dish} />
                                ))}
                              </ul>
                            </section>
                          ) : null}

                          {orderedCategories.map((cat) => (
                            <CategoryBlock key={cat._id} category={cat} />
                          ))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { padding: 12mm; }
          html, body { height: auto !important; margin: 0 !important; padding: 0 !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          /* Asegura que se impriman sólo los contenidos del ref (react-to-print ya lo hace) */
          .no-print { display: none !important; }
          .print-modal-overlay { background: transparent !important; padding: 0 !important; }

          /* Repetición de header/footer por página */
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          tr, td { break-inside: avoid; }

          .print-page-header, .print-page-footer { padding: 0 0 6mm 0; }
          .print-page-footer { padding: 6mm 0 0 0; }

          .print-area { color: #111827; font-size: 12pt; line-height: 1.35; }
          img { max-width: 100% !important; height: auto !important; }
          .print-section { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};