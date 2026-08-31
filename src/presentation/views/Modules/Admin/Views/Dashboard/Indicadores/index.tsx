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
  dias?: number;
}

const formatSoles = (n: number) => `S/ ${Intl.NumberFormat("es-PE").format(n ?? 0)}`;

export const Indicadores = ({ resumen, dias = 1 }: IIndicadoresProps) => {
  const periodo = dias === 1 ? "hoy" : `los últimos ${dias} días`;

  const kpiData = [
    {
      title: `Ventas de ${periodo}`,
      metric: formatSoles(resumen?.ventasHoy ?? 0),
      descripcion: `Suma del total de boletas, facturas y notas de venta con fecha de venta dentro de ${periodo} (sin contar las anuladas).`,
    },
    {
      title: `Gastos de ${periodo}`,
      metric: formatSoles(resumen?.gastosHoy ?? 0),
      descripcion: `Suma de los gastos confirmados cuya fecha de gasto cae dentro de ${periodo}.`,
    },
    {
      title: `Compras de ${periodo}`,
      metric: formatSoles(resumen?.comprasHoy ?? 0),
      descripcion: `Suma de las compras confirmadas cuya fecha de compra cae dentro de ${periodo}.`,
    },
    {
      title: "Utilidad estimada",
      metric: formatSoles(resumen?.utilidadEstimada ?? 0),
      descripcion: `Ventas de ${periodo}, menos el costo de los productos vendidos en ese periodo (costo unitario x cantidad), menos los gastos de ${periodo}. No resta las compras: comprar mercaderia no es un gasto, se vuelve costo recien cuando el producto se vende.`,
    },
    {
      title: "Saldo esperado en caja (hoy)",
      metric: formatSoles(resumen?.saldoEsperado ?? 0),
      descripcion: "Monto inicial de tu caja abierta hoy, mas los pagos y otros ingresos que se registraron hoy, menos los gastos y compras que se registraron hoy. Es efectivo real de hoy (por fecha de registro), no cambia con el filtro de periodo de arriba.",
    },
    {
      title: "Productos con stock bajo",
      metric: String(resumen?.productosStockBajo ?? 0),
      descripcion: "Cantidad de productos activos cuyo stock actual esta por debajo del stock minimo configurado para ese producto. No depende del periodo elegido.",
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
