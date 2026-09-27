const TOKEN_KEY = '4D3V$PUNTOVENT4';

// sessionStorage (no localStorage): cada pestaña mantiene su propia sesion. Con localStorage,
// loguearse con otra empresa en una pestaña nueva pisaba el token de las demas pestañas abiertas,
// causando que acciones en curso (crear producto + subir imagen, etc.) terminaran autenticadas
// con la empresa equivocada a mitad de flujo.
export function setToken(token: string) {
    sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
}

export function deleteToken() {
    sessionStorage.removeItem(TOKEN_KEY);
}
