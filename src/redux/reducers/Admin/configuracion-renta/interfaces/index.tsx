export interface ITurnoConfig {
  codigo: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
}

export interface ITarifaConfig {
  turno: string;
  dias: string;
  monto: number;
}

export interface IRecursoConfig {
  descripcion: string;
  zona: number;
  tipo: string;
}

export interface IConfiguracionRenta {
  tipo: string;
  turnos: ITurnoConfig[];
  tarifas: ITarifaConfig[];
  recursos: IRecursoConfig[];
}

export interface ILayoutConfiguracionRenta {
  configuracion: IConfiguracionRenta | null;
  loading: boolean;
}
