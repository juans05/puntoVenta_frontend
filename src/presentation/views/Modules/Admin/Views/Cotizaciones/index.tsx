import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import styles from "../NotasCreditoDebito/notasCreditoDebito.module.css";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import {
  getAllVentas,
  generarPdfCotizacion,
  anularComprobante,
} from "../../../../../../redux/reducers/Admin/ventas/ventasRealizadas.reducer";
import { Toaster, toast } from "sonner";

const TIPO_COTIZACION = 6;

export const Cotizaciones = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { ventas }: any = useAppSelector((state: RootState) => state.ventas);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dateStart = moment().subtract(60, "days").format("DD/MM/YYYY");
    const dateEnd = moment().add(1, "days").format("DD/MM/YYYY");
    setLoading(true);
    dispatch(getAllVentas(dateStart, dateEnd) as any).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cotizaciones = useMemo(() => (ventas || []).filter((v: any) => v.tipoDocumentoVentaId === TIPO_COTIZACION), [ventas]);

  const estaConvertida = (idComprobante: number) => (ventas || []).some((v: any) => v.cotizacionOrigenId === idComprobante);

  const handleAnular = (c: any) => {
    if (c.estadoComprobante === "ANULADO") return toast.error("Ya está anulada");
    dispatch(anularComprobante(c.idComprobante, c.serie ? `${c.serie}-${c.correlativo}` : String(c.idComprobante)) as any).finally(() => {
      const dateStart = moment().subtract(60, "days").format("DD/MM/YYYY");
      const dateEnd = moment().add(1, "days").format("DD/MM/YYYY");
      dispatch(getAllVentas(dateStart, dateEnd) as any);
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Cotizaciones</h3>
        <button className={styles.emitirBtn} onClick={() => navigate("/dashboard/nueva-factura/cotizacion")}>
          + Nueva Cotización
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Serie-Correlativo</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Vigencia</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  Cargando...
                </td>
              </tr>
            ) : cotizaciones.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  Aún no se han emitido cotizaciones.
                </td>
              </tr>
            ) : (
              cotizaciones.map((c: any) => {
                const anulada = c.estadoComprobante === "ANULADO";
                const convertida = estaConvertida(c.idComprobante);
                const vencida = !!c.vencida;
                const puedeConvertir = !anulada && !convertida && !vencida;

                return (
                  <tr key={c.idComprobante}>
                    <td data-label="Serie-Correlativo">
                      {c.serie}-{c.correlativo}
                    </td>
                    <td data-label="Cliente">{c.clienteNombre || "Sin especificar"}</td>
                    <td data-label="Total">S/ {Number(c.valorTotal).toFixed(2)}</td>
                    <td data-label="Fecha">{c.fecha}</td>
                    <td data-label="Vigencia">{c.fechaVigencia || "Sin vencimiento"}</td>
                    <td data-label="Estado">
                      {anulada ? "Anulada" : convertida ? "Convertida" : vencida ? "Vencida" : "Vigente"}
                    </td>
                    <td data-label="Acciones">
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <button className={styles.buscarBtn} onClick={() => dispatch(generarPdfCotizacion(c.idComprobante) as any)}>
                          PDF
                        </button>
                        {puedeConvertir && (
                          <>
                            <button
                              className={styles.emitirBtn}
                              onClick={() => navigate(`/dashboard/nueva-factura/factura?cotizacionId=${c.idComprobante}`)}
                            >
                              → Factura
                            </button>
                            <button
                              className={styles.emitirBtn}
                              onClick={() => navigate(`/dashboard/nueva-factura/boleta?cotizacionId=${c.idComprobante}`)}
                            >
                              → Boleta
                            </button>
                          </>
                        )}
                        {!anulada && (
                          <button className={styles.buscarBtn} onClick={() => handleAnular(c)}>
                            Anular
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
};
