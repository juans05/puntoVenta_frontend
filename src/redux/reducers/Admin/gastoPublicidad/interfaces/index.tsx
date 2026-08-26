export interface IRoiPorGrupo {
  grupoId: number;
  nombreGrupo: string;
  gastoAds: number;
  impresiones: number | null;
  alcance: number | null;
  clics: number | null;
  costoPorClic: number | null;
  ingresos: number;
  costoProducto: number;
  utilidadNeta: number;
  roiPorcentaje: number | null;
}

export interface IGastoPublicidadState {
  roi: IRoiPorGrupo[];
}
