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
    width: "min(92vw, 460px)", borderRadius: "1rem", padding: "0", border: "none",
  },
} as any;

// Los 5 catalogos (MotivoNota/TipoIgv/UnidadMedida/TipoOperacion/Moneda) son "base SUNAT +
// personalizable por tenant": las filas base (esPersonalizado=false) las trae el sistema para
// todos los negocios y no se pueden editar ni deshabilitar -- solo se puede crear/editar/
// deshabilitar lo que cada negocio agrega (esPersonalizado=true). Este componente generico
// sirve para los 5, cambiando solo el esquema de "fields".

type TipoCampo = "text" | "checkbox" | "select";

interface ICampoConfig {
  key: string;
  label: string;
  type: TipoCampo;
  options?: { value: number; label: string }[];
}

interface ICatalogoItem {
  id: number;
  codigo: string;
  estado: boolean;
  esPersonalizado: boolean;
  [key: string]: any;
}

interface ICatalogoCrudProps {
  titulo: string;
  descripcion: string;
  listUrl: string;
  createUrl: string;
  updateUrl: (id: number) => string;
  estadoUrl: (id: number) => string;
  fields: ICampoConfig[];
}

const valorPorDefecto = (field: ICampoConfig) => (field.type === "checkbox" ? false : field.type === "select" ? field.options?.[0]?.value ?? 0 : "");

const CatalogoCrudTable = ({ titulo, descripcion, listUrl, createUrl, updateUrl, estadoUrl, fields }: ICatalogoCrudProps) => {
  const [items, setItems] = useState<ICatalogoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<ICatalogoItem | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
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

  const abrirNuevo = () => {
    setEditando(null);
    const inicial: Record<string, any> = {};
    fields.forEach((f) => (inicial[f.key] = valorPorDefecto(f)));
    setForm(inicial);
    setModalOpen(true);
  };

  const abrirEditar = (item: ICatalogoItem) => {
    setEditando(item);
    const inicial: Record<string, any> = {};
    fields.forEach((f) => (inicial[f.key] = item[f.key]));
    setForm(inicial);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    for (const f of fields) {
      if (f.type === "text" && !String(form[f.key] ?? "").trim()) {
        return toast.error(`${f.label} es obligatorio`);
      }
    }
    setGuardando(true);
    try {
      if (editando) {
        await axiosInstance.put(updateUrl(editando.id), form);
        toast.success("Actualizado exitosamente");
      } else {
        await axiosInstance.post(createUrl, form);
        toast.success("Registrado exitosamente");
      }
      setModalOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const handleToggle = async (item: ICatalogoItem) => {
    const accion = item.estado ? "deshabilitar" : "habilitar";
    if (!window.confirm(`¿Seguro que deseas ${accion} "${item.codigo}"?`)) return;
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
        <Button size="sm" onClick={abrirNuevo}>Nuevo</Button>
      </div>

      <div className="relative overflow-x-auto sm:rounded-lg border border-gray-200 mb-8">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {fields.map((f) => (
                <th key={f.key} scope="col" className="px-4 py-3">{f.label}</th>
              ))}
              <th scope="col" className="px-4 py-3">Origen</th>
              <th scope="col" className="px-4 py-3">Estado</th>
              <th scope="col" className="px-4 py-3"></th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr><td colSpan={fields.length + 3} style={{ padding: 0 }}><TableSkeleton columns={fields.length + 3} /></td></tr>
            </tbody>
          ) : (
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={fields.length + 3} className="px-4 py-6 text-center">No hay registros todavía</td></tr>
              )}
              {items.map((item) => (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                  {fields.map((f) => (
                    <td key={f.key} className="px-4 py-3">
                      {f.type === "checkbox"
                        ? (item[f.key] ? "Sí" : "No")
                        : f.type === "select"
                        ? f.options?.find((o) => o.value === item[f.key])?.label ?? item[f.key]
                        : item[f.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.esPersonalizado ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      {item.esPersonalizado ? "Tuyo" : "SUNAT"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.estado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {item.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.esPersonalizado ? (
                      <div className="flex gap-2">
                        <Button size="xs" variant="secondary" onClick={() => abrirEditar(item)}>
                          Editar
                        </Button>
                        <Button size="xs" variant={item.estado ? "secondary" : "primary"} onClick={() => handleToggle(item)}>
                          {item.estado ? "Deshabilitar" : "Habilitar"}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Catálogo base, no editable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} style={modalStyle}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editando ? `Editar ${titulo}` : `Nuevo: ${titulo}`}</h3>
          <div className="flex flex-col gap-3">
            {fields.map((f) => {
              if (f.type === "checkbox") {
                return (
                  <label key={f.key} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={!!form[f.key]}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.checked }))}
                    />
                    {f.label}
                  </label>
                );
              }
              if (f.type === "select") {
                return (
                  <div key={f.key}>
                    <label className="block text-sm text-gray-700 mb-1">{f.label}</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={form[f.key] ?? ""}
                      onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))}
                    >
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                );
              }
              return (
                <Input
                  key={f.key}
                  isLabel
                  label={f.label}
                  name={f.key}
                  value={form[f.key] ?? ""}
                  onChange={(e: any) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                />
              );
            })}
          </div>
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

const TIPO_DOC_VENTA_NOTA_CREDITO = 4;
const TIPO_DOC_VENTA_NOTA_DEBITO = 5;

export const CatalogosDocumentos = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link to="/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <Icon icon="mdi:arrow-left" width={16} />
          Volver
        </Link>
      </div>

      <CatalogoCrudTable
        titulo="Tipos de IGV"
        descripcion="Códigos de afectación del IGV usados en el detalle de cada comprobante."
        listUrl="/extensiones/tipos-igv/listar"
        createUrl="/extensiones/tipos-igv/crear"
        updateUrl={(id) => `/extensiones/tipos-igv/${id}`}
        estadoUrl={(id) => `/extensiones/tipos-igv/${id}/estado`}
        fields={[
          { key: "codigo", label: "Código", type: "text" },
          { key: "descripcion", label: "Descripción", type: "text" },
          { key: "aplicaPorcentajeImpuesto", label: "Aplica IGV (18%)", type: "checkbox" },
        ]}
      />

      <CatalogoCrudTable
        titulo="Unidades de Medida"
        descripcion="Unidades disponibles al elegir la presentación de un producto en el detalle."
        listUrl="/extensiones/unidades-medida/listar"
        createUrl="/extensiones/unidades-medida/crear"
        updateUrl={(id) => `/extensiones/unidades-medida/${id}`}
        estadoUrl={(id) => `/extensiones/unidades-medida/${id}/estado`}
        fields={[
          { key: "codigo", label: "Código", type: "text" },
          { key: "descripcion", label: "Descripción", type: "text" },
        ]}
      />

      <CatalogoCrudTable
        titulo="Tipos de Operación"
        descripcion="Tipos de operación disponibles en las Opc. Avanzadas de Nueva Factura/Boleta."
        listUrl="/extensiones/tipos-operacion/listar"
        createUrl="/extensiones/tipos-operacion/crear"
        updateUrl={(id) => `/extensiones/tipos-operacion/${id}`}
        estadoUrl={(id) => `/extensiones/tipos-operacion/${id}/estado`}
        fields={[
          { key: "codigo", label: "Código", type: "text" },
          { key: "descripcion", label: "Descripción", type: "text" },
        ]}
      />

      <CatalogoCrudTable
        titulo="Motivos de Nota"
        descripcion="Motivos disponibles al emitir una Nota de Crédito o Nota de Débito."
        listUrl="/extensiones/motivos-nota/listar"
        createUrl="/extensiones/motivos-nota/crear"
        updateUrl={(id) => `/extensiones/motivos-nota/${id}`}
        estadoUrl={(id) => `/extensiones/motivos-nota/${id}/estado`}
        fields={[
          { key: "codigo", label: "Código", type: "text" },
          { key: "descripcion", label: "Descripción", type: "text" },
          { key: "revierteStock", label: "Revierte stock", type: "checkbox" },
          {
            key: "tipoDocumentoVentaId",
            label: "Aplica a",
            type: "select",
            options: [
              { value: TIPO_DOC_VENTA_NOTA_CREDITO, label: "Nota de Crédito" },
              { value: TIPO_DOC_VENTA_NOTA_DEBITO, label: "Nota de Débito" },
            ],
          },
        ]}
      />

      <CatalogoCrudTable
        titulo="Monedas"
        descripcion="Monedas disponibles en el Tipo de Moneda de las Opc. Avanzadas."
        listUrl="/extensiones/monedas/listar"
        createUrl="/extensiones/monedas/crear"
        updateUrl={(id) => `/extensiones/monedas/${id}`}
        estadoUrl={(id) => `/extensiones/monedas/${id}/estado`}
        fields={[
          { key: "codigo", label: "Código (ISO)", type: "text" },
          { key: "simbolo", label: "Símbolo", type: "text" },
          { key: "locale", label: "Locale", type: "text" },
          {
            key: "paisId",
            label: "País",
            type: "select",
            options: [
              { value: 604, label: "Perú" },
              { value: 484, label: "México" },
              { value: 170, label: "Colombia" },
              { value: 218, label: "Ecuador" },
            ],
          },
        ]}
      />

      <Toaster richColors position="top-right" duration={2000} />
    </div>
  );
};
