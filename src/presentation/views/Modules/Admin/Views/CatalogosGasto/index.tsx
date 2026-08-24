import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { Toaster } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
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
}

interface ICatalogoTableProps {
  titulo: string;
  descripcion: string;
  labelNuevo: string;
  labelInput: string;
  listUrl: string;
  createUrl: string;
  estadoUrl: (id: number) => string;
}

const CatalogoTable = ({
  titulo,
  descripcion,
  labelNuevo,
  labelInput,
  listUrl,
  createUrl,
  estadoUrl,
}: ICatalogoTableProps) => {
  const [items, setItems] = useState<ICatalogoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);

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

  const handleSubmit = async () => {
    if (!nombre.trim()) return toast.error("El nombre es obligatorio");
    setGuardando(true);
    try {
      await axiosInstance.post(createUrl, { nombre });
      toast.success("Registrado exitosamente");
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
        <Button size="sm" onClick={() => setModalOpen(true)}>{labelNuevo}</Button>
      </div>

      <div className="relative overflow-x-auto sm:rounded-lg border border-gray-200 mb-8">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">Nombre</th>
              <th scope="col" className="px-4 py-3">Estado</th>
              <th scope="col" className="px-4 py-3"></th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr><td colSpan={3} style={{ padding: 0 }}><TableSkeleton columns={3} /></td></tr>
            </tbody>
          ) : (
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-6 text-center">No hay registros todavía</td></tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.value}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.estado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {item.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{labelNuevo}</h3>
          <Input
            isLabel
            label={labelInput}
            name="nombre"
            value={nombre}
            onChange={(e: any) => setNombre(e.target.value)}
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button size="sm" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSubmit} disabled={guardando}>
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
      />

      <Toaster richColors position="top-right" duration={2000} />
    </div>
  );
};
