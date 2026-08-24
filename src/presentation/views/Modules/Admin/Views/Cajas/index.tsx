import { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import Input from "../../../../../../components/Input";
import SelectPro from "../../../../../../components/SelectPro";
import { Button } from "@tremor/react";
import { TableSkeleton } from "../../../../../../components/Skeleton";

Modal.setAppElement("#root");

const modalStyle = {
  overlay: { backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999 },
  content: {
    top: "50%", left: "50%", right: "auto", bottom: "auto",
    marginRight: "-50%", transform: "translate(-50%, -50%)",
    width: "min(92vw, 440px)", borderRadius: "1rem", padding: "0", border: "none",
  },
} as any;

const initialForm = {
  nombre: "",
  sucursal: "",
  sucursalId: null as number | null,
};

interface ICaja {
  id: number;
  nombre: string;
  sucursalId: number | null;
  sucursal: string | null;
}

export const Cajas = () => {
  const [cajas, setCajas] = useState<ICaja[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cj, su]: any[] = await Promise.all([
        axiosInstance.get(`/caja/cajas`),
        axiosInstance.get(`/extensiones/sucursales`),
      ]);
      setCajas(cj?.data?.data ?? []);
      setSucursales(su?.data?.data ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (idValue: any, value: string, name: string, id: string) => {
    setForm({ ...form, [name]: value, [id]: idValue ? Number(idValue) : null });
  };

  const handleSubmit = async () => {
    if (!form.nombre.trim()) return toast.error("El nombre de la caja es obligatorio");
    setCreando(true);
    try {
      const { status }: any = await axiosInstance.post(`/caja/crear-caja`, {
        nombre: form.nombre,
        sucursalId: form.sucursalId,
      });
      if (status === 200) {
        toast.success("Caja creada exitosamente");
        setModalOpen(false);
        setForm(initialForm);
        loadData();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al crear la caja");
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Cajas del local</h3>
          <p className="text-sm text-gray-500">
            Puede haber más de una caja por sucursal.
          </p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>Agregar caja</Button>
      </div>

      <div className="relative overflow-x-auto sm:rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">N°</th>
              <th scope="col" className="px-4 py-3">Nombre</th>
              <th scope="col" className="px-4 py-3">Sucursal</th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr><td colSpan={3} style={{ padding: 0 }}><TableSkeleton columns={3} /></td></tr>
            </tbody>
          ) : (
          <tbody>
            {cajas.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center">No hay cajas registradas</td></tr>
            )}
            {cajas.map((c, index) => (
                <tr key={c.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.nombre}</td>
                  <td className="px-4 py-3">{c.sucursal ?? "Sin sucursal"}</td>
                </tr>
              ))}
          </tbody>
          )}
        </table>
      </div>

      <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} style={modalStyle}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva caja</h3>
          <div className="grid grid-cols-1 gap-4">
            <Input isLabel label="Nombre de la caja *" name="nombre" value={form.nombre} onChange={handleChange} />
            <SelectPro
              isSearch isLabel label="Sucursal"
              name="sucursal" id="sucursalId"
              defaultValue={form.sucursal}
              options={sucursales.map((s) => ({ id: s.id, value: s.value }))}
              onChange={handleSelect}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button size="sm" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSubmit} disabled={creando}>
              {creando ? "Creando..." : "Crear caja"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};