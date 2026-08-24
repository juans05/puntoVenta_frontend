import {  useEffect, useState } from "react";
import Input from "../Input";
import Svg from "../Svg";
import { Icons } from '../Svg/iconsPack'
import styles from './select.module.css'
// @ts-ignore
import { CSSProperties } from "styled-components";

import { motion } from "framer-motion";
import useOutsideClick from "./useOutsideClick";

interface IProps {
    options?: IOption[] | any
    onChange: any
    isLabel?: boolean
    isSearch?: boolean
    value?: string
    placeholder?: string
    optionSelect?: boolean
    name?: string
    position?: string
    withLabel?: boolean
    label?: string
    defaultValue?: any
    motivoForm?: any
    reload?: any
    disabled?: boolean
    id?: string
}

interface IOption {
    id: number
    value: string
}

const SelectPro = ({
    
    motivoForm,
    options,
    onChange,
    
    isSearch,
    position,
    placeholder,
    name,
    label,
    defaultValue,
    disabled,
    id
}: IProps) => {

    const [, setShowOptions] = useState(false);
    const [valueOptions, setValueOptions] = useState<string>(defaultValue);
    const [optionSearch, setOptionsSearch] = useState<any>([]);
    const [isOpen, setIsOpen, ref] = useOutsideClick(false);

    useEffect(() => {
        if (defaultValue === "") {
            return setValueOptions(defaultValue);
        } else {
            return setValueOptions(defaultValue);
        }
    }, [defaultValue])

    useEffect(() => {
        if(motivoForm===""){
            return setValueOptions(defaultValue);
        }
    }, [motivoForm])

    const [search, setSearch] = useState("");
    const [searching, ] = useState(isSearch);

    const setValueOption = (item: IOption, name: any, id: any) => {
        const div: any = ref.current;
        const inputHtml: any = div.querySelector('input')

        if (search) {
            // @ts-ignore (us this comment if typescript raises an error)
            ref.current.firstChild.firstChild.value = ""
            setValueOptions(item.value);
            inputHtml.value = "";
            onChange(item.id, item.value, name, id);
        } else {
            // @ts-ignore (us this comment if typescript raises an error)
            ref.current.firstChild.firstChild.value = ""
            setValueOptions(item.value);
            inputHtml.value = "";
            onChange(item.id, item.value, name, id);
        }
        setIsOpen(false);
    }

    const searchOptions = (e: any) => {
        setValueOptions("");
        setShowOptions(true)
        setSearch(e.target.value);
    }

    useEffect(() => {
        if (options?.length > 0) {
            const results = options?.map((item: any) => ({
                id: item?.id?.toString(),
                value: item?.value
            }))
            setOptionsSearch(results)
        } else {
            setOptionsSearch([]);
        }
    }, [options])

    const resultsOptions: any = !search ? optionSearch : optionSearch?.filter((option: any) => (typeof option.id === "string" || typeof option.value === "string") && option?.id?.toLowerCase().includes(search.toLocaleLowerCase()) || option?.value?.toLowerCase().includes(search.toLocaleLowerCase()))

    const optionsHeigth: CSSProperties = {
        height: resultsOptions && resultsOptions.length > 5 ? "215px" : "auto",
        filter: "blur(-1px)"
    }

    return (

        <>
            <div
                ref={ref} className={isOpen ? `${styles.wrapper__select} ${styles.wrapper__selectOpen}` : styles.wrapper__select}>
                <div className={disabled ? `${styles.input__select} ${styles.disabled__select}` : `${styles.input__select}`} onClick={() => setIsOpen(!isOpen)}>
                    <div className={styles.selected__value}>
                        {valueOptions && <span>{valueOptions}</span>}
                    </div>
                    <div id={id}>
                        <Input isLabel label={label} readOnly={searching ? false : true} autocomplete="off" placeholder={placeholder} onChange={searchOptions} name="option" type="text"
                        />
                    </div>
                    <div className={styles.select__arrow}>
                        <Svg icon={Icons.arrowSelect} onClick={() => setIsOpen(!isOpen)} />
                    </div>
                </div>

                {isOpen && (
                    <motion.div
                        animate={position === "center" ? { x: 0, y: -45 } : position === "top" ? { x: 0, y: -290 } : position === "right" ? { x: 250, y: -80 } : { x: 0, y: 10 }}
                        initial={position === "center" ? { x: 0, y: -25 } : position === "top" ? { y: -300, x: 0 } : position === "right" ? { x: 250, y: -100 } : { y: 40 }} style={optionsHeigth} className={styles.content__listOptions}>
                        {
                            resultsOptions && resultsOptions?.length > 0 ? resultsOptions?.map((item: IOption, index: number) => (
                                <motion.div key={index}>
                                    <li>
                                        <p onClick={() => {
                                            setValueOption(item, name, id)
                                        }} >{item.value}</p>
                                    </li>
                                </motion.div>
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

export default SelectPro;