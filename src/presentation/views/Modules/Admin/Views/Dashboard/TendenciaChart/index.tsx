import { Card, Title, BarChart } from "@tremor/react";

interface ITendenciaDia {
  fecha: string;
  ventas: number;
  compras: number;
  gastos: number;
}

interface ITendenciaChartProps {
  tendenciaDiaria: ITendenciaDia[];
  dias?: number;
}

const formatSoles = (n: number) => `S/ ${Intl.NumberFormat("es-PE").format(n ?? 0)}`;

export const TendenciaChart = ({ tendenciaDiaria, dias = 7 }: ITendenciaChartProps) => {
  return (
    <Card>
      <Title>Ventas vs Compras vs Gastos ({dias === 1 ? "hoy" : `últimos ${dias} días`})</Title>
      <BarChart
        className="mt-4"
        data={tendenciaDiaria}
        index="fecha"
        categories={["ventas", "compras", "gastos"]}
        colors={["emerald", "amber", "rose"]}
        valueFormatter={formatSoles}
      />
    </Card>
  );
};
