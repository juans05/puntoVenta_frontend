import styles from './loading.module.css';
/* import Logo from '../../assets/gif/logos.gif' */
import './styles.css'
import { useAppSelector } from '../../redux/store';
import { RootState } from '../../redux/rootState';

const Loading = () => {
    const { recursos}: any = useAppSelector(
        (state: RootState) => state.myBusiness
      );
    return (
        <div className={styles.loading__wrapper}>
            <div className="loader">
                {/* <img src={Logo} alt="Cargando" /> */}
                <img src={recursos?.gifCarga} alt="Cargando" />
                <p>Cargando</p>
            </div>
        </div>
    )
}

export default Loading;