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
    required?: boolean
    // Fila "+ Agregar ..." al fondo de la lista -- recibe el texto tipeado en el buscador para
    // poder precargarlo (ej. nombre del producto/categoria que no se encontro).
    onAgregarNuevo?: (busqueda: string) => void
    agregarNuevoLabel?: string
    // Boton de eliminar por opcion (icono a la derecha de cada fila).
    onEliminarOpcion?: (id: number, value: string) => void
}

interface IOption {
    id: number
    value: string
    // Texto extra que el buscador tambien compara (ej. el codigo de una cuenta) sin mostrarse.
    search?: string
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
    id,
    required,
    onAgregarNuevo,
    agregarNuevoLabel,
    onEliminarOpcion,
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
                value: item?.value,
                search: item?.search
            }))
            setOptionsSearch(results)
        } else {
            setOptionsSearch([]);
        }
    }, [options])

    const resultsOptions: any = !search ? optionSearch : optionSearch?.filter((option: any) => (typeof option.id === "string" || typeof option.value === "string") && option?.id?.toLowerCase().includes(search.toLocaleLowerCase()) || option?.value?.toLowerCase().includes(search.toLocaleLowerCase()) || option?.search?.toLowerCase().includes(search.toLocaleLowerCase()))

    const limpiar = (e: any) => {
        e.stopPropagation();
        const inputHtml: any = (ref.current as any)?.querySelector('input');
        if (inputHtml) inputHtml.value = "";
        setSearch("");
        setValueOptions("");
        setIsOpen(false);
        // "Sin seleccion": mismo contrato que las pantallas ya usan para "nada elegido" (id 0, texto vacio).
        onChange(0, "", name, id);
    }

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
                        <Input isLabel label={label} required={required} readOnly={searching ? false : true} autocomplete="off" placeholder={placeholder} onChange={searchOptions} name="option" type="text"
                        />
                    </div>
                    <div className={styles.select__arrow}>
                        {/* button (no span): los span del selector heredan estilos de etiqueta (10px, mayusculas) */}
                        {isSearch && (search || valueOptions) && (
                            <button type="button" title="Limpiar" aria-label="Limpiar" onClick={limpiar}
                                style={{ position: "absolute", top: 17, right: 28, width: 20, height: 20, lineHeight: "18px", fontSize: 18, color: "#6b7280", background: "transparent", border: 0, cursor: "pointer", padding: 0 }}>×</button>
                        )}
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
                                    <li style={onEliminarOpcion ? { display: "flex", alignItems: "center", justifyContent: "space-between" } : undefined}>
                                        <p style={{ flex: 1 }} onClick={() => {
                                            setValueOption(item, name, id)
                                        }} >{item.value}</p>
                                        {onEliminarOpcion && (
                                            <span
                                                style={{ padding: "0 10px", cursor: "pointer", flexShrink: 0 }}
                                                title="Eliminar"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm(`¿Eliminar "${item.value}"?`)) onEliminarOpcion(Number(item.id), item.value);
                                                }}
                                            >
                                                <Svg icon={Icons.deleteButton} />
                                            </span>
                                        )}
                                    </li>
                                </motion.div>
                            )) :

                                <div className={styles.content__noResults__Select}>
                                    <p>No se encontraron más resultados</p>
                                </div>
                        }
                        {onAgregarNuevo && (
                            <motion.div>
                                <li>
                                    <p
                                        style={{ color: "var(--brand-600, #157AE0)" }}
                                        onClick={() => {
                                            onAgregarNuevo(search);
                                            setIsOpen(false);
                                        }}
                                    >
                                        + Agregar {agregarNuevoLabel ?? "nuevo"}{search ? ` "${search}"` : ""}
                                    </p>
                                </li>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </>
    )
}

export default SelectPro;