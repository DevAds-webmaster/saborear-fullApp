import React, { useState ,useEffect} from "react";
import type { Resto, Menu, Category, Dish } from "../../types";
import { useResto } from '../../contexts/RestoContext';

interface MenuSectionProps {
  resto: Resto | null;
  updateResto: (restoId: string, restoData: Partial<Resto>) => Promise<Resto | null>;
}

export default function MenuSection({ resto, updateResto }: MenuSectionProps) {
  const [localMenu, setLocalMenu] = useState<Menu | null>(
    resto?.menu  ? resto.menu : null
  );
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
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
    setShowModal(true);
  };

  // 🔹 Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setModalType(null);
    setSelectedCategoryId(null);
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
            cat._id === (editingItem as Category)._id ? { ...cat, ...data } : cat
          ),
        });
      } else {
        // Crear categoría
        const newCat: Category = {
          _id: crypto.randomUUID(),
          name: data.name,
          config: {
            availableCat: true,
            orderCat: localMenu.categories.length + 1,
            descriptionCat: data.descriptionCat || "",
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
                image: "",
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
     const updated = await updateResto(resto._id, { menu: localMenu });
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
        {localMenu.categories.map((cat) => (
          <div key={cat._id} className="border rounded-lg shadow-sm bg-white">
            <div
              onClick={() => toggleCategory(cat._id)}
              className="w-full text-left p-3 flex  items-center bg-gray-100 cursor-pointer"
            >
              <span className="font-semibold w-60 border-r-2">{cat.name}</span>
              
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
                    <li key={dish._id} className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium">{dish.title}</p>
                        <p className="text-sm text-gray-500">${dish.price}</p>
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
        />
      )}
    </div>
  );
}


// 🔸 Modal reutilizable para crear/editar categorías y platos
function Modal({ type, item, onCancel, onConfirm }: any) {
  const [form, setForm] = useState<any>(
    item || (type === "category" ? { name: "" } : { title: "", price: 0 })
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-md w-80">
        <h2 className="text-lg font-semibold mb-4">
          {item ? "Editar" : "Crear"} {type === "category" ? "Categoría" : "Plato"}
        </h2>

        <div className="space-y-3">
          {type === "category" ? (
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nombre de la categoría"
              className="w-full border rounded px-3 py-2"
            />
          ) : (
            <>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Nombre del plato"
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Precio"
                className="w-full border rounded px-3 py-2"
              />
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
