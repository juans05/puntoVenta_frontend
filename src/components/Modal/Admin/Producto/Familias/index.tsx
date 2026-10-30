import Modal from "react-modal";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "../../../../../utils/axios";

interface IFamilia {
  grupoId: number;
  nombre: string;
}

// El backend devuelve el detalle del error en data (string) y un titulo generico en message.
const mensajeError = (error: any, porDefecto: string) =>
  typeof error?.response?.data?.data === "string" ? error.response.data.data : error?.response?.data?.message ?? porDefecto;

// CRUD de familias (entidad Grupo) de una categoria: se elige la categoria y se listan, agregan,
// renombran o eliminan sus familias.
export const FamiliasModal = ({ isOpen, onClose, categorias }: { isOpen: boolean; onClose: () => void; categorias: any[] }) => {
  const opciones = (categorias ?? []).filter((c: any) => c.categoriaId !== 0);
  const [categoriaId, setCategoriaId] = useState(0);
  const [familias, setFamilias] = useState<IFamilia[]>([]);
  const [nueva, setNueva] = useState("");
  const [editando, setEditando] = useState<IFamilia | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = (id: number) => {
    if (!id) return setFamilias([]);
    axiosInstance
      .get("/Grupo/listar", { params: { CategoriaId: id } })
      .then((r: any) => setFamilias((r.data?.data ?? []).filter((g: any) => g.grupoId !== 0)))
      .catch(() => setFamilias([])); // 404 = sin familias
  };

  useEffect(() => {
    if (isOpen && !categoriaId && opciones.length) setCategoriaId(opciones[0].categoriaId);
  }, [isOpen, opciones.length]);

  useEffect(() => cargar(categoriaId), [categoriaId]);

  const agregar = async () => {
    if (!nueva.trim()) return toast.error("Escribe el nombre de la familia");
    setGuardando(true);
    try {
      await axiosInstance.post("/Grupo/crear", { categoriaId, nombre: nueva.trim() });
      setNueva("");
      cargar(categoriaId);
      toast.success("Familia creada");
    } catch (error) {
      toast.error(mensajeError(error, "No se pudo crear la familia"));
    } finally {
      setGuardando(false);
    }
  };

  const renombrar = async () => {
    if (!editando?.nombre.trim()) return toast.error("El nombre es obligatorio");
    setGuardando(true);
    try {
      await axiosInstance.put("/Grupo/modificar", { grupoId: editando.grupoId, nombre: editando.nombre.trim() });
      setEditando(null);
      cargar(categoriaId);
      toast.success("Familia actualizada");
    } catch (error) {
      toast.error(mensajeError(error, "No se pudo actualizar la familia"));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (f: IFamilia) => {
    if (!window.confirm(`¿Eliminar la familia "${f.nombre}"?`)) return;
    try {
      await axiosInstance.delete("/Grupo/eliminar", { params: { IdGrupo: f.grupoId } });
      cargar(categoriaId);
      toast.success("Familia eliminada");
    } catch (error) {
      toast.error(mensajeError(error, "No se pudo eliminar la familia"));
    }
  };

  const input = "border border-gray-200 rounded-lg px-3 py-2 text-sm";

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="bg-white rounded-2xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto outline-none mx-4"
      overlayClassName="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-bold text-gray-900">Familias</h3>
        <button type="button" aria-label="Cerrar" className="text-gray-400 hover:text-gray-700 text-xl" onClick={onClose}>✕</button>
      </div>
      <p className="text-sm text-gray-500 mb-4">Cada familia pertenece a una categoría. Elige la categoría para ver y editar sus familias.</p>

      {opciones.length === 0 ? (
        <p className="text-sm text-amber-600">Primero crea una categoría.</p>
      ) : (
        <>
          <label className="text-xs font-semibold text-gray-500">Categoría</label>
          <select className={`${input} w-full mt-1 mb-4`} value={categoriaId}
            onChange={(e) => { setCategoriaId(Number(e.target.value)); setEditando(null); }}>
            {opciones.map((c: any) => (
              <option key={c.categoriaId} value={c.categoriaId}>{c.nombre}</option>
            ))}
          </select>

          <div className="flex gap-2 mb-4">
            <input className={`${input} flex-1`} placeholder="Nueva familia" value={nueva}
              onChange={(e) => setNueva(e.target.value)} onKeyDown={(e) => e.key === "Enter" && agregar()} />
            <button type="button" disabled={guardando || !categoriaId} onClick={agregar}
              className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-60">
              Agregar
            </button>
          </div>

          <ul className="border border-gray-100 rounded-xl divide-y">
            {familias.length === 0 && <li className="px-3 py-6 text-center text-sm text-gray-400">Esta categoría no tiene familias.</li>}
            {familias.map((f) => (
              <li key={f.grupoId} className="flex items-center gap-2 px-3 py-2">
                {editando?.grupoId === f.grupoId ? (
                  <>
                    <input className={`${input} flex-1`} autoFocus value={editando.nombre}
                      onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && renombrar()} />
                    <button type="button" disabled={guardando} onClick={renombrar} className="text-sm font-semibold text-indigo-600">Guardar</button>
                    <button type="button" onClick={() => setEditando(null)} className="text-sm text-gray-500">Cancelar</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-800">{f.nombre}</span>
                    <button type="button" onClick={() => setEditando({ ...f })} className="text-sm text-indigo-600">Editar</button>
                    <button type="button" onClick={() => eliminar(f)} className="text-sm text-red-600">Eliminar</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </Modal>
  );
};
