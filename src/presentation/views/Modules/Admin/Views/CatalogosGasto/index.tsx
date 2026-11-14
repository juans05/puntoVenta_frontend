import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { Toaster } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import { useFormErrors } from "../../../../../../components/FormError";
import Input from "../../../../../../components/Input";
import { Button } from "@tremor/react";
import { TableSkeleton } from "../../../../../../components/Skeleton";

Modal.setAppElement("#root");

const modalStyle = {
  overlay: { backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999 },
  content: {
    top: "50%", left: "50%", right: "auto", bottom: "auto",
    marginRight: "-50%", transform: "translate(-50%, -50%)",
    width: "min(92vw, 420px)", borderRadius: "1rem", padding: "0", border: "none",
  },
} as any;

interface ICatalogoItem {
  id: number;
  value: string;
  estado: boolean;
  cuentaContableId?: number | null;
  cuenta?: string | null;
}

interface ICatalogoTableProps {
  titulo: string;
  descripcion: string;
  labelNuevo: string;
  labelInput: string;
  listUrl: string;
  createUrl: string;
  estadoUrl: (id: number) => string;
  // Solo metodos de pago: permite editar el nombre y la cuenta contable (caja/banco) del asiento.
  updateUrl?: (id: number) => string;
}

const CatalogoTable = ({
  titulo,
  descripcion,
  labelNuevo,
  labelInput,
  listUrl,
  createUrl,
  estadoUrl,
  updateUrl,
}: ICatalogoTableProps) => {
  const [items, setItems] = useState<ICatalogoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState<ICatalogoItem | null>(null);
  const [cuentaContableId, setCuentaContableId] = useState(0);
  const [cuentas, setCuentas] = useState<any[]>([]);
  const columnas = updateUrl ? 4 : 3;

  useEffect(() => {
    if (!updateUrl) return;
    axiosInstance.get("/cuentas-contables/listar")
      .then((r: any) => setCuentas((r.data?.data ?? []).filter((c: any) => c.esHoja)))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data }: any = await axiosInstance.get(listUrl);
      setItems(data?.data ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { errors, setError, clearError, limpiarErrores } = useFormErrors();

  const abrir = (item: ICatalogoItem | null) => {
    limpiarErrores();
    setEditando(item);
    setNombre(item?.value ?? "");
    setCuentaContableId(item?.cuentaContableId ?? 0);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    limpiarErrores();
    if (!nombre.trim()) {
      setError("nombre", "El nombre es obligatorio");
      return toast.error("El nombre es obligatorio");
    }
    setGuardando(true);
    try {
      if (editando && updateUrl) await axiosInstance.put(updateUrl(editando.id), { nombre, cuentaContableId: cuentaContableId || null });
      else await axiosInstance.post(createUrl, { nombre });
      toast.success(editando ? "Actualizado" : "Registrado exitosamente");
      setModalOpen(false);
      setNombre("");
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al registrar");
    } finally {
      setGuardando(false);
    }
  };

  const handleToggle = async (item: ICatalogoItem) => {
    const accion = item.estado ? "deshabilitar" : "habilitar";
    if (!window.confirm(`¿Seguro que deseas ${accion} "${item.value}"?`)) return;
    try {
      await axiosInstance.put(estadoUrl(item.id), { estado: !item.estado });
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al cambiar el estado");
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
          <p className="text-sm text-gray-500">{descripcion}</p>
        </div>
        <Button size="sm" onClick={() => abrir(null)}>{labelNuevo}</Button>
      </div>

      <div className="relative overflow-x-auto sm:rounded-lg border border-gray-200 mb-8">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">Nombre</th>
              {updateUrl && <th scope="col" className="px-4 py-3">Cuenta contable</th>}
              <th scope="col" className="px-4 py-3">Estado</th>
              <th scope="col" className="px-4 py-3"></th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr><td colSpan={columnas} style={{ padding: 0 }}><TableSkeleton columns={columnas} /></td></tr>
            </tbody>
          ) : (
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={columnas} className="px-4 py-6 text-center">No hay registros todavía</td></tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.value}</td>
                  {updateUrl && <td className="px-4 py-3">{item.cuenta ?? <span className="text-gray-400">Por defecto (10)</span>}</td>}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.estado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {item.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {updateUrl && <Button size="xs" variant="secondary" onClick={() => abrir(item)}>Editar</Button>}
                    <Button size="xs" variant={item.estado ? "secondary" : "primary"} onClick={() => handleToggle(item)}>
                      {item.estado ? "Deshabilitar" : "Habilitar"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} style={modalStyle}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editando ? `Editar ${editando.value}` : labelNuevo}</h3>
          <Input
            isLabel
            label={labelInput}
            name="nombre"
            value={nombre}
            error={errors.nombre}
            onChange={(e: any) => { setNombre(e.target.value); clearError("nombre"); }}
          />
          {editando && updateUrl && (
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Cuenta contable (caja o banco)
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1" value={cuentaContableId}
                onChange={(e) => setCuentaContableId(Number(e.target.value))}>
                <option value={0}>Por defecto (10 Caja)</option>
                {cuentas.map((c) => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
              </select>
              <span className="text-xs font-normal text-gray-500">Los cobros y pagos con este método van a esta cuenta en el asiento.</span>
            </label>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <Button size="sm" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSubmit} disabled={guardando || Object.keys(errors).length > 0}>
              {guardando ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const CatalogosGasto = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link to="/dashboard/gastos" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <Icon icon="mdi:arrow-left" width={16} />
          Volver a Gastos
        </Link>
      </div>

      <CatalogoTable
        titulo="Categorías de gasto"
        descripcion="Categorías disponibles al registrar un nuevo gasto."
        labelNuevo="Nueva categoría"
        labelInput="Nombre de la categoría"
        listUrl="/gastos/categorias/listar"
        createUrl="/gastos/categorias/crear"
        estadoUrl={(id) => `/gastos/categorias/${id}/estado`}
      />

      <CatalogoTable
        titulo="Métodos de pago"
        descripcion="Métodos de pago disponibles al registrar un gasto o una venta."
        labelNuevo="Nuevo método de pago"
        labelInput="Nombre del método de pago"
        listUrl="/extensiones/metodo-pago/listar"
        createUrl="/extensiones/metodo-pago/crear"
        estadoUrl={(id) => `/extensiones/metodo-pago/${id}/estado`}
        updateUrl={(id) => `/extensiones/metodo-pago/${id}`}
      />

      <Toaster richColors position="top-right" duration={2000} />
    </div>
  );
};
