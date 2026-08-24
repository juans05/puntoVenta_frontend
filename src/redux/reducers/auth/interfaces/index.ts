export interface IAuthState {
    login: IAuth | null
    me: IMe | null
    customer: string
    message: string
}

export interface IAuth {
    isAuthenticated: boolean
    username: string
    token: string
    tokenExpirationAt: string
    tokenExpirationTimestamp: number
    tokenExpirationTimestampShort: number
    refreshToken: string
    refreshTokenExpirationAt: string
    refreshTokenExpirationTimestamp: number
    refreshTokenExpirationTimestampShort: number
}

export interface IMe {
    userName: string
    tenant: string
    rutas? : any
    nombre?:any
    empresa?:any;
    isSuperAdmin?: boolean;
}

export interface IUser {
    userName: string
    password: string
}

export interface IResponseAuth {
    code: number
    message: string
    data: IAuth
    status: number
}

export interface IResponseMe {
    config?: null
    data: IMe
    headers?: null
    request?: null
    status: number
    statusText: string
}