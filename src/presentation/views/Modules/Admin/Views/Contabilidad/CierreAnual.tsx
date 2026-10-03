import { useState } from "react";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";

const formatSoles = (n: number) => `S/ ${(n ?? 0).toFixed(2)}`;

const FASES = [
  "Validaciones previas",
  "Determinación del resultado (Clase 8)",
  "Cierre de cuentas de resultados",
  "Cierre del Balance General (Clases 1 a 5)",
  "Asiento de apertura (1° de enero)",
];

// Asistente de cierre de año fiscal: Fase 1 es el checklist (validar); las fases 2 a 5 se generan
// juntas, en una sola transaccion, al ejecutar. Requiere Cuenta Cierre en cada cuenta con saldo.
export const CierreAnual = () => {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [tasa, setTasa] = useState(29.5);
  const [confirmaDifCambio, setConfirmaDifCambio] = useState(false);
  const [validacion, setValidacion] = useState<any>(null);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const payload = { anio, tasaImpuestoRenta: tasa, confirmaDifCambio };

  const validar = async () => {
    setLoading(true);
    setResultado(null);
    try {
      const { data }: any = await axiosInstance.post("/cierre-anual/validar", payload);
      setValidacion(data?.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al validar");
    } finally {
      setLoading(false);
    }
  };

  const ejecutar = async () => {
    if (!window.confirm(`Se generarán los asientos de cierre del ${anio} y la apertura del ${anio + 1}. ¿Continuar?`)) return;
    setLoading(true);
    try {
      const { data }: any = await axiosInstance.post("/cierre-anual/ejecutar", payload);
      setResultado(data?.data);
      setValidacion(null);
      toast.success("Cierre del año ejecutado");
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al ejecutar el cierre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-bold mb-4">Asistente de cierre de año fiscal</h1>

      <ol className="text-sm text-gray-500 mb-4 list-decimal pl-5">
        {FASES.map((f) => <li key={f}>{f}</li>)}
      </ol>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 block">Año fiscal</label>
          <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={anio} onChange={(e) => setAnio(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block">Impuesto a la Renta (%)</label>
          <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={tasa} onChange={(e) => setTasa(Number(e.target.value))} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm mb-4">
        <input type="checkbox" checked={confirmaDifCambio} onChange={(e) => setConfirmaDifCambio(e.target.checked)} />
        Confirmo que la diferencia de cambio (NIC 21) de las cuentas monetarias ya fue ejecutada al 31 de diciembre
      </label>

      <button className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm disabled:opacity-50" disabled={loading} onClick={validar}>
        Fase 1: Validar
      </button>

      {validacion && (
        <div className="mt-4">
          <ul className="text-sm space-y-1">
            {validacion.checklist.map((i: any) => (
              <li key={i.descripcion} className={i.ok ? "text-green-700" : "text-red-600"}>
                {i.ok ? "✔" : "✘"} {i.descripcion}{!i.ok && i.detalle ? ` — ${i.detalle}` : ""}
              </li>
            ))}
          </ul>
          <button className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-50" disabled={loading || !validacion.puedeCerrar} onClick={ejecutar}>
            Ejecutar fases 2 a 5
          </button>
        </div>
      )}

      {resultado && (
        <div className="mt-4 text-sm">
          <p>Resultado antes de impuestos: <b>{formatSoles(resultado.resultadoAntesDeImpuestos)}</b></p>
          <p>Impuesto a la Renta: <b>{formatSoles(resultado.impuestoRenta)}</b></p>
          <p className="mb-2">Resultado neto: <b>{formatSoles(resultado.resultadoNeto)}</b></p>
          <ul className="space-y-1">
            {resultado.fases.map((f: any) => (
              <li key={f.asientoNumero}>Fase {f.fase} — {f.asientoNumero}: {f.nombre} ({formatSoles(f.total)})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
