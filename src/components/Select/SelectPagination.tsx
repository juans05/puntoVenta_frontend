import { useEffect, useRef, useState } from 'react'

import useOutsideClick from '../../hooks/useOutsideClick'
import Input from '../Input'
import Svg from '../Svg'
import { Icons } from '../Svg/iconsPack'

import styles from './select.module.css'

interface IProps {
    options: IOption[]
    onClick: (value: number) => any
    isLabel?: boolean
    value?: string
    placeholder?: string
    menuLeft?: boolean
    optionSelect?: boolean
    name?: string
    setNameSelect?: any
    setLabel?: any
    withLabel?: boolean
    label?: string
}

interface IOption {
    id: number,
    value: number
}

const SelectPagination = ({
    options,
    isLabel,
    label,
    placeholder,
    onClick,
    optionSelect,
    menuLeft
}: IProps) => {

    const [showOptions, setShowOptions] = useState(false);
    const [valueOptions, setValueOptions] = useState<number>(options[2].value);

    const selectReference = useRef<any>();

    const { isClickOutside, setIsClickOutside } = useOutsideClick({
        ref: selectReference,
        elementClassDontCondition: [""]
    });

    useEffect(() => {
        if(isClickOutside) {
            setShowOptions(false);
            setIsClickOutside(false);
        }
    },[isClickOutside])

    const menuLeftStyle: any = {
        top: menuLeft ? "2px" : "60px",
        width: menuLeft ? "auto" : "100%",
        left: menuLeft ? "60px" : "0",
        zIndex: menuLeft ? "1" : "999999",
        height: optionSelect ? "auto" : ""
    }

    const optionSelectStyle: any = {
        width: optionSelect ? "53%" : "auto",
        top: optionSelect ? "4px" : "auto"
    }

    const optionSelectInputStyle: any = {
        minWidth: optionSelect ? "50px" : ""
    }

    const setValueOption = (item: IOption) => {

        setValueOptions(item.value);
        onClick(item.value);
        setShowOptions(false);
    }

    return (
        <>
            <div ref={selectReference} style={optionSelectStyle} className={styles.wrapper__select}>
                {isLabel && <label>{label}</label>}
                <div style={optionSelectInputStyle} className={styles.input__select} onClick={() => {
                    setShowOptions(!showOptions)
                }}>
                    {valueOptions && <span>{valueOptions}</span>}

                    <div>
                        <Input autocomplete='off' onChange={() => undefined} placeholder={placeholder} name="option" type="text"
                            defaultValue={valueOptions} />
                    </div>

                    <Svg icon={Icons.arrowSelect} onClick={() => setShowOptions(!showOptions)} />
                </div>

                {showOptions && (
                    <div style={menuLeftStyle} className={styles.content__listOptions}>
                        {
                            options && options.length > 0 && options.map((item: IOption) => (
                                <li key={item.id} onClick={() => {
                                    setValueOption(item)
                                }}>
                                    <p>{item.value}</p>
                                </li>
                            ))
                        }
                    </div>
                )}
            </div>
        </>
    )
}

export default SelectPagination;