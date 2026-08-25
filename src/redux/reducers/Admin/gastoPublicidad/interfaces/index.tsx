export interface IRoiPorProducto {
  productoId: number;
  nombreProducto: string;
  gastoAds: number;
  ingresos: number;
  costoProducto: number;
  utilidadNeta: number;
  roiPorcentaje: number | null;
}

export interface IGastoPublicidadState {
  roi: IRoiPorProducto[];
}
