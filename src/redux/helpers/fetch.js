/* const baseUrl = "https://api.suiza-soft.com" */
export const baseUrl = "https://webapipuntoventa.azurewebsites.net/api"

const refreshTokens = async (url, method, tokens) => {

    const { tok, refresh } = tokens;

    const response = await fetch('https://api.suiza-soft.com/refresh-token', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokens}`
        },
        method: 'POST',
        body: JSON.stringify({
            token: tok,
            refreshToken: refresh
        })
    });

    const body = await response.json();

    // if (body.code === 2300) {
    //     localStorage.clear();
    //     return window.location.href = "/"
    // }

    console.log(body)

    let { refreshToken, token, refreshTokenExpirationTimestamp } = body.data;

    if (refreshToken && token && refreshTokenExpirationTimestamp) {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('refreshExpiration', refreshTokenExpirationTimestamp)
    }

    let access_token = token ? token : tok

    const respuesta = await fetch(url, {
        method,
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    });
    return respuesta;
}

export const fetchConToken2 = async (endpoint, data, method = 'GET') => {

    let tok = localStorage.getItem('token');
    let refresh = localStorage.getItem('refreshToken')
    let refreshExpiration = localStorage.getItem('refreshExpiration');

    const tokens = {
        tok,
        refresh
    }

    const url = `${endpoint}`;

    if (method === 'GET') {

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${tok}`
            }
        });
        if (response.status === 401) {
            localStorage.setItem('tokenResponse', true)
            if (Date.now()   < refreshExpiration) {
                let respuesta = await refreshTokens(url, method, tokens)
                localStorage.setItem('tokenResponse', false)
                return respuesta;
            } else {
                localStorage.clear();
                window.location.href = "/"
            }
        }

        return response;
    } else {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tok}`
            },
            body: JSON.stringify(data)
        });
        if (response.status === 401) {
            let respuesta = await refreshTokens(url, method, tokens)
            return respuesta;
        }
        return response
    }
}


const fetchConToken = async (endpoint, data, method = 'GET') => {

    let tok = localStorage.getItem('token');
    let refresh = localStorage.getItem('refreshToken')
    let refreshExpiration = localStorage.getItem('refreshExpiration');

    const tokens = {
        tok,
        refresh
    }

    const url = `${baseUrl}/${endpoint}`;

    if (method === 'GET') {

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${tok}`
            }
        });
        if (response.status === 401) {
            localStorage.setItem('tokenResponse', true)
            if (Date.now()   < refreshExpiration) {
                let respuesta = await refreshTokens(url, method, tokens)
                localStorage.setItem('tokenResponse', false)
                return respuesta;
            } else {
                localStorage.clear();
                window.location.href = "/"
            }
        }

        return response;
    } else {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tok}`
            },
            body: JSON.stringify(data)
        });
        if (response.status === 401) {
            let respuesta = await refreshTokens(url, method, tokens)
            return respuesta;
        }
        return response
    }
}

const fetchSinToken = async (endpoint, data, method = 'GET') => {

    const url = `${baseUrl}/${endpoint}`;


    if (method === 'GET') {
        return fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    } else {
        return fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }
}

export const apiFetch = async (url, data, method) => {
    let token = localStorage.getItem('token');
    if (token === null) {
        const response = await fetchSinToken(url, data, method);
        const body = await response.json();
        return { response, body };
    }

    if (token) {
        const response = await fetchConToken(url, data, method);
        const body = await response.json();
        return { body, response };
    }
}

const fetchSinTokenDay = (endpoint, data, method = 'GET') => {

    const url = `${baseUrl}/${endpoint}`;

    if (method === 'GET') {
        return fetch(url);
    } else {
        return fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: data
        });
    }
}

const fetchConTokenDay = (endpoint, data, method = 'GET') => {

    const url = `${baseUrl}/${endpoint}`;
    const token = localStorage.getItem('token') || '';

    if (method === 'GET') {
        return fetch(url, {
            method,
            headers: {
                'x-token': token
            }
        });
    } else {
        return fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-token': token
            },
            body: JSON.stringify(data)
        });
    }
}


export {
    fetchConToken,
    fetchConTokenDay,
    fetchSinTokenDay
}