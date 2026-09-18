import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import { TableSkeleton } from "../../../../../../components/Skeleton";
import ExportExcel from "../../../../../../components/ExportExcel/ExportExcel";

interface IColumna {
  key: string;
  label: string;
  align?: "right";
}

interface IProps {
  titulo: string;
  descripcion: string;
  endpoint: string;
  columnas: IColumna[];
  filename: string;
  conSucursal?: boolean;
}

export const ContabilidadReporte = ({
  titulo,
  descripcion,
  endpoint,
  columnas,
  filename,
  conSucursal = true,
}: IProps) => {
  const [filas, setFilas] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [sucursalId, setSucursalId] = useState("");

  const cargar = async () => {
    setLoading(true);
    try {
      const { data }: any = await axiosInstance.get(endpoint, {
        params: {
          fechaInicio: fechaInicio || undefined,
          fechaFin: fechaFin || undefined,
          sucursalId: sucursalId || undefined,
        },
      });
      setFilas(data?.data ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al cargar el reporte");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    if (conSucursal) {
      axiosInstance
        .get("/extensiones/sucursales")
        .then(({ data }: any) => setSucursales(data?.data ?? []))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tableId = `tabla-${filename}`;

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-gray-900">{titulo}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-2xl">{descripcion}</p>

      <div className="flex flex-wrap items-end gap-3 mt-5 bg-white border border-gray-100 rounded-xl p-4">
        <div>
          <label className="text-xs font-semibold text-gray-500">Desde</label>
          <input
            type="date"
            className="block border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Hasta</label>
          <input
            type="date"
            className="block border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
        {conSucursal && (
          <div>
            <label className="text-xs font-semibold text-gray-500">Sucursal</label>
            <select
              className="block border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
              value={sucursalId}
              onChange={(e) => setSucursalId(e.target.value)}
            >
              <option value="">Todas</option>
              {sucursales.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.value}
                </option>
              ))}
            </select>
          </div>
        )}
        <button
          type="button"
          className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-60"
          onClick={cargar}
          disabled={loading}
        >
          {loading ? "Buscando..." : "Filtrar"}
        </button>
        {filas.length > 0 && <ExportExcel filename={filename} refTable={tableId} />}
      </div>

      <div className="mt-4 bg-white border border-gray-100 rounded-2xl overflow-x-auto">
        {loading ? (
          <div className="p-6">
            <TableSkeleton columns={columnas.length} />
          </div>
        ) : (
          <table id={tableId} className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                {columnas.map((c) => (
                  <th key={c.key} className="px-4 py-3 whitespace-nowrap">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.length === 0 ? (
                <tr>
                  <td colSpan={columnas.length} className="px-4 py-10 text-center text-gray-500">
                    No hay registros para el rango seleccionado.
                  </td>
                </tr>
              ) : (
                filas.map((fila, i) => (
                  <tr key={i} className="bg-white border-b hover:bg-gray-50">
                    {columnas.map((c) => (
                      <td
                        key={c.key}
                        className={`px-4 py-3 whitespace-nowrap ${c.align === "right" ? "text-right" : ""}`}
                      >
                        {fila[c.key] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
