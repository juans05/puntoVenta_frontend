import { useEffect, useState } from "react";
import moment from "moment";
import axiosInstance from "../../../../../../../utils/axios";
import { Calendar } from "../../../../../../../components/Date";
import { Indicador } from "../../ReporteCierreCaja/Indicadores";
import styles from "./reporteMargen.module.css";

interface IProductoMargen {
  productoId: number;
  producto: string;
  cantidad: number;
  total: number;
  costo: number;
  utilidad: number;
  margenPorcentaje: number;
}

interface IReporteMargen {
  fechaInicio: string;
  fechaFin: string;
  totalVentas: number;
  totalCosto: number;
  totalUtilidad: number;
  margenPorcentaje: number;
  productos: IProductoMargen[];
}

const formatSoles = (n: number) => `S/ ${Intl.NumberFormat("es-PE").format(n ?? 0)}`;

export const ReporteMargen = () => {
  const [fechaInicio, setFechaInicio] = useState<string>(
    moment().subtract(29, "days").format("DD/MM/YYYY")
  );
  const [fechaFin, setFechaFin] = useState<string>(moment().format("DD/MM/YYYY"));
  const [reporte, setReporte] = useState<IReporteMargen | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChangeFecha = (value: string, name: string) => {
    if (name === "fechaInicio") setFechaInicio(value);
    if (name === "fechaFin") setFechaFin(value);
  };

  const buscar = () => {
    setLoading(true);
    axiosInstance
      .get("/dashboard/reporte-margen", { params: { startDate: fechaInicio, endDate: fechaFin } })
      .then(({ data }) => setReporte(data.data))
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h2>Margen por producto</h2>
        </div>
        <div className={styles.dates}>
          <Calendar onChange={handleChangeFecha} name="fechaInicio" text="Desde" defaultValue={fechaInicio} />
          <Calendar onChange={handleChangeFecha} name="fechaFin" text="Hasta" defaultValue={fechaFin} />
        </div>
        <button
          onClick={buscar}
          disabled={loading}
          className="bg-brand-500 hover:bg-brand-600 transition-colors rounded-md px-5 py-2.5 text-sm text-white disabled:opacity-60"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      <div className={styles.indicadores}>
        <Indicador icon="solar:bill-list-outline" value="Ventas" amount={formatSoles(reporte?.totalVentas ?? 0)} colorBg="#F1F7FE" color="#1658E9" />
        <Indicador icon="solar:tag-price-outline" value="Costo" amount={formatSoles(reporte?.totalCosto ?? 0)} colorBg="#FEF9F3" color="#DD5408" />
        <Indicador icon="game-icons:money-stack" value="Utilidad" amount={formatSoles(reporte?.totalUtilidad ?? 0)} colorBg="#EDFEEA" color="#05c46b" />
        <Indicador icon="mdi:percent-outline" value="Margen" amount={`${reporte?.margenPorcentaje ?? 0}%`} colorBg="#F5F5FE" color="#4344D0" />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Ventas</th>
              <th>Costo</th>
              <th>Utilidad</th>
              <th>Margen</th>
            </tr>
          </thead>
          <tbody>
            {!reporte || reporte.productos.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  {loading ? "Cargando..." : "Sin ventas en el rango seleccionado."}
                </td>
              </tr>
            ) : (
              reporte.productos.map((p) => (
                <tr key={p.productoId}>
                  <td>{p.producto}</td>
                  <td>{p.cantidad}</td>
                  <td>{formatSoles(p.total)}</td>
                  <td>{formatSoles(p.costo)}</td>
                  <td className={p.utilidad >= 0 ? styles.positivo : styles.negativo}>{formatSoles(p.utilidad)}</td>
                  <td className={p.utilidad >= 0 ? styles.positivo : styles.negativo}>{p.margenPorcentaje}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
