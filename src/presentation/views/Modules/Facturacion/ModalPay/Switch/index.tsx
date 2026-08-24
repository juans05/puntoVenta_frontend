
import './styles.css'
import { Dispatch}  from 'react'

interface IProps {
    withClient: boolean
    setWithClient: Dispatch<boolean>
    back: any
}

const Swicth = ({ setWithClient, withClient,back } : IProps) => {

    const handleChangeIsClient = (e: React.ChangeEvent<HTMLInputElement>) => {
        
        setWithClient(e.target.checked)
        if(e.target.checked === false) {
            back();
        }
    }

    return (
        <div className="switch">
            <label>
                <input onChange={handleChangeIsClient} name='ficha' className="input" checked={withClient} type="checkbox" />
                <div className="toggle-wrapper"><span className="selector"></span></div>
                <p className="isCuca">Con <span className="selected"></span></p>
            </label>
        </div>
    );
}

export default Swicth;