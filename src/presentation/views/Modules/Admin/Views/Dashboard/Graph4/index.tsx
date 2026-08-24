import { Card, Title, DonutChart, Text } from "@tremor/react";

interface IProductoTop {
  producto: string;
  cantidad: number;
  total: number;
  costo: number;
  utilidad: number;
}

interface IGraph4Props {
  productosMasVendidos: IProductoTop[];
}

const formatSoles = (n: number) => `S/ ${Intl.NumberFormat("es-PE").format(n ?? 0)}`;

export const Graph4 = ({ productosMasVendidos }: IGraph4Props) => {
  return (
    <Card>
      <Title>Productos más vendidos (últimos 7 días)</Title>
      {productosMasVendidos.length === 0 ? (
        <Text className="mt-6">Todavía no hay ventas registradas.</Text>
      ) : (
        <>
          <DonutChart
            className="mt-6 h-72"
            data={productosMasVendidos}
            showLabel
            category="total"
            index="producto"
            valueFormatter={formatSoles}
            colors={["slate", "violet", "indigo", "rose", "cyan", "amber"]}
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2">Cant.</th>
                  <th className="px-3 py-2">Ingreso</th>
                  <th className="px-3 py-2">Costo</th>
                  <th className="px-3 py-2">Utilidad</th>
                </tr>
              </thead>
              <tbody>
                {productosMasVendidos.map((p) => (
                  <tr key={p.producto} className="border-b">
                    <td className="px-3 py-2 font-medium text-gray-900">{p.producto}</td>
                    <td className="px-3 py-2">{p.cantidad}</td>
                    <td className="px-3 py-2">{formatSoles(p.total)}</td>
                    <td className="px-3 py-2">{formatSoles(p.costo)}</td>
                    <td className={`px-3 py-2 font-semibold ${p.utilidad < 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatSoles(p.utilidad)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {productosMasVendidos.some((p) => p.costo === 0) && (
              <p className="text-xs text-gray-400 mt-2">
                Costo S/ 0 significa que ese producto todavía no tiene una compra registrada (sin costo conocido).
              </p>
            )}
          </div>
        </>
      )}
    </Card>
  );
};
