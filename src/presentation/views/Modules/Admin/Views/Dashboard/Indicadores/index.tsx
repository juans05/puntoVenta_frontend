import { Card, Grid, Flex, Metric, Text } from "@tremor/react";

interface IIndicadoresProps {
  resumen: {
    ventasHoy: number;
    gastosHoy: number;
    comprasHoy: number;
    utilidadEstimada: number;
    saldoEsperado: number;
    stockTotal: number;
    productosStockBajo: number;
  } | null;
}

const formatSoles = (n: number) => `S/ ${Intl.NumberFormat("es-PE").format(n ?? 0)}`;

export const Indicadores = ({ resumen }: IIndicadoresProps) => {
  const kpiData = [
    { title: "Ventas de hoy", metric: formatSoles(resumen?.ventasHoy ?? 0) },
    { title: "Gastos de hoy", metric: formatSoles(resumen?.gastosHoy ?? 0) },
    { title: "Compras de hoy", metric: formatSoles(resumen?.comprasHoy ?? 0) },
    { title: "Utilidad estimada", metric: formatSoles(resumen?.utilidadEstimada ?? 0) },
    { title: "Saldo esperado en caja", metric: formatSoles(resumen?.saldoEsperado ?? 0) },
    { title: "Productos con stock bajo", metric: String(resumen?.productosStockBajo ?? 0) },
  ];

  return (
    <Grid numColsLg={3} className="mt-6 gap-6">
      {kpiData.map((item) => (
        <Card key={item.title}>
          <Flex alignItems="start">
            <div className="truncate">
              <Text>{item.title}</Text>
              <Metric className="truncate">{item.metric}</Metric>
            </div>
          </Flex>
        </Card>
      ))}
    </Grid>
  );
};
