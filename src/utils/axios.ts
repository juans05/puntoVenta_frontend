import axios from 'axios';
import { deleteToken, getToken } from '../helpers/auth-helpers';
import { toast } from 'sonner';


/* const baseUrl = "https://webapipuntoventa.azurewebsites.net/api"; */
// export const baseUrl = "https://api.4devscorp.com/spa";
export const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5001/api";
// export const baseUrl = "https://lobytech.com:2016/api"; 


/* const baseUrl = "http://44.216.212.16:2001/api"; */
const token = getToken();


/* http://burdel.prod.4devscorp.com/index.html */
/* const rutaActual=window.location.href */
/* const tenantMain=rutaActual==='http://127.0.0.1:5173/'? 'cucas' : null */

const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
        // Tenant: 'burdel',
        Authorization: token ? `Bearer ${token}` : ''
    }
})

let isUnauthorizedHandled = false;

export function initAxiosInterceptors() {
    axiosInstance.interceptors.response.use(function (response) {
        return response;
    },
        function (error) {
            console.log(error)
            if (error.response.status === 401 && !isUnauthorizedHandled) {
                isUnauthorizedHandled = true;
                deleteToken();
                toast.error('Se ha terminado la sesión, vuelve a iniciar sesión por favor')
                return setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            } else {
                return Promise.reject(error);
            }
        }
    )

    axiosInstance.interceptors.request.use(function (config) {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    })
}


export default axiosInstance;