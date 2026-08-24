import { useEffect, useRef, useState } from "react";
import Input from "../Input";
import Svg from "../Svg";
import { Icons } from '../Svg/iconsPack'
import styles from './select.module.css'


import { motion } from 'framer-motion'
import useOutsideClick from "../../hooks/useOutsideClick";


interface IProps {
    options?: IOption[] | any
    onChange: (id: number, value: string, name: string) => any
    isLabel?: boolean
    isSearch?: boolean
    value?: string
    placeholder?: string
    optionSelect?: boolean
    name?: string
    withLabel?: boolean
    label?: string
    defaultValue?: any
    defaultLabel?: any
    reload?: any
    disabled?: boolean
    id?: string
}

interface IOption {
    id: number
    value: string | number | any
}

const Select = ({
    optionSelect,
    options,
    onChange,
    isLabel,
    isSearch,
    placeholder,
    name,
    label,
    defaultValue,
    disabled,
    id
}: IProps) => {

    const [showOptions, setShowOptions] = useState(false);
    const [valueOptions, setValueOptions] = useState<string>(defaultValue);
    const selectReference = useRef<any>();

    useEffect(() => {
        if (defaultValue === "") {
            return setValueOptions(defaultValue);
        } else {
            return setValueOptions(defaultValue);
        }
    }, [defaultValue])

    const { isClickOutside, setIsClickOutside } = useOutsideClick({
        ref: selectReference,
        elementClassDontCondition: [""]
    });

    
    const [search, setSearch] = useState("");

    const [searching, ] = useState(!isSearch);

    const optionSelectInputStyle: any = {
        minWidth: optionSelect ? "50px" : "auto",
    }

    const inputIsSearchingStyle: any = {
        width: isSearch ? "calc(14ch + 5px)" : "10px",
        position: isSearch ? "absolute" : "relative",
        top: isSearch ? "-1px" : "",
        left: isSearch ? "22px" : ""
    }

    useEffect(() => {
        if (isClickOutside) {
            setShowOptions(false);
            setIsClickOutside(false);
        }
    }, [isClickOutside])

    const setValueOption = (item: IOption, name: any) => {
        // @ts-ignore (us this comment if typescript raises an error)
        const input = document.getElementById(id);
        const value: any = input?.firstChild?.firstChild;

        if (search) {
            // @ts-ignore (us this comment if typescript raises an error)
            selectReference.current.firstChild.firstChild.value = ""
            setValueOptions(item.value);
            value.value = "";
            onChange(item.id, item.value, name);
        } else {
            // @ts-ignore (us this comment if typescript raises an error)
            selectReference.current.firstChild.firstChild.value = ""
            setValueOptions(item.value);
            onChange(item.id, item.value, name);
        }

        setShowOptions(false);
    }

    const searchOptions = (e: any) => {
        setValueOptions("");
        setShowOptions(true)
        setSearch(e.target.value);
    }

    const results: any = !search ? options : options.filter((option: any) => (typeof option.id === "string" || typeof option.value === "string") && option?.id.toLowerCase().includes(search.toLocaleLowerCase()) || option?.value.toLowerCase().includes(search.toLocaleLowerCase()))

    const optionsHeigth: any = {
        height: results && results.length > 10 ? "215px" : "auto"
    }

 

    return (

        <>
            <div ref={selectReference} className=/* {disabled ? `${styles.wrapper__select} ${styles.disabledDiv}` : `$ */{styles.wrapper__select}/* `} */>
                {isLabel && <label>{label}</label>}
                <div style={optionSelectInputStyle} className={disabled ? `${styles.input__select} ${styles.disabled__select}` : `${styles.input__select}`} onClick={() => {
                    setShowOptions(!showOptions)
                }}>
                    {valueOptions && <span>{valueOptions}</span>}

                    <div id={id} style={inputIsSearchingStyle}>
                        <Input searching={searching} autocomplete="off" placeholder={placeholder} onChange={searchOptions} name="option" type="text"
                        />
                    </div>

                    <Svg icon={Icons.arrowSelect} onClick={() => setShowOptions(!showOptions)} />
                </div>

                {showOptions && (
                    <motion.div
                        style={optionsHeigth}
                        className={styles.content__listOptions}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        exit={{opacity: 0}}
                    >
                        {
                            results && results?.length > 0 ? results?.map((item: IOption, index: number) => (
                                <li key={index} onClick={() => {
                                    setValueOption(item, name)
                                }}>
                                    <p  onClick={() => {
                                        setValueOption(item, name)
                                    }} >{item.value}</p>
                                </li>
                            )) :

                                <div className={styles.content__noResults__Select}>
                                    <p>No se encontraron más resultados</p>
                                </div>
                        }
                    </motion.div>
                )}
            </div>
        </>
    )
}

export default Select;