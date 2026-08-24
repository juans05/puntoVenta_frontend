export interface IAlert {
    loading?: boolean
    message?: string | string[]
    errors?: string | string[]
    type?: string
    code?: number
}


export interface IConfirmSchedule {
    loading?: boolean
    message?: string | string[]
    errors?: string | string[]
    type?: string
}


export interface IAlertConfirmSchedule  {
    loading?: boolean
    message?: string | string[]
    errors?: string | string[]
    type?: string
}


export interface IAlertSendEmail {
    loading?: boolean
    message?: string | string[]
    errors?: string | string[]
    type?: string
}

export interface IAlertModalSend {
    loading?: boolean
    message?: string | string[]
    errors?: string | string[]
    type?: string
}
