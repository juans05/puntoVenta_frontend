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

interface IGrupoOpcion {
  grupoId: number;
  nombre: string;
}

// Sentinel de frontend para "este anuncio no corresponde a ningún grupo de productos"
// (ej. branding general). Se traduce a null (GrupoId nulo) al armar el payload de importación.
// Distinto de `null`, que significa "todavía no se eligió nada" y bloquea la confirmación.
const NO_APLICA = -1;

// Sentinel para "este anuncio no va" (no funciona / no interesa). Se traduce a
// GrupoId=null + Descartado=true. Se excluye del cálculo de ROI.
const NO_VA = -2;

export const GastoPublicidad = () => {
  const dispatch = useAppDispatch();
  const { roi }: any = useAppSelector((state: RootState) => state.publicidad);

  const [grupos, setGrupos] = useState<IGrupoOpcion[]>([]);
  const [filas, setFilas] = useState<IFilaPublicidadParseada[]>([]);
  const [errores, setErrores] = useState<string[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/Grupo/listar")
      .then((res: any) => {
        const items = res.data?.data ?? [];
        setGrupos(
          items
            .filter((g: any) => g.grupoId)
            .map((g: any) => ({ grupoId: g.grupoId, nombre: g.nombre }))
        );
      })
      .catch(() => setGrupos([]));
  }, []);

  useEffect(() => {
    dispatch(getRoiPublicidad() as any);
  }, [dispatch]);

  const handleFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const { filas: parseadas, errores: erroresParseo } = parseGastoPublicidadExcel(buffer);
    setErrores(erroresParseo);

    if (parseadas.length === 0) {
      setFilas([]);
      return;
    }

    // Recupera el Grupo (o "No aplica") que ya se le asignó a estos mismos anuncios en una
    // importación anterior, para no obligar a remapear anuncios/campañas recurrentes cada
    // semana. Si un anuncio nunca se importó antes, queda sin elegir (bloquea "Confirmar").
    try {
      const nombresAnuncio = Array.from(new Set(parseadas.map((f) => f.nombreAnuncio)));
      const res: any = await axiosInstance.post("/gastopublicidad/mapeos-anuncios", { nombresAnuncio });
      const mapeos: { nombreAnuncio: string; grupoId: number | null; descartado: boolean }[] = res.data?.data ?? [];
      const mapeoPorAnuncio = new Map(mapeos.map((m) => [m.nombreAnuncio, m]));

      setFilas(
        parseadas.map((f) => {
          const mapeo = mapeoPorAnuncio.get(f.nombreAnuncio);
          if (!mapeo) return f;
          if (mapeo.descartado) return { ...f, grupoId: NO_VA };
          return { ...f, grupoId: mapeo.grupoId === null ? NO_APLICA : mapeo.grupoId };
        })
      );
    } catch {
      // Si falla la recuperación de mapeos, se sigue igual: el usuario elige todo a mano.
      setFilas(parseadas);
    }
  };

  const handleGrupoChange = (index: number, grupoId: number | null) => {
    setFilas((prev) => prev.map((f, i) => (i === index ? { ...f, grupoId } : f)));
  };

  const puedeConfirmar = filas.length > 0 && filas.every((f) => f.grupoId !== null);

  const handleConfirmar = async () => {
    setSubiendo(true);
    try {
      const resultado = await importarGastoPublicidad({
        loteImportacionId: crypto.randomUUID(),
        filas: filas.map((f) => ({
          grupoId: f.grupoId === NO_APLICA || f.grupoId === NO_VA ? null : f.grupoId,
          descartado: f.grupoId === NO_VA,
          nombreAnuncio: f.nombreAnuncio,
          nombreConjuntoAnuncios: f.nombreConjuntoAnuncios,
          fechaInicio: f.fechaInicio,
          fechaFin: f.fechaFin,
          importeGastado: f.importeGastado,
          impresiones: f.impresiones,
          alcance: f.alcance,
          resultados: f.resultados,
          costoPorResultado: f.costoPorResultado,
          clics: f.clics,
          costoPorClic: f.costoPorClic,
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
                <th>Resultados</th>
                <th>Costo/Resultado</th>
                <th>Clics</th>
                <th>Costo/Clic</th>
                <th>Grupo</th>
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
                  <td title={f.indicadorResultado ?? undefined}>{f.resultados ?? "-"}</td>
                  <td>{f.costoPorResultado !== null ? `S/ ${f.costoPorResultado.toFixed(2)}` : "-"}</td>
                  <td>{f.clics ?? "-"}</td>
                  <td>{f.costoPorClic !== null ? `S/ ${f.costoPorClic.toFixed(2)}` : "-"}</td>
                  <td>
                    <select
                      value={f.grupoId ?? ""}
                      onChange={(e) => handleGrupoChange(i, e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Selecciona un grupo</option>
                      <option value={NO_APLICA}>No aplica</option>
                      <option value={NO_VA}>No va</option>
                      {grupos.map((g) => (
                        <option key={g.grupoId} value={g.grupoId}>
                          {g.nombre}
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
              <th>Grupo</th>
              <th>Gasto Ads</th>
              <th>Impresiones</th>
              <th>Alcance</th>
              <th>Clics</th>
              <th>Costo/Clic</th>
              <th>Ingresos</th>
              <th>Costo Producto</th>
              <th>Utilidad Neta</th>
              <th>ROI %</th>
            </tr>
          </thead>
          <tbody>
            {!roi || roi.length === 0 ? (
              <tr>
                <td colSpan={10} className={styles.empty}>
                  No hay datos de ROI para este rango.
                </td>
              </tr>
            ) : (
              roi.map((r: any) => (
                <tr key={r.grupoId ?? "sin-grupo"}>
                  <td>{r.nombreGrupo}</td>
                  <td>S/ {r.gastoAds.toFixed(2)}</td>
                  <td>{r.impresiones?.toLocaleString() ?? "-"}</td>
                  <td>{r.alcance?.toLocaleString() ?? "-"}</td>
                  <td>{r.clics?.toLocaleString() ?? "-"}</td>
                  <td>{r.costoPorClic !== null ? `S/ ${r.costoPorClic.toFixed(2)}` : "-"}</td>
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
