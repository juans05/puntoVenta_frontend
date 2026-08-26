export interface IRoiPorGrupo {
  grupoId: number;
  nombreGrupo: string;
  gastoAds: number;
  ingresos: number;
  costoProducto: number;
  utilidadNeta: number;
  roiPorcentaje: number | null;
}

export interface IGastoPublicidadState {
  roi: IRoiPorGrupo[];
}
