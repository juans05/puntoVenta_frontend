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
    {
      title: "Ventas de hoy",
      metric: formatSoles(resumen?.ventasHoy ?? 0),
      descripcion: "Suma del total de boletas, facturas y notas de venta con fecha de venta de hoy (sin contar las anuladas).",
    },
    {
      title: "Gastos de hoy",
      metric: formatSoles(resumen?.gastosHoy ?? 0),
      descripcion: "Suma de los gastos confirmados cuya fecha de gasto es hoy.",
    },
    {
      title: "Compras de hoy",
      metric: formatSoles(resumen?.comprasHoy ?? 0),
      descripcion: "Suma de las compras confirmadas cuya fecha de compra es hoy.",
    },
    {
      title: "Utilidad estimada",
      metric: formatSoles(resumen?.utilidadEstimada ?? 0),
      descripcion: "Ventas de hoy, menos el costo de los productos vendidos hoy (costo unitario x cantidad), menos los gastos de hoy.",
    },
    {
      title: "Saldo esperado en caja",
      metric: formatSoles(resumen?.saldoEsperado ?? 0),
      descripcion: "Monto inicial de tu caja abierta hoy, mas los pagos y otros ingresos que se registraron hoy, menos los gastos y compras que se registraron hoy. Es efectivo real (por fecha de registro), no por fecha de venta.",
    },
    {
      title: "Productos con stock bajo",
      metric: String(resumen?.productosStockBajo ?? 0),
      descripcion: "Cantidad de productos activos cuyo stock actual esta por debajo del stock minimo configurado para ese producto.",
    },
  ];

  return (
    <Grid numColsLg={3} className="mt-6 gap-6">
      {kpiData.map((item) => (
        <Card key={item.title}>
          <Flex alignItems="start">
            <div className="truncate w-full">
              <Text>{item.title}</Text>
              <Metric className="truncate">{item.metric}</Metric>
              <Text className="mt-2 text-xs text-neutral-400 whitespace-normal">{item.descripcion}</Text>
            </div>
          </Flex>
        </Card>
      ))}
    </Grid>
  );
};
