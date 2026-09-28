import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import { TableSkeleton } from "../../../../../../components/Skeleton";

const formatSoles = (n: number) => `S/ ${(n ?? 0).toFixed(2)}`;

// Estado de Resultados (Ingresos - Gastos = Utilidad Neta), calculado en vivo desde el libro
// diario (AsientoContable/AsientoContableDetalle) -- no hay asientos de cierre de periodo, asi
// que esto es simplemente la suma de movimientos de cuentas Ingreso/Gasto en el rango elegido.
export const EstadoResultados = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const cargar = async () => {
    setLoading(true);
    try {
      const { data }: any = await axiosInstance.get("/asientos-contables/estado-resultados", {
        params: { desde: desde || undefined, hasta: hasta || undefined },
      });
      setData(data?.data ?? null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al cargar el estado de resultados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-gray-900">Estado de Resultados</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-2xl">
        Ingresos y gastos del periodo, calculados desde el libro diario. Sin filtro de fechas muestra todo el historial.
      </p>

      <div className="flex flex-wrap items-end gap-3 mt-5 bg-white border border-gray-100 rounded-xl p-4">
        <div>
          <label className="text-xs font-semibold text-gray-500">Desde</label>
          <input type="date" className="block border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
            value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Hasta</label>
          <input type="date" className="block border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
            value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <button type="button" className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-60"
          onClick={cargar} disabled={loading}>
          {loading ? "Calculando..." : "Filtrar"}
        </button>
      </div>

      <div className="mt-4 bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton columns={2} /></div>
        ) : !data ? (
          <div className="p-10 text-center text-gray-500">No se pudo calcular el estado de resultados.</div>
        ) : (
          <>
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-700 uppercase">Ingresos</h4>
            </div>
            {data.ingresos.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">Sin movimientos.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {data.ingresos.map((l: any) => (
                    <tr key={l.cuentaCodigo} className="border-b border-gray-50">
                      <td className="px-5 py-2 text-gray-700">{l.cuentaCodigo} — {l.cuentaNombre}</td>
                      <td className="px-5 py-2 text-right font-medium text-gray-900">{formatSoles(l.monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex justify-between px-5 py-2 bg-gray-50 border-y border-gray-100 font-bold text-gray-900">
              <span>Total Ingresos</span><span>{formatSoles(data.totalIngresos)}</span>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 mt-2">
              <h4 className="text-sm font-bold text-gray-700 uppercase">Gastos</h4>
            </div>
            {data.gastos.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">Sin movimientos.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {data.gastos.map((l: any) => (
                    <tr key={l.cuentaCodigo} className="border-b border-gray-50">
                      <td className="px-5 py-2 text-gray-700">{l.cuentaCodigo} — {l.cuentaNombre}</td>
                      <td className="px-5 py-2 text-right font-medium text-gray-900">{formatSoles(l.monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="flex justify-between px-5 py-2 bg-gray-50 border-y border-gray-100 font-bold text-gray-900">
              <span>Total Gastos</span><span>{formatSoles(data.totalGastos)}</span>
            </div>

            <div className={`flex justify-between px-5 py-4 font-bold text-lg ${data.utilidadNeta >= 0 ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"}`}>
              <span>Utilidad Neta</span><span>{formatSoles(data.utilidadNeta)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
