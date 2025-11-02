import React, { useState ,useEffect} from "react";
import { MoveVertical  as MoveIcon } from "lucide-react";
import type { Resto, Menu, Category, Dish } from "../../types";
import { useResto } from '../../contexts/RestoContext';
import { getCloudinarySignature, uploadSignedToCloudinary, getDishImageUrl } from "../../services/media";

interface MenuSectionProps {
  resto: Resto | null;
  updateResto: (restoId: string, restoData: Partial<Resto>) => Promise<Resto | null>;
}

export default function MenuSection({ resto, updateResto }: MenuSectionProps) {
  const [localMenu, setLocalMenu] = useState<Menu | null>(
    resto?.menu  ? resto.menu : null
  );
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [dragCatIndex, setDragCatIndex] = useState<number | null>(null);
  const [categoryModalOrder, setCategoryModalOrder] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"category" | "dish" | null>(null);
  const [editingItem, setEditingItem] = useState<Category | Dish | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const {btnSaveEnabled,setBtnSaveEnabled,restoPreview,setRestoPreview} = useResto();

  if (!resto || !localMenu) {
    return (
      <div className="p-4 text-gray-600">
        <h1 className="text-xl font-bold mb-4">Gestión de Menú</h1>
        <p>No hay menú disponible para este restaurante.</p>
      </div>
    );
  }

  // 🔹 Toggle acordeón de categoría
  const toggleCategory = (id: string) => {
    setExpandedCat(expandedCat === id ? null : id);
  };

  // 🔹 Abrir modal
  const openModal = (type: "category" | "dish", item: any = null, categoryId?: string) => {
    setModalType(type);
    setEditingItem(item);
    setSelectedCategoryId(categoryId || null);
    if (type === 'category') {
      const nextOrder = localMenu ? localMenu.categories.length + 1 : 1;
      setCategoryModalOrder(item?.config?.orderCat ?? nextOrder);
    }
    setShowModal(true);
  };

  // 🔹 Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setModalType(null);
    setSelectedCategoryId(null);
    setCategoryModalOrder(null);
  };

  // 🔹 Guardar cambios desde modal (crear/editar)
  const handleSaveModal = (data: any) => {
    if (!localMenu) return;

    if (modalType === "category") {
      if (editingItem) {
        // Editar categoría
        setLocalMenu({
          ...localMenu,
          categories: localMenu.categories.map((cat) =>
            cat._id === (editingItem as Category)._id
              ? {
                  ...cat,
                  name: data.name ?? cat.name,
                  config: { ...cat.config, ...(data.config || {}) },
                }
              : cat
          ),
        });
      } else {
        // Crear categoría
        const cfg = data.config || {};
        const newCat: Category = {
          _id: crypto.randomUUID(),
          name: data.name,
          config: {
            availableCat: cfg.availableCat ?? true,
            orderCat: localMenu.categories.length + 1,
            descriptionCat: cfg.descriptionCat || "",
            item1Cat: cfg.item1Cat || "",
            item2Cat: cfg.item2Cat || "",
            item3Cat: cfg.item3Cat || "",
            item4Cat: cfg.item4Cat || "",
            item5Cat: cfg.item5Cat || "",
            item6Cat: cfg.item6Cat || "",
            item7Cat: cfg.item7Cat || "",
            item8Cat: cfg.item8Cat || "",
            item9Cat: cfg.item9Cat || "",
            item10Cat: cfg.item10Cat || "",
          },
          dishes: [],
        };
        setLocalMenu({
          ...localMenu,
          categories: [...localMenu.categories, newCat],
        });
      }
    }

    if (modalType === "dish" && selectedCategoryId) {
      setLocalMenu({
        ...localMenu,
        categories: localMenu.categories.map((cat) => {
          if (cat._id === selectedCategoryId) {
            if (editingItem) {
              // Editar plato
              return {
                ...cat,
                dishes: cat.dishes.map((d) =>
                  d._id === (editingItem as Dish)._id ? { ...d, ...data } : d
                ),
              };
            } else {
              // Crear nuevo plato
              const newDish: Dish = {
                _id: crypto.randomUUID(),
                title: data.title,
                price: parseFloat(data.price) || 0,
                discountPrice: 0,
                available: true,
                dayDish:false,
                glutenFree: false,
                veggie: false,
                image: undefined,
                description: data.description || "",
                featuredText: "",
                featuredTextColor: "",
                EnDisplayDePaso: false,
                "EnDisplayComercial-1": false,
                "EnDisplayComercial-2": false,
                "EnDisplayComercial-3": false,
              };
              return { ...cat, dishes: [...cat.dishes, newDish] };
            }
          }
          return cat;
        }),
      });
    }

    

    closeModal();
  };

  useEffect(()=>{

    if (JSON.stringify(localMenu) !== JSON.stringify(resto.menu)) {
      setBtnSaveEnabled(true);
    } else {
      setBtnSaveEnabled(false);
    }

  },[localMenu])

  useEffect(()=>{
    if(restoPreview) {
      setRestoPreview({
        ...restoPreview,
        menu: localMenu
      });
    }

  },[localMenu])

  

  // 🔹 Eliminar categoría
  const deleteCategory = (id: string) => {
    if (!localMenu) return;

    const res= confirm("Estas seguro de querer eliminar esta Categoria?\nSe eliminarán todos los Platos que contiene")

    if(res)
      setLocalMenu({
        ...localMenu,
        categories: localMenu.categories.filter((cat) => cat._id !== id),
      });
  };

  // 🔹 Eliminar plato
  const deleteDish = (catId: string, dishId: string) => {
    if (!localMenu) return;

    const res= confirm("Estas seguro de querer eliminar este Plato?")

    if(res)
      setLocalMenu({
          ...localMenu,
          categories: localMenu.categories.map((cat) =>
            cat._id === catId
              ? { ...cat, dishes: cat.dishes.filter((d) => d._id !== dishId) }
              : cat
          ),
        });

  };

  const handleDiscartChanges =  () => {
    if (!resto || !localMenu) return;
    const res = confirm("Se reestrableceran los valores al ultimo estado guardado.")
    if(res){
      setLocalMenu(resto.menu);
    }
  }
  

  // 🔹 Guardar todo en backend
  const handleSaveChanges = async () => {
    if (!resto || !localMenu) return;

    const res = confirm("Una ves guardado los cambios ya no podras deshacer esta accion.")
    
    if(res){
     const updated = await updateResto(resto._id, restoPreview || {});
      if (updated) {
        alert("Cambios guardados correctamente ✅");
        setBtnSaveEnabled(false);
      } else {
        alert("Error al guardar los cambios ❌");
      } 
    }
    

  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Gestión de Menú</h1>

      {/* Carga general de imágenes removida: ahora por cada plato */}

      
      <div className="my-6 flex">
        <button
          onClick={() => openModal("category")}
          className="bg-blue-600 text-white px-4 py-2 rounded-md  hover:bg-blue-700"
        >
          + Crear Categoría
        </button>

        {
          btnSaveEnabled?
          <>
          <button
            onClick={handleDiscartChanges}
            className="bg-orange-600 text-white px-6 py-2 mx-2 rounded-lg hover:bg-orange-700 ml-auto"
          >
            Reestablecer valores
          </button>

          <button
            onClick={handleSaveChanges}
            className="bg-indigo-600 text-white px-6 py-2 mx-2 rounded-lg hover:bg-indigo-700"
          >
            Guardar Cambios
          </button>
          </>
          :
        <button
          className="bg-gray-600 text-gray-300 px-6 py-2 mx-2 rounded-lg hover:bg-gray-700 ml-auto"
          disabled
        >
          Sin Cambios Detectados
        </button>
        }
        
      </div>

      <div className="space-y-3 h-[75vh] border p-5 rounded-lg overflow-y-auto">
        {localMenu.categories.map((cat, index) => (
          <div
            key={cat._id}
            className="border rounded-lg shadow-sm bg-white"
            draggable
            onDragStart={() => setDragCatIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragCatIndex === null) return;
              if (dragCatIndex === index) return;
              setLocalMenu((prev) => {
                if (!prev) return prev;
                const newCats = [...prev.categories];
                const [moved] = newCats.splice(dragCatIndex, 1);
                newCats.splice(index, 0, moved);
                // Recalcular orderCat
                const recalculated = newCats.map((c, i) => ({
                  ...c,
                  config: { ...c.config, orderCat: i + 1 },
                }));
                return { ...prev, categories: recalculated };
              });
              setDragCatIndex(null);
            }}
          >
            <div
              onClick={() => toggleCategory(cat._id)}
              className="w-full text-left p-3 flex  items-center bg-gray-100 cursor-pointer"
            >
              <MoveIcon size={16} className="mr-3 text-gray-500 cursor-move" />
              <span className="font-semibold w-60 border-r-2">{cat.name}</span>
              <span className="ml-3 text-xs text-gray-600">Orden #{cat.config.orderCat}</span>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openModal("category", cat)
                }}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mx-2"
              >
                Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCategory(cat._id)
                }}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 mx-2"
              >
                Eliminar
              </button>

              <span className="ml-auto">{expandedCat === cat._id ? "▲" : "▼"}</span>
            </div>

            {expandedCat === cat._id && (
              <div className="p-3 space-y-2">
                <div className="flex flex-wrap justify-end gap-2 mb-3">
                  <button
                    onClick={() => openModal("dish", null, cat._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    + Crear Plato
                  </button>
                </div>

                <ul className="divide-y">
                  {cat.dishes.map((dish) => (
                    <li key={dish._id} className="flex justify-between items-start py-3 gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-20 h-20 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                          {dish.image?.secure_url ? (
                            <img src={getDishImageUrl(dish.image, 160)} alt={dish.title} className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-xs text-gray-400">Sin imagen</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{dish.title}</p>
                          <div className="text-sm text-gray-600 mt-1 max-w-md">
                            {dish.description || 'Sin descripción'}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            {dish.discountPrice && dish.discountPrice > 0 ? (
                              <>
                                <span className="line-through text-gray-500">${dish.price.toFixed(2)}</span>
                                <span className="text-green-600 font-semibold">${dish.discountPrice.toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="font-semibold">${dish.price.toFixed(2)}</span>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${dish.available ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                              {dish.available ? 'Disponible' : 'No disponible'}
                            </span>
                            {dish.dayDish && (
                              <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">Plato del día</span>
                            )}
                            {dish.glutenFree && (
                              <span className="px-2 py-0.5 rounded text-xs bg-yellow-200 text-yellow-800">Sin TACC</span>
                            )}
                            {dish.veggie && (
                              <span className="px-2 py-0.5 rounded text-xs bg-green-200 text-green-800">Veggie</span>
                            )}
                            {dish.featuredText && (
                              <span className="px-2 py-0.5 rounded text-xs border" style={{ color: dish.featuredTextColor || '#000', borderColor: dish.featuredTextColor || '#000' }}>
                                {dish.featuredText}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal("dish", dish, cat._id)}
                          className="text-blue-600 hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteDish(cat._id, dish._id)}
                          className="text-red-600 hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>


      {showModal && (
        <Modal
          type={modalType}
          item={editingItem}
          onCancel={closeModal}
          onConfirm={handleSaveModal}
          orderLabel={categoryModalOrder}
        />
      )}
    </div>
  );
}


// 🔸 Modal reutilizable para crear/editar categorías y platos
function Modal({ type, item, onCancel, onConfirm, orderLabel }: any) {
  const [form, setForm] = useState<any>(
    item ||
      (type === "category"
        ? {
            name: "",
            config: {
              availableCat: true,
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
          }
        : {
            title: "",
            description: "",
            price: 0,
            discountPrice: 0,
            available: true,
            dayDish: false,
            glutenFree: false,
            veggie: false,
            EnDisplayDePaso: false,
            "EnDisplayComercial-1": false,
            "EnDisplayComercial-2": false,
            "EnDisplayComercial-3": false,
            featuredText: "",
            featuredTextColor: "#000000",
            image: undefined,
          })
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const num = value === '' ? '' : Number(value);
    setForm((prev: any) => ({ ...prev, [name]: num }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: checked }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setForm((prev: any) => ({ ...prev, featuredTextColor: value }));
  };

  // Category handlers (nested config)
  const handleCategoryConfigText = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, config: { ...prev?.config, [name]: value } }));
  };
  const handleCategoryAvailableToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setForm((prev: any) => ({ ...prev, config: { ...prev?.config, availableCat: checked } }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const sig = await getCloudinarySignature();
      const r = await uploadSignedToCloudinary(file, sig);
      setForm((prev: any) => ({
        ...prev,
        image: {
          secure_url: r.secure_url,
          public_id: r.public_id,
          width: r.width,
          height: r.height,
          format: r.format,
        },
      }));
    } catch (err) {
      alert('Error subiendo imagen');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-md w-80">
        <h2 className="text-lg font-semibold mb-4">
          {item ? "Editar" : "Crear"} {type === "category" ? `Categoría${orderLabel ? ` (Orden #${orderLabel})` : ''}` : "Plato"}
        </h2>

        <div className="space-y-3">
          {type === "category" ? (
            <>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleTextChange}
                placeholder="Nombre de la categoría"
                className="w-full border rounded px-3 py-2"
              />
              <label className="flex items-center gap-2 text-sm mt-2">
                <input type="checkbox" checked={!!form?.config?.availableCat} onChange={handleCategoryAvailableToggle} />
                Habilitado
              </label>

              <label className="block text-sm text-gray-600 mt-3">Descripción</label>
              <input
                type="text"
                name="descriptionCat"
                value={form?.config?.descriptionCat || ""}
                onChange={handleCategoryConfigText}
                placeholder="Descripción de la categoría"
                className="w-full border rounded px-3 py-2"
              />

              <div className="grid grid-cols-2 gap-2 mt-3">
                {Array.from({ length: 10 }).map((_, i) => {
                  const key = `item${i + 1}Cat` as const;
                  return (
                    <input
                      key={key}
                      type="text"
                      name={key}
                      value={form?.config?.[key] || ""}
                      onChange={handleCategoryConfigText}
                      placeholder={`Item ${i + 1}`}
                      className="w-full border rounded px-3 py-2"
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                name="title"
                value={form.title || ''}
                onChange={handleTextChange}
                placeholder="Nombre del plato"
                className="w-full border rounded px-3 py-2"
              />

              <textarea
                name="description"
                value={form.description || ''}
                onChange={handleTextChange}
                placeholder="Descripción"
                className="w-full border rounded px-3 py-2"
                rows={3}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Precio</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price ?? 0}
                    onChange={handleNumberChange}
                    placeholder="Precio"
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Precio con descuento</label>
                  <input
                    type="number"
                    name="discountPrice"
                    value={form.discountPrice ?? 0}
                    onChange={handleNumberChange}
                    placeholder="Descuento"
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="text-sm text-gray-600">Texto destacado</label>
                  <input
                    type="text"
                    name="featuredText"
                    value={form.featuredText || ''}
                    onChange={handleTextChange}
                    placeholder="Ej: Recomendado"
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Color del texto</label>
                  <input
                    type="color"
                    name="featuredTextColor"
                    value={form.featuredTextColor || '#000000'}
                    onChange={handleColorChange}
                    className="mt-1 w-full h-[42px] border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="available" checked={!!form.available} onChange={handleCheckboxChange} />
                  Disponible
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="dayDish" checked={!!form.dayDish} onChange={handleCheckboxChange} />
                  Plato del día
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="glutenFree" checked={!!form.glutenFree} onChange={handleCheckboxChange} />
                  Sin TACC
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="veggie" checked={!!form.veggie} onChange={handleCheckboxChange} />
                  Veggie
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="EnDisplayDePaso" checked={!!form.EnDisplayDePaso} onChange={handleCheckboxChange} />
                  En Display de Paso
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="EnDisplayComercial-1" checked={!!form["EnDisplayComercial-1"]} onChange={handleCheckboxChange} />
                  En Display Comercial 1
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="EnDisplayComercial-2" checked={!!form["EnDisplayComercial-2"]} onChange={handleCheckboxChange} />
                  En Display Comercial 2
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="EnDisplayComercial-3" checked={!!form["EnDisplayComercial-3"]} onChange={handleCheckboxChange} />
                  En Display Comercial 3
                </label>
              </div>

              <div className="mt-2">
                <label className="text-sm text-gray-600">Imagen del plato</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 w-full text-sm" />
                {form.image?.secure_url && (
                  <img src={getDishImageUrl(form.image, 200)} alt={form.title} className="mt-2 w-24 h-24 object-cover rounded" />
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(form)}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
