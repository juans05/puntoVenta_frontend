import { useEffect, useState } from "react";
import styles from "./gastoPublicidad.module.css";
import { Toaster, toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import {
  getRoiPublicidad,
  importarGastoPublicidad,
} from "../../../../../../redux/reducers/Admin/gastoPublicidad/gastoPublicidad.reducer";
import {
  parseGastoPublicidadExcel,
  IFilaPublicidadParseada,
} from "../../../../../../helpers/functions/parseGastoPublicidadExcel";
import axiosInstance from "../../../../../../utils/axios";

interface IProductoOpcion {
  productoId: number;
  nombre: string;
}

export const GastoPublicidad = () => {
  const dispatch = useAppDispatch();
  const { roi }: any = useAppSelector((state: RootState) => state.publicidad);

  const [productos, setProductos] = useState<IProductoOpcion[]>([]);
  const [filas, setFilas] = useState<IFilaPublicidadParseada[]>([]);
  const [errores, setErrores] = useState<string[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/productos/listar?Amount=1000")
      .then((res: any) => {
        const items = res.data?.data?.items ?? [];
        setProductos(items.map((p: any) => ({ productoId: p.productoId, nombre: p.nombre })));
      })
      .catch(() => setProductos([]));
  }, []);

  useEffect(() => {
    dispatch(getRoiPublicidad() as any);
  }, [dispatch]);

  const handleFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const { filas: parseadas, errores: erroresParseo } = parseGastoPublicidadExcel(buffer);
    setFilas(parseadas);
    setErrores(erroresParseo);
  };

  const handleProductoChange = (index: number, productoId: number | null) => {
    setFilas((prev) => prev.map((f, i) => (i === index ? { ...f, productoId } : f)));
  };

  const puedeConfirmar = filas.length > 0 && filas.every((f) => f.productoId !== null);

  const handleConfirmar = async () => {
    setSubiendo(true);
    try {
      const resultado = await importarGastoPublicidad({
        loteImportacionId: crypto.randomUUID(),
        filas: filas.map((f) => ({
          productoId: f.productoId,
          nombreAnuncio: f.nombreAnuncio,
          nombreConjuntoAnuncios: f.nombreConjuntoAnuncios,
          fechaInicio: f.fechaInicio,
          fechaFin: f.fechaFin,
          importeGastado: f.importeGastado,
          impresiones: f.impresiones,
          alcance: f.alcance,
          resultados: f.resultados,
          costoPorResultado: f.costoPorResultado,
        })),
      });

      toast.success(
        `Importación completada: ${resultado.filasInsertadas} filas insertadas` +
          (resultado.filasOmitidasPorDuplicado > 0
            ? `, ${resultado.filasOmitidasPorDuplicado} omitidas por duplicado`
            : "")
      );

      setFilas([]);
      setErrores([]);
      dispatch(getRoiPublicidad(desde || undefined, hasta || undefined) as any);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al importar el archivo");
    } finally {
      setSubiendo(false);
    }
  };

  const handleFiltrar = () => {
    dispatch(getRoiPublicidad(desde || undefined, hasta || undefined) as any);
  };

  return (
    <div>
      <div className={styles.header}>
        <h3>ROI Publicidad (Meta Ads)</h3>
        <label className={styles.newBtn}>
          Subir Excel
          <input
            type="file"
            accept=".xlsx"
            style={{ display: "none" }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
      </div>

      {errores.length > 0 && (
        <div className={styles.errores}>
          {errores.map((e, i) => (
            <p key={i}>{e}</p>
          ))}
        </div>
      )}

      {filas.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Anuncio</th>
                <th>Conjunto</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Gasto (PEN)</th>
                <th>Producto</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i}>
                  <td>{f.nombreAnuncio}</td>
                  <td>{f.nombreConjuntoAnuncios ?? "-"}</td>
                  <td>{f.fechaInicio}</td>
                  <td>{f.fechaFin}</td>
                  <td>S/ {f.importeGastado.toFixed(2)}</td>
                  <td>
                    <select
                      value={f.productoId ?? ""}
                      onChange={(e) => handleProductoChange(i, e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Selecciona un producto</option>
                      {productos.map((p) => (
                        <option key={p.productoId} value={p.productoId}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "12px 14px" }}>
            <button
              className={styles.newBtn}
              disabled={!puedeConfirmar || subiendo}
              onClick={handleConfirmar}
            >
              {subiendo ? "Importando..." : "Confirmar importación"}
            </button>
          </div>
        </div>
      )}

      <div className={styles.filtros}>
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        <button className={styles.newBtn} onClick={handleFiltrar}>
          Filtrar
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Gasto Ads</th>
              <th>Ingresos</th>
              <th>Costo Producto</th>
              <th>Utilidad Neta</th>
              <th>ROI %</th>
            </tr>
          </thead>
          <tbody>
            {!roi || roi.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  No hay datos de ROI para este rango.
                </td>
              </tr>
            ) : (
              roi.map((r: any) => (
                <tr key={r.productoId}>
                  <td>{r.nombreProducto}</td>
                  <td>S/ {r.gastoAds.toFixed(2)}</td>
                  <td>S/ {r.ingresos.toFixed(2)}</td>
                  <td>S/ {r.costoProducto.toFixed(2)}</td>
                  <td className={r.utilidadNeta >= 0 ? styles.positivo : styles.negativo}>
                    S/ {r.utilidadNeta.toFixed(2)}
                  </td>
                  <td className={r.utilidadNeta >= 0 ? styles.positivo : styles.negativo}>
                    {r.roiPorcentaje === null ? "—" : `${(r.roiPorcentaje * 100).toFixed(0)}%`}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Toaster richColors position="top-right" duration={2000} />
    </div>
  );
};
