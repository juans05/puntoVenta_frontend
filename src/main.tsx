
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { store } from './redux/store.ts'
import { Provider } from 'react-redux'
import { initAxiosInterceptors } from './utils/axios.ts'
import ReactModal from 'react-modal'

initAxiosInterceptors();

// Ningun popup se cierra al hacer clic afuera: solo con la X o el boton Cancelar (evita perder lo
// escrito por un clic accidental). Aplica a todos los <Modal> de react-modal de la app.
const Modal = ReactModal as any; // @types/react-modal no declara defaultProps (el componente si lo tiene)
Modal.defaultProps = { ...Modal.defaultProps, shouldCloseOnOverlayClick: false };

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
