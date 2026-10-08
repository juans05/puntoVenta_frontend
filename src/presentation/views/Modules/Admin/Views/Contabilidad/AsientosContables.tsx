import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import { TableSkeleton } from "../../../../../../components/Skeleton";
import { AsientoManualForm } from "./AsientoManualForm";

const ORIGENES = [
  { value: "", label: "Todos los orígenes" },
  { value: "MovimientoInventario", label: "Recepción de orden" },
  { value: "Factura", label: "Factura de compra" },
  { value: "EntradaCompra", label: "Entrada de mercadería" },
  { value: "NotaCompra", label: "Nota de compra" },
  { value: "NotaCompraEntrada", label: "Devolución de mercadería" },
  { value: "Pago", label: "Pago" },
  { value: "Venta", label: "Venta" },
  { value: "SalidaVenta", label: "Salida de mercadería" },
  { value: "SalidaEntrega", label: "Entrega de pedido" },
  { value: "AjusteInventario", label: "Ajuste de inventario" },
  { value: "Cobro", label: "Cobro" },
  { value: "Manual", label: "Asiento manual" },
];

const formatSoles = (n: number) => `S/ ${(n ?? 0).toFixed(2)}`;

// Libro diario: los asientos los genera el codigo interno (compras, ventas, inventario, pagos) y
// ademas se pueden registrar asientos manuales (AsientoManualForm). Anular un manual = reverso.
export const AsientosContables = () => {
  const [asientos, setAsientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [origenTipo, setOrigenTipo] = useState("");
  const [expandido, setExpandido] = useState<number | null>(null);
  const [nuevo, setNuevo] = useState(false);

  const anularManual = async (id: number) => {
    if (!window.confirm("¿Anular este asiento? Se generará su reverso.")) return;
    try {
      await axiosInstance.post(`/asientos-contables/${id}/anular`);
      toast.success("Asiento anulado");
      cargar();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "No se pudo anular el asiento");
    }
  };

  const cargar = async () => {
    setLoading(true);
    try {
      const { data }: any = await axiosInstance.get("/asientos-contables/listar", {
        params: { desde: desde || undefined, hasta: hasta || undefined, origenTipo: origenTipo || undefined },
      });
      setAsientos(data?.data ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al cargar los asientos");
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-bold text-gray-900">Asientos Contables</h3>
        {!nuevo && (
          <button type="button" className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2" onClick={() => setNuevo(true)}>
            Nuevo asiento
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-1 max-w-2xl">
        Libro diario de partida doble: compras, ventas, movimientos de inventario y pagos generan aquí
        su propio asiento. También puedes registrar asientos manuales.
      </p>

      {nuevo && (
        <AsientoManualForm onCancelar={() => setNuevo(false)} onGuardado={() => { setNuevo(false); cargar(); }} />
      )}

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
        <div>
          <label className="text-xs font-semibold text-gray-500">Origen</label>
          <select className="block border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
            value={origenTipo} onChange={(e) => setOrigenTipo(e.target.value)}>
            {ORIGENES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <button type="button" className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-60"
          onClick={cargar} disabled={loading}>
          {loading ? "Buscando..." : "Filtrar"}
        </button>
      </div>

      <div className="mt-4 bg-white border border-gray-100 rounded-2xl overflow-x-auto">
        {loading ? (
          <div className="p-6"><TableSkeleton columns={5} /></div>
        ) : (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Glosa</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {asientos.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No hay asientos para el filtro seleccionado.</td></tr>
              ) : (
                asientos.map((a) => (
                  <Fragment key={a.id}>
                    <tr className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandido(expandido === a.id ? null : a.id)}>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{a.numero}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(a.fecha).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{a.glosa}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{ORIGENES.find((o) => o.value === a.origenTipo)?.label ?? a.origenTipo}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.estadoAsiento === "ANULADO" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {a.estadoAsiento}
                        </span>
                      </td>
                    </tr>
                    {expandido === a.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-4 py-3">
                          {a.origenTipo === "Manual" && a.origenId === a.id && a.estadoAsiento === "EMITIDO" && (
                            <button type="button" className="float-right text-xs font-semibold text-red-600 hover:underline"
                              onClick={() => anularManual(a.id)}>
                              Anular asiento
                            </button>
                          )}
                          {(a.fechaDocumento || a.fechaVencimiento) && (
                            <p className="text-xs text-gray-500 mb-2">
                              {a.fechaDocumento && <>Fecha documento: {new Date(a.fechaDocumento).toLocaleDateString()} </>}
                              {a.fechaVencimiento && <>· Vencimiento: {new Date(a.fechaVencimiento).toLocaleDateString()}</>}
                            </p>
                          )}
                          <table className="w-full text-xs">
                            <thead className="text-gray-500">
                              <tr>
                                <th className="text-left py-1">Cuenta</th>
                                <th className="text-left py-1">Cuenta asociada</th>
                                <th className="text-left py-1">C. costos 1</th>
                                <th className="text-left py-1">C. costos 2</th>
                                <th className="text-left py-1">Destino</th>
                                <th className="text-left py-1">Descripción</th>
                                <th className="text-right py-1">Debe</th>
                                <th className="text-right py-1">Haber</th>
                              </tr>
                            </thead>
                            <tbody>
                              {a.detalle.map((d: any, i: number) => (
                                <tr key={i}>
                                  <td className="py-1">{d.cuentaCodigo} — {d.cuentaNombre}</td>
                                  <td className="py-1">{d.cuentaAsociada ?? ""}</td>
                                  <td className="py-1">{d.centroCosto1 ?? ""}</td>
                                  <td className="py-1">{d.centroCosto2 ?? ""}</td>
                                  <td className="py-1">{d.cuentaDestino ?? ""}</td>
                                  <td className="py-1">{d.descripcion ?? ""}</td>
                                  <td className="py-1 text-right">{d.debe > 0 ? formatSoles(d.debe) : ""}</td>
                                  <td className="py-1 text-right">{d.haber > 0 ? formatSoles(d.haber) : ""}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
