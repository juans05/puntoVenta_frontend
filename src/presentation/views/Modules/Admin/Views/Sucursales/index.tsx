import { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import Input from "../../../../../../components/Input";
import SelectPro from "../../../../../../components/SelectPro";
import SelectUbigeo from "../../../../../../components/SelectPro/SelectUbigeo";
import { Button } from "@tremor/react";
import { TableSkeleton } from "../../../../../../components/Skeleton";

Modal.setAppElement("#root");

const modalStyle = {
  overlay: { backgroundColor: "rgba(0,0,0,0.5)", zIndex: 999 },
  content: {
    top: "50%", left: "50%", right: "auto", bottom: "auto",
    marginRight: "-50%", transform: "translate(-50%, -50%)",
    width: "min(92vw, 480px)", borderRadius: "1rem", padding: "0", border: "none",
  },
} as any;

const initialForm = {
  nombre: "",
  direccion: "",
  ubigeo: "",
  ubigeoId: "",
  rubro: "",
  rubroId: 0,
};

interface ISucursal {
  id: number;
  value: string;
  direccion: string;
  ubigeoId: string;
  rubroId: number;
}

export const Sucursales = () => {
  const [sucursales, setSucursales] = useState<ISucursal[]>([]);
  const [ubigeos, setUbigeos] = useState<any[]>([]);
  const [rubros, setRubros] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [suc, ub, ru]: any[] = await Promise.all([
        axiosInstance.get(`/extensiones/sucursales`),
        axiosInstance.get(`/extensiones/ubigeos`),
        axiosInstance.get(`/extensiones/rubros`),
      ]);
      setSucursales(suc?.data?.data ?? []);
      setUbigeos(ub?.data?.data ?? []);
      setRubros(ru?.data?.data ?? []);
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
    setForm({ ...form, [name]: value, [id]: idValue });
  };

  const handleSubmit = async () => {
    if (!form.nombre.trim()) return toast.error("El nombre de la sucursal es obligatorio");
    setCreando(true);
    try {
      const { status }: any = await axiosInstance.post(`/extensiones/crear-sucursal`, {
        nombre: form.nombre,
        direccion: form.direccion,
        ubigeoId: form.ubigeoId,
        rubroId: form.rubroId ? Number(form.rubroId) : null,
      });
      if (status === 200) {
        toast.success("Sucursal creada exitosamente");
        setModalOpen(false);
        setForm(initialForm);
        loadData();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al crear la sucursal");
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sucursales</h3>
          <p className="text-sm text-gray-500">Sedes o locales del negocio.</p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>Agregar sucursal</Button>
      </div>

      <div className="relative overflow-x-auto sm:rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">N°</th>
              <th scope="col" className="px-4 py-3">Nombre</th>
              <th scope="col" className="px-4 py-3">Dirección</th>
              <th scope="col" className="px-4 py-3">Ubigeo</th>
              <th scope="col" className="px-4 py-3">Rubro</th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr><td colSpan={5} style={{ padding: 0 }}><TableSkeleton columns={5} /></td></tr>
            </tbody>
          ) : (
          <tbody>
            {!loading && sucursales.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center">No hay sucursales</td></tr>
            )}
            {!loading &&
              sucursales.map((s, index) => {
                const ru = rubros.find((r) => Number(r.id) === Number(s.rubroId));
                return (
                  <tr key={s.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.value}</td>
                    <td className="px-4 py-3">{s.direccion}</td>
                    <td className="px-4 py-3">{s.ubigeoId}</td>
                    <td className="px-4 py-3">{ru?.value ?? ""}</td>
                  </tr>
                );
              })}
          </tbody>
          )}
        </table>
      </div>

      <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} style={modalStyle}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva sucursal</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input isLabel label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <Input isLabel label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <SelectUbigeo
                isSearch isLabel label="Ubigeo"
                name="ubigeo" id="ubigeoId"
                defaultValue={form.ubigeo}
                options={ubigeos}
                onChange={handleSelect}
              />
            </div>
            <div className="col-span-2">
              <SelectPro
                isSearch isLabel label="Rubro"
                name="rubro" id="rubroId"
                defaultValue={form.rubro}
                options={rubros}
                onChange={handleSelect}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button size="sm" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSubmit} disabled={creando}>
              {creando ? "Creando..." : "Crear sucursal"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};