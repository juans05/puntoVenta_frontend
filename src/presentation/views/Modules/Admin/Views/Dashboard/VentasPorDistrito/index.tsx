import { Card, Title, BarList, Text, Flex } from "@tremor/react";

interface IDistritoVenta {
  distrito: string;
  total: number;
  cantidad: number;
}

interface ICategoriaMonto {
  categoria: string;
  total: number;
}

interface IVentasPorDistritoProps {
  ventasPorDistrito: IDistritoVenta[];
  ventasPorTipoEnvio: ICategoriaMonto[];
  dias?: number;
}

const formatSoles = (n: number) => `S/ ${Intl.NumberFormat("es-PE").format(n ?? 0)}`;

export const VentasPorDistrito = ({ ventasPorDistrito, ventasPorTipoEnvio, dias = 7 }: IVentasPorDistritoProps) => {
  const distritos = ventasPorDistrito.map((d) => ({ name: d.distrito, value: d.total }));
  const tiposEnvio = ventasPorTipoEnvio.map((t) => ({ name: t.categoria, value: t.total }));

  return (
    <Card>
      <Title>Ventas por distrito ({dias === 1 ? "hoy" : `últimos ${dias} días`})</Title>
      {distritos.length === 0 ? (
        <Text className="mt-6">
          Todavía no hay ventas con distrito registrado en este periodo (se llena al vender, en "Distrito").
        </Text>
      ) : (
        <>
          <Flex className="mt-4">
            <Text className="text-xs font-semibold text-neutral-500 uppercase">Distrito</Text>
            <Text className="text-xs font-semibold text-neutral-500 uppercase">Ventas</Text>
          </Flex>
          <BarList data={distritos} valueFormatter={formatSoles} className="mt-2" color="indigo" />
        </>
      )}

      {tiposEnvio.length > 0 && (
        <>
          <Title className="mt-6 text-sm">Por tipo de envío</Title>
          <BarList data={tiposEnvio} valueFormatter={formatSoles} className="mt-2" color="cyan" />
        </>
      )}
    </Card>
  );
};
