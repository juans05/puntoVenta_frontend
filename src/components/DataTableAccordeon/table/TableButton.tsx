
import { FC } from 'react'
import Icon from '../../Icon';

export interface ITableButton {
    type?: string;
    title: string;
    icon: any;
    className?: string;
    classNameStatus?: string;
    classNameIcon?: string;
    handleOnClick: (data: any) => void;
    data?: any;
    color?: any,
    disabledButton?: any;
    fileNameModule?: any;
    iconify?: any;
    texto?: any;

}



const TableButton: FC<ITableButton> = (props) => {

    const { title, icon, handleOnClick, data, className, iconify } = props;

    console.log(iconify)

    return (
        <>
            <button className={className} type="button" title={title} onClick={() => handleOnClick(data)} > 
                <Icon icon={icon} />
            </button>
        </>
    )
}

export default TableButton;