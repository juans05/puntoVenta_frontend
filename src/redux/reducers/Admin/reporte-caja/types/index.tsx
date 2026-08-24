export const GET_ALL_REPORTES = 'GET_ALL_REPORTES';
export const GET_ALL_REPORTES_RESUMIDO = 'GET_ALL_REPORTES_RESUMIDO';





export interface IGetAllReportes{
    type: typeof GET_ALL_REPORTES,
    payload: any
}

export interface IGetAllReportesResumido{
    type: typeof GET_ALL_REPORTES_RESUMIDO,
    payload: any
}



export type IReports = IGetAllReportes | IGetAllReportesResumido