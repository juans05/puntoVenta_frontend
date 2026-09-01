import { Card, Grid, Flex, Metric, Text } from "@tremor/react";

interface IIndicadoresProps {
  resumen: {
    ventasHoy: number;
    gastosHoy: number;
    comprasHoy: number;
    utilidadEstimada: number;
    flujoCaja: number;
    saldoEsperado: number;
    stockTotal: number;
    productosStockBajo: number;
  } | null;
  dias?: number;
}

const formatSoles = (n: number) => `S/ ${Intl.NumberFormat("es-PE").format(n ?? 0)}`;

interface IKpi {
  title: string;
  metric: string;
  descripcion: string;
  valor?: number;
  razonNegativo?: string;
}

const Kpi = ({ item, grande }: { item: IKpi; grande?: boolean }) => {
  const esNegativo = item.valor !== undefined && item.valor < 0;
  return (
    <Card>
      <Flex alignItems="start">
        <div className="truncate w-full">
          <Text>{item.title}</Text>
          <Metric className={`truncate ${grande ? "text-3xl" : ""} ${esNegativo ? "text-red-600" : item.valor !== undefined ? "text-emerald-600" : ""}`}>
            {item.metric}
          </Metric>
          <Text className="mt-2 text-xs text-neutral-400 whitespace-normal">{item.descripcion}</Text>
          {esNegativo && item.razonNegativo && (
            <Text className="mt-1 text-xs text-red-500 whitespace-normal font-medium">
              ⚠ {item.razonNegativo}
            </Text>
          )}
        </div>
      </Flex>
    </Card>
  );
};

export const Indicadores = ({ resumen, dias = 1 }: IIndicadoresProps) => {
  const periodo = dias === 1 ? "hoy" : `los últimos ${dias} días`;

  const utilidadEstimada = resumen?.utilidadEstimada ?? 0;
  const flujoCaja = resumen?.flujoCaja ?? 0;
  const saldoEsperado = resumen?.saldoEsperado ?? 0;

  const entradas: IKpi[] = [
    {
      title: `Ventas de ${periodo}`,
      metric: formatSoles(resumen?.ventasHoy ?? 0),
      descripcion: `Suma del total de boletas, facturas y notas de venta con fecha de venta dentro de ${periodo} (sin contar las anuladas).`,
    },
    {
      title: `Compras de ${periodo}`,
      metric: formatSoles(resumen?.comprasHoy ?? 0),
      descripcion: `Suma de las compras confirmadas cuya fecha de compra cae dentro de ${periodo}.`,
    },
    {
      title: `Gastos de ${periodo}`,
      metric: formatSoles(resumen?.gastosHoy ?? 0),
      descripcion: `Suma de los gastos confirmados cuya fecha de gasto cae dentro de ${periodo}.`,
    },
  ];

  const resultados: IKpi[] = [
    {
      title: "Ganancia real",
      metric: formatSoles(utilidadEstimada),
      valor: utilidadEstimada,
      descripcion: `Ventas − costo de lo vendido − gastos de ${periodo}. No resta las compras completas: comprar mercadería no es un gasto, se vuelve costo recién cuando el producto se vende.`,
      razonNegativo: `El costo de lo vendido más los gastos de ${periodo} superaron a las ventas de ese mismo periodo.`,
    },
    {
      title: "Flujo de caja",
      metric: formatSoles(flujoCaja),
      valor: flujoCaja,
      descripcion: `Ventas − compras − gastos de ${periodo}. A diferencia de la ganancia real, sí resta las compras completas: si compraste mucho stock que todavía no vendiste, esto puede salir negativo aunque el negocio vaya bien.`,
      razonNegativo: `Las compras más los gastos de ${periodo} superaron a las ventas de ese mismo periodo.`,
    },
  ];

  const secundarios: IKpi[] = [
    {
      title: "Saldo esperado en caja (hoy)",
      metric: formatSoles(saldoEsperado),
      valor: saldoEsperado,
      descripcion: "Monto inicial de tu caja abierta hoy, mas los pagos y otros ingresos que se registraron hoy, menos los gastos y compras que se registraron hoy. Es efectivo real de hoy (por fecha de registro), no cambia con el filtro de periodo de arriba.",
      razonNegativo: "Los gastos y compras que se registraron hoy (sumados al monto inicial de la caja) superan el efectivo que entro hoy. Revisa si registraste un gasto o una compra grande, o si el monto inicial con el que abriste caja fue muy bajo.",
    },
    {
      title: "Productos con stock bajo",
      metric: String(resumen?.productosStockBajo ?? 0),
      descripcion: "Cantidad de productos activos cuyo stock actual esta por debajo del stock minimo configurado para ese producto. No depende del periodo elegido.",
    },
  ];

  return (
    <div className="mt-6 flex flex-col gap-6">
      <Grid numColsLg={3} className="gap-6">
        {entradas.map((item) => (
          <Kpi key={item.title} item={item} />
        ))}
      </Grid>
      <Grid numColsLg={2} className="gap-6">
        {resultados.map((item) => (
          <Kpi key={item.title} item={item} grande />
        ))}
      </Grid>
      <Grid numColsLg={2} className="gap-6">
        {secundarios.map((item) => (
          <Kpi key={item.title} item={item} />
        ))}
      </Grid>
    </div>
  );
};
