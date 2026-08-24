import { Icon } from '@iconify/react';
import styles from './../facturacion.module.css';
import { Dispatch } from 'react';

interface IProps {
    handleChange: Dispatch<any>
}

const Header = ({handleChange} : IProps) => {

    return ( 
        <div>
            <div className={styles.header__welcome}>
                    <h3>Buscador</h3>
                    <p>Encuentra tus productos por diferentes opciones</p>
                </div>

                <div className={styles.divider}>
                    <div className={styles.filters}>
                        <div className={styles.search}>
                            <Icon icon="iconamoon:search-bold" width={22} />
                            <input onChange={handleChange} className='text-sm' placeholder="Buscar" type="text" />
                        </div>
                        <div className={styles.btn__filters}>
                            <Icon icon="ion:filter-outline" width={22} />
                        </div>
                    </div>
                </div>
        </div>
     );
}
 
export default Header;