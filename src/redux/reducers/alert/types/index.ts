import { IAlert } from "../interface"

export const ALERT = 'ALERT'

export interface IAlertType {
    type: typeof ALERT
    payload: IAlert
}