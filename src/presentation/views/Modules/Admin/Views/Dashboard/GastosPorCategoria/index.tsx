import { Card, Title, DonutChart, Text } from "@tremor/react";

interface ICategoriaMonto {
  categoria: string;
  total: number;
}

interface IGastosPorCategoriaProps {
  gastosPorCategoria: ICategoriaMonto[];
  dias?: number;
}

const formatSoles = (n: number) => `S/ ${Intl.NumberFormat("es-PE").format(n ?? 0)}`;

export const GastosPorCategoria = ({ gastosPorCategoria, dias = 7 }: IGastosPorCategoriaProps) => {
  return (
    <Card>
      <Title>Gastos por categoría ({dias === 1 ? "hoy" : `últimos ${dias} días`})</Title>
      {gastosPorCategoria.length === 0 ? (
        <Text className="mt-6">Todavía no hay gastos registrados en este periodo.</Text>
      ) : (
        <DonutChart
          className="mt-6 h-72"
          data={gastosPorCategoria}
          showLabel
          category="total"
          index="categoria"
          valueFormatter={formatSoles}
          colors={["rose", "amber", "orange", "violet", "cyan", "slate"]}
        />
      )}
    </Card>
  );
};
