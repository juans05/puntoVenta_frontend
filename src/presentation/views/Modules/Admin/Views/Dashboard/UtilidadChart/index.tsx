import { Card, Title, AreaChart } from "@tremor/react";

interface ITendenciaDia {
  fecha: string;
  utilidad: number;
}

interface IUtilidadChartProps {
  tendenciaDiaria: ITendenciaDia[];
  dias?: number;
}

const formatSoles = (n: number) => `S/ ${Intl.NumberFormat("es-PE").format(n ?? 0)}`;

export const UtilidadChart = ({ tendenciaDiaria, dias = 7 }: IUtilidadChartProps) => {
  return (
    <Card>
      <Title>Evolución de la ganancia real ({dias === 1 ? "hoy" : `últimos ${dias} días`})</Title>
      <AreaChart
        className="mt-4"
        data={tendenciaDiaria}
        index="fecha"
        categories={["utilidad"]}
        colors={["indigo"]}
        valueFormatter={formatSoles}
      />
    </Card>
  );
};
