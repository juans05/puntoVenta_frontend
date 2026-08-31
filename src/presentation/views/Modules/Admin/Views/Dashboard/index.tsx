import { useEffect, useState } from "react";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";
import axiosInstance from "../../../../../../utils/axios";
import { Graph1 } from "./Graph1";
import { Graph4 } from "./Graph4";
import styles from "./dashboard.module.css";
import { Indicadores } from "./Indicadores";
import { ReporteMargen } from "./ReporteMargen";
import { Grid, Callout } from "@tremor/react";

interface IDashboardResumen {
  ventasHoy: number;
  gastosHoy: number;
  comprasHoy: number;
  otrosIngresosHoy: number;
  costoVentasHoy: number;
  utilidadEstimada: number;
  saldoEsperado: number;
  stockTotal: number;
  productosStockBajo: number;
  ventasUltimos7Dias: { fecha: string; total: number }[];
  productosMasVendidos: { producto: string; cantidad: number; total: number; costo: number; utilidad: number }[];
  alertas: string[];
}

export const DashboardMain = () => {
  const [resumen, setResumen] = useState<IDashboardResumen | null>(null);
  const [dias, setDias] = useState<number>(7);

  useEffect(() => {
    printTable(`${title.name}::DASHBOARD`);
  }, []);

  useEffect(() => {
    axiosInstance
      .get(`/dashboard?dias=${dias}`)
      .then(({ data }) => setResumen(data.data))
      .catch((error) => console.log(error));
  }, [dias]);

  return (
    <div className={styles.dashboard}>
      <div>
        <h1 className="text-xl font-bold text-neutral-800">Panel general</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Resumen del desempeño de tu negocio</p>
      </div>

      {resumen?.alertas && resumen.alertas.length > 0 && (
        <div className="flex flex-col gap-2">
          {resumen.alertas.map((alerta) => (
            <Callout key={alerta} title={alerta} color="amber" />
          ))}
        </div>
      )}

      <div>
        <Indicadores resumen={resumen} />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <label className="text-sm text-neutral-600">Periodo:</label>
        <select
          className="text-sm border border-neutral-200 rounded-md px-2 py-1"
          value={dias}
          onChange={(e) => setDias(Number(e.target.value))}
        >
          <option value={7}>Últimos 7 días</option>
          <option value={15}>Últimos 15 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={60}>Últimos 60 días</option>
          <option value={90}>Últimos 90 días</option>
        </select>
      </div>

      <main className={styles.content}>
        <Grid numColsLg={2} className="mt-4 gap-6">
          <div className={`h-full ${styles["card-chart"]}`}>
            <Graph1 ventasUltimos7Dias={resumen?.ventasUltimos7Dias ?? []} dias={dias} />
          </div>
          <div className={`h-full ${styles["card-chart"]}`}>
            <Graph4 productosMasVendidos={resumen?.productosMasVendidos ?? []} dias={dias} />
          </div>
        </Grid>
      </main>

      <ReporteMargen />
    </div>
  );
};
