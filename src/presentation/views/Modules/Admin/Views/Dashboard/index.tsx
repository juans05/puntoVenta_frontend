import { useEffect, useState } from "react";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";
import axiosInstance from "../../../../../../utils/axios";
import { Graph4 } from "./Graph4";
import { TendenciaChart } from "./TendenciaChart";
import { UtilidadChart } from "./UtilidadChart";
import { GastosPorCategoria } from "./GastosPorCategoria";
import { VentasPorDistrito } from "./VentasPorDistrito";
import styles from "./dashboard.module.css";
import { Indicadores } from "./Indicadores";
import { ReporteMargen } from "./ReporteMargen";
import { Grid, Callout } from "@tremor/react";

interface ITendenciaDia {
  fecha: string;
  ventas: number;
  compras: number;
  gastos: number;
  costoVentas: number;
  utilidad: number;
}

interface ICategoriaMonto {
  categoria: string;
  total: number;
}

interface IDistritoVenta {
  distrito: string;
  total: number;
  cantidad: number;
}

interface IDashboardResumen {
  ventasHoy: number;
  gastosHoy: number;
  comprasHoy: number;
  otrosIngresosHoy: number;
  costoVentasHoy: number;
  utilidadEstimada: number;
  flujoCaja: number;
  saldoEsperado: number;
  stockTotal: number;
  productosStockBajo: number;
  tendenciaDiaria: ITendenciaDia[];
  productosMasVendidos: { producto: string; cantidad: number; total: number; costo: number; utilidad: number }[];
  gastosPorCategoria: ICategoriaMonto[];
  ventasPorDistrito: IDistritoVenta[];
  ventasPorTipoEnvio: ICategoriaMonto[];
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

      <div className="flex items-center gap-2 mt-2">
        <label className="text-sm text-neutral-600">Periodo (ventas, gastos, compras y utilidad):</label>
        <select
          className="text-sm border border-neutral-200 rounded-md px-2 py-1"
          value={dias}
          onChange={(e) => setDias(Number(e.target.value))}
        >
          <option value={1}>Hoy</option>
          <option value={7}>Última semana</option>
          <option value={15}>Últimos 15 días</option>
          <option value={30}>Último mes</option>
          <option value={60}>Últimos 60 días</option>
          <option value={90}>Últimos 90 días</option>
        </select>
      </div>

      <div>
        <Indicadores resumen={resumen} dias={dias} />
      </div>

      <main className={styles.content}>
        <Grid numColsLg={2} className="mt-4 gap-6">
          <div className={`h-full ${styles["card-chart"]}`}>
            <TendenciaChart tendenciaDiaria={resumen?.tendenciaDiaria ?? []} dias={dias} />
          </div>
          <div className={`h-full ${styles["card-chart"]}`}>
            <UtilidadChart tendenciaDiaria={resumen?.tendenciaDiaria ?? []} dias={dias} />
          </div>
          <div className={`h-full ${styles["card-chart"]}`}>
            <Graph4 productosMasVendidos={resumen?.productosMasVendidos ?? []} dias={dias} />
          </div>
          <div className={`h-full ${styles["card-chart"]}`}>
            <GastosPorCategoria gastosPorCategoria={resumen?.gastosPorCategoria ?? []} dias={dias} />
          </div>
          <div className={`h-full ${styles["card-chart"]}`}>
            <VentasPorDistrito
              ventasPorDistrito={resumen?.ventasPorDistrito ?? []}
              ventasPorTipoEnvio={resumen?.ventasPorTipoEnvio ?? []}
              dias={dias}
            />
          </div>
        </Grid>
      </main>

      <ReporteMargen />
    </div>
  );
};
