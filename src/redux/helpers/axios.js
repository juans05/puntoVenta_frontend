import axios from 'axios';

/* export const baseUrl = "https://api.suiza-soft.com"; */
// export const baseUrl = "https://webapipuntoventa.azurewebsites.net/api"
/* export const baseUrl = "http://119.8.153.52:2034/api"; */
// export const baseUrl = "http://localhost:5001/api"; 
export const baseUrl = "https://apipuntoventa.lobytech.com/api"; 

const refreshTokens = async (url, method, tokens) => {

  const { tok, refresh } = tokens;

  const response = await axios({
    url: `${baseUrl}/refresh-token`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens}`,
    },
    data: {
      token: tok,
      refreshToken: refresh,
    },
  });

  const body = response.data;

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

  let access_token = token ? token : tok;

  const respuesta = await axios({
    url,
    method,
    headers: {
      'Authorization': `Bearer ${access_token}`,
    },
  });

  return respuesta;
}

export const api = async (url, data, method) => {
  let token = localStorage.getItem('token');
  if (token === null) {
    const response = await fetchSinToken(url, data, method);
    const body = response.data;
    return { response, body };
  }

  if (token) {
    const response = await fetchConToken(url, data, method);
    const body = response.data;
    return { body, response };
  }
}

const fetchSinTokenDay = (endpoint, data, method = 'GET') => {

  const url = `${baseUrl}/${endpoint}`;

  if (method === 'GET') {
    return axios.get(url);
  } else {
    return axios({
      url,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      data,
    });
  }
}

const fetchSinToken = async (endpoint, data, method = 'GET') => {

  const url = `${baseUrl}/${endpoint}`;

  if (method === 'GET') {
    return axios({
      url,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } else {
    return axios({
      url,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      data,
    });
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
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${tok}`
        }
      });
      return response;
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.setItem('tokenResponse', true)
        if (Date.now() < refreshExpiration) {
          let respuesta = await refreshTokens(url, method, tokens)
          localStorage.setItem('tokenResponse', false)
          return respuesta;
        } else {
          localStorage.clear();
          window.location.href = "/"
        }
      }
      throw error;
    }
  } else {
    try {
      const response = await axios({
        method: method,
        url: url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tok}`,
        },
        data: data
      });
      return response;
    } catch (error) {
      if (error.response.status === 401) {
        let respuesta = await refreshTokens(url, method, tokens)
        return respuesta;
      }
      throw error;
    }
  }
}

export {
  fetchConToken,
  fetchSinTokenDay
}
