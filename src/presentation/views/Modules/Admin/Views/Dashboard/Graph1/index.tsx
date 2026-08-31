import { Card, Title, AreaChart } from "@tremor/react";

interface IGraph1Props {
  ventasUltimos7Dias: { fecha: string; total: number }[];
  dias?: number;
}

export const Graph1 = ({ ventasUltimos7Dias, dias = 7 }: IGraph1Props) => {
  const dataFormatter = (number: number) => "S/ " + Intl.NumberFormat("es-PE").format(number);

  return (
    <Card>
      <Title>Ventas de los últimos {dias} días</Title>
      <AreaChart
        className="mt-4"
        data={ventasUltimos7Dias}
        index="fecha"
        categories={["total"]}
        colors={["indigo"]}
        valueFormatter={dataFormatter}
      />
    </Card>
  );
};
