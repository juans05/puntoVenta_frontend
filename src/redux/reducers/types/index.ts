import { IAlert, IAlertConfirmSchedule, IAlertModalSend, IAlertSendEmail } from "../interfaces"

export const CONFIRM_SCHEDULE='CONFIRM_SCHEDULE'
export const ALERT='ALERT'
export const LOADING_EMAIL = 'LOADING_EMAIL'
export const LOADING_DESCARGA='LOADING_DESCARGA'

export interface IAlertType {
    type: typeof ALERT
    payload: IAlert
}

export interface ISendConfirmSchedule {
    type: typeof CONFIRM_SCHEDULE
    payload: IAlertConfirmSchedule
}
export interface ILoadingEmail {
    type: typeof LOADING_EMAIL,
    payload: IAlertSendEmail
}
export interface ILoadingDescarga {
    type: typeof LOADING_DESCARGA,
    payload: IAlertModalSend
}
export type IAlertsTypes = ISendConfirmSchedule | IAlertType | ILoadingEmail | ILoadingDescarga