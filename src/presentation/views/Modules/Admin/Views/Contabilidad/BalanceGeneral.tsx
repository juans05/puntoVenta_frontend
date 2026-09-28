import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import { TableSkeleton } from "../../../../../../components/Skeleton";

const formatSoles = (n: number) => `S/ ${(n ?? 0).toFixed(2)}`;

const Seccion = ({ titulo, lineas }: { titulo: string; lineas: any[] }) => (
  <>
    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
      <h4 className="text-sm font-bold text-gray-700 uppercase">{titulo}</h4>
    </div>
    {lineas.length === 0 ? (
      <p className="px-5 py-4 text-sm text-gray-400">Sin movimientos.</p>
    ) : (
      <table className="w-full text-sm">
        <tbody>
          {lineas.map((l: any) => (
            <tr key={l.cuentaCodigo} className="border-b border-gray-50">
              <td className="px-5 py-2 text-gray-700">{l.cuentaCodigo} — {l.cuentaNombre}</td>
              <td className="px-5 py-2 text-right font-medium text-gray-900">{formatSoles(l.monto)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </>
);

// Balance General "a la fecha", calculado en vivo desde el libro diario -- sin asientos de cierre
// de periodo, la Utilidad del Ejercicio (Ingresos - Gastos acumulados) se agrega como linea
// sintetica de Patrimonio para que Activo siempre cuadre contra Pasivo + Patrimonio.
export const BalanceGeneral = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const hoy = new Date().toISOString().slice(0, 10);
  const [hasta, setHasta] = useState(hoy);

  const cargar = async () => {
    setLoading(true);
    try {
      const { data }: any = await axiosInstance.get("/asientos-contables/balance-general", { params: { hasta } });
      setData(data?.data ?? null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al cargar el balance general");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cuadra = data && Math.abs(data.totalActivo - data.totalPasivoYPatrimonio) < 0.01;

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-gray-900">Balance General</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-2xl">
        Activo, Pasivo y Patrimonio acumulados hasta la fecha elegida, calculados desde el libro diario.
      </p>

      <div className="flex flex-wrap items-end gap-3 mt-5 bg-white border border-gray-100 rounded-xl p-4">
        <div>
          <label className="text-xs font-semibold text-gray-500">A la fecha</label>
          <input type="date" className="block border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
            value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <button type="button" className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-60"
          onClick={cargar} disabled={loading}>
          {loading ? "Calculando..." : "Filtrar"}
        </button>
        {data && (
          <span className={`text-xs font-semibold rounded-full px-3 py-1.5 ${cuadra ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {cuadra ? "Cuadra ✓" : "No cuadra"}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-6"><TableSkeleton columns={2} /></div>
          ) : !data ? (
            <div className="p-10 text-center text-gray-500">No se pudo calcular el balance.</div>
          ) : (
            <>
              <Seccion titulo="Activo" lineas={data.activo} />
              <div className="flex justify-between px-5 py-3 bg-indigo-50 font-bold text-indigo-900">
                <span>Total Activo</span><span>{formatSoles(data.totalActivo)}</span>
              </div>
            </>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-6"><TableSkeleton columns={2} /></div>
          ) : !data ? (
            <div className="p-10 text-center text-gray-500">—</div>
          ) : (
            <>
              <Seccion titulo="Pasivo" lineas={data.pasivo} />
              <Seccion titulo="Patrimonio" lineas={data.patrimonio} />
              <div className="flex justify-between px-5 py-2 border-b border-gray-100 text-sm text-gray-600">
                <span>Resultado del ejercicio (no distribuido)</span><span>{formatSoles(data.resultadoDelEjercicio)}</span>
              </div>
              <div className="flex justify-between px-5 py-3 bg-indigo-50 font-bold text-indigo-900">
                <span>Total Pasivo + Patrimonio</span><span>{formatSoles(data.totalPasivoYPatrimonio)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
