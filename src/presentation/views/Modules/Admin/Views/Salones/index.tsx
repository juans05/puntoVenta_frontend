import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import { toast, Toaster } from "sonner";
import { Icon } from "@iconify/react";
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

interface ISalon {
  id: number;
  nombre: string;
  ubigeoId: string;
  ubigeoNombre: string | null;
  estado: boolean;
}

export const Salones = () => {
  const [items, setItems] = useState<ISalon[]>([]);
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [ubigeoId, setUbigeoId] = useState("");
  const [guardando, setGuardando] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data }: any = await axiosInstance.get("/extensiones/salones/listar");
      setItems(data?.data ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al cargar salones");
    } finally {
      setLoading(false);
    }
  };

  const loadUbigeos = async () => {
    try {
      const { data }: any = await axiosInstance.get("/extensiones/ubigeos");
      setUbicaciones(data?.data || []);
    } catch {
      toast.error("Error al cargar ubicaciones");
    }
  };

  useEffect(() => {
    loadData();
    loadUbigeos();
  }, []);

  const handleSubmit = async () => {
    if (!nombre.trim()) return toast.error("El nombre es obligatorio");
    if (!ubigeoId) return toast.error("Elige la ciudad del salón");

    setGuardando(true);
    try {
      await axiosInstance.post("/extensiones/salones/crear", { nombre, ubigeoId });
      toast.success("Salón registrado exitosamente");
      setModalOpen(false);
      setNombre("");
      setUbigeoId("");
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al registrar salón");
    } finally {
      setGuardando(false);
    }
  };

  const handleToggle = async (item: ISalon) => {
    const accion = item.estado ? "deshabilitar" : "habilitar";
    if (!window.confirm(`¿Seguro que deseas ${accion} "${item.nombre}"?`)) return;
    try {
      await axiosInstance.put(`/extensiones/salones/${item.id}/estado`, { estado: !item.estado });
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al cambiar el estado");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link to="/dashboard/pedidos" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <Icon icon="mdi:arrow-left" width={16} />
          Volver a Pedidos
        </Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Salones de recojo (Shalom)</h3>
          <p className="text-sm text-gray-500">Salones disponibles para que el cliente elija dónde recoger su pedido de provincia.</p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>Nuevo salón</Button>
      </div>

      <div className="relative overflow-x-auto sm:rounded-lg border border-gray-200 mb-8">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">Nombre</th>
              <th scope="col" className="px-4 py-3">Ciudad</th>
              <th scope="col" className="px-4 py-3">Estado</th>
              <th scope="col" className="px-4 py-3"></th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr><td colSpan={4} style={{ padding: 0 }}><TableSkeleton columns={4} /></td></tr>
            </tbody>
          ) : (
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center">No hay salones registrados todavía</td></tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.nombre}</td>
                  <td className="px-4 py-3">{item.ubigeoNombre}</td>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuevo salón</h3>
          <Input
            isLabel
            label="Nombre del salón"
            name="nombre"
            value={nombre}
            onChange={(e: any) => setNombre(e.target.value)}
          />
          <div className="mt-4">
            <label className="block text-sm text-gray-700 mb-1">Ciudad</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={ubigeoId}
              onChange={(e) => setUbigeoId(e.target.value)}
            >
              <option value="">Elige la ciudad</option>
              {ubicaciones.map((u: any) => (
                <option key={u.ubigeoId} value={u.ubigeoId}>
                  {u.departamento} - {u.provincia} - {u.distrito}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button size="sm" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSubmit} disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </Modal>

      <Toaster richColors position="top-right" duration={2000} />
    </div>
  );
};
