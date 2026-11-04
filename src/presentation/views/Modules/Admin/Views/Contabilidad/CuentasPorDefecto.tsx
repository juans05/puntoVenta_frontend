import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";

// Cuentas por defecto de la empresa: que cuenta de ultimo nivel usan los asientos automaticos
// (compras, ventas, recepciones) cuando el producto, el IGV o el proveedor/cliente no traen la suya.
// Sin elegir, el asiento usa el codigo corto (ej. "60"), que no es de ultimo nivel.
export const CuentasPorDefecto = () => {
  const [filas, setFilas] = useState<any[]>([]);
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [guardando, setGuardando] = useState("");

  useEffect(() => {
    axiosInstance.get("/cuentas-contables/por-defecto").then((r: any) => setFilas(r.data?.data ?? [])).catch(() => {});
    axiosInstance.get("/cuentas-contables/listar").then((r: any) => setCuentas(r.data?.data ?? [])).catch(() => {});
  }, []);

  const guardar = async (codigo: string, valor: string) => {
    setGuardando(codigo);
    try {
      const r: any = await axiosInstance.put(`/cuentas-contables/por-defecto/${codigo}`, { cuentaContableId: valor ? Number(valor) : null });
      setFilas(r.data?.data ?? filas);
      toast.success("Cuenta por defecto guardada");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "No se pudo guardar");
    } finally {
      setGuardando("");
    }
  };

  const faltan = filas.filter((f) => !f.cuentaContableId).length;

  return (
    <div className="p-4 max-w-5xl">
      <h3 className="text-lg font-semibold text-gray-900">Cuentas por defecto</h3>
      <p className="text-sm text-gray-500 mt-1">
        Los asientos automáticos usan estas cuentas cuando el producto, el impuesto o el proveedor/cliente no tienen una propia.
        Solo se admiten cuentas de último nivel (7 u 8 dígitos, sin subcuentas) que empiecen con el código indicado.
      </p>
      {faltan > 0 && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
          Faltan {faltan} cuenta(s): mientras no las elijas, esos asientos usan el código corto, que no es de último nivel.
        </p>
      )}

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-600 text-left">
            <tr>
              <th className="py-2 pr-3 w-20">Código</th>
              <th className="py-2 pr-3">Se usa para</th>
              <th className="py-2 pr-3 w-[380px]">Cuenta de último nivel</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => {
              const opciones = cuentas.filter((c: any) => c.esHoja && String(c.codigo).startsWith(f.codigo));
              return (
                <tr key={f.codigo} className="border-t border-gray-100">
                  <td className="py-2 pr-3 font-mono">{f.codigo}</td>
                  <td className="py-2 pr-3 text-gray-700">{f.uso}</td>
                  <td className="py-2 pr-3">
                    <select
                      className="border border-gray-200 rounded-md px-2 py-1.5 w-full bg-white disabled:opacity-60"
                      value={f.cuentaContableId ?? ""}
                      disabled={guardando === f.codigo}
                      onChange={(e) => guardar(f.codigo, e.target.value)}
                    >
                      <option value="">{opciones.length ? `Sin elegir (usa ${f.codigo})` : `No hay cuentas de último nivel bajo ${f.codigo}`}</option>
                      {opciones.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
