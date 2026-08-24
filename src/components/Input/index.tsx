
import {  FC, useEffect, useRef } from 'react'
import Svg from '../Svg'
import { Icons } from '../Svg/iconsPack'
import styles from './input.module.css'

export interface IInput {
    onKeyUp?: any
    type?: string
    name: string
    placeholder?: string
    onChange?: any;
    handleKeyDown?: any;
    isLabel?: boolean
    label?: string
    disabled?: boolean
    defaultValue?: string | number
    onClick?: () => any
    onReset?: any;
    value?: string | number
    ref?: any
    searching?: boolean
    isSearch?: boolean
    handleOnBlur?: (e: any) => void;
    autocomplete?: string
    maxVal?: string,
    id?: string
    onCopy?: any
    onSelect?: any
    max?: number
    className?: string
    item?: any;
    onKeyDown?: any
    reference?: any;
    refInput?: any;
    maxLengthCharacters?: any;
    readOnly?: boolean;
    withDate?:boolean;
}

const Input: FC<IInput> = (props) => {
    const textInput = useRef<HTMLInputElement | any>(null);
    const textValue = textInput.current?.value
    const textToString = `${textValue}`;
    const lenghtToText = textToString.length


    useEffect(() => {
        textInput.current?.focus();
    }, [textInput]);

    const onResetMain: any = () => {
        textInput.current.value = "";
        onReset()
    }

    const {
        type = 'text' || 'file' || "checkbox" || 'textarea' || 'number' || 'password' || 'date' || 'email',
        label,
        name,
        onChange,
        handleKeyDown,
        onReset,
        isLabel,
        disabled = false,
        placeholder,
        defaultValue,
        onClick,
        onKeyUp,
        onKeyDown,
        value,
        ref,
        searching = true,
        isSearch,
        autocomplete,
        handleOnBlur,
        withDate=false,
        id,
   
        onSelect,
        max,
        className,
        readOnly,
        reference,
        item,
        refInput,
        maxLengthCharacters,
    } = props

    const renderInput = () => {

        if (isSearch && type === "text") {
            return (
                <div className={styles.searchInput}>
                    <input ref={textInput} name={name} autoFocus x-webkit-speech /* readOnly={searching} */ value={value} onClick={onClick} disabled={disabled} defaultValue={defaultValue} type={type} placeholder={placeholder} onChange={onChange} />

                    {
                        lenghtToText > 0 && (
                            <span onClick={onResetMain} className={styles.cleanString}>
                                <Svg icon={Icons.close} />
                            </span>
                        )
                    }

                </div>
            )
        }

        if (item === 'numberOfSerieState' && type === "text") {

            return (
                <input className={className} maxLength={max} onSelect={onSelect} name={name} id={id} autoComplete={autocomplete} x-webkit-speech autoFocus onBlur={handleOnBlur} /* readOnly={searching} */ value={value} onClick={onClick} disabled={disabled} defaultValue={defaultValue} type={type} placeholder={placeholder} onChange={onChange}

                    onKeyDown={handleKeyDown} ref={reference} onKeyPress={(e) => !/^[0-9]*[.,]?[0-9]*$/.test(e.key) && e.preventDefault()} />
            )
        }
        if (item === 'montoAnticipo' && type === "text") {
            return (
                <input className={className} maxLength={max} onSelect={onSelect} name={name} id={id} autoComplete={autocomplete} x-webkit-speech autoFocus onBlur={handleOnBlur} value={value} onClick={onClick} disabled={disabled} defaultValue={defaultValue} type={type} placeholder={placeholder} onChange={onChange} onKeyPress={(e) => !/^[0-9]*[.,]?[0-9]*$/.test(e.key) && e.preventDefault()} />
            )
        }

        if (item === 'franquicia' && type === "text") {
            return (
                <div className={styles.wrapperPercentage}>
                    <input className={className} maxLength={max} onSelect={onSelect} name={name} id={id} autoComplete={autocomplete} x-webkit-speech autoFocus onBlur={handleOnBlur} readOnly={searching} value={value} onClick={onClick} disabled={disabled} defaultValue={defaultValue} type={type} placeholder={placeholder} onChange={onChange} />
                    <span>%</span>
                </div>

            )
        }
        if (maxLengthCharacters && type === "text") {
            return (
                <input onKeyDown={onKeyDown} className={className} maxLength={maxLengthCharacters} onSelect={onSelect} name={name} id={id} autoComplete={autocomplete} x-webkit-speech onBlur={handleOnBlur} value={value} onClick={onClick} disabled={disabled} defaultValue={defaultValue} type={type} placeholder={placeholder} onChange={onChange} ref={refInput} />
            )
        }
        if (type === "date" && withDate) {
            return (
                <input className={styles.date} type='date' name={name} disabled={disabled} value={value} defaultValue={defaultValue} placeholder={placeholder} onChange={onChange} />
            )
        }
        if (type === "date") {
            return (
                <input className={styles.date} name={name} disabled={disabled} value={value} defaultValue={defaultValue} placeholder={placeholder} onChange={onChange} />
            )
        }
      
        if (type === "text") {
            return (
                <input onKeyUp={onKeyUp} className={isSearch ? styles.isSearching : styles.isPointer} readOnly={readOnly} onKeyDown={onKeyDown} maxLength={max} onSelect={onSelect} name={name} id={id} autoComplete={autocomplete} onBlur={handleOnBlur} value={value} onClick={onClick} disabled={disabled} defaultValue={defaultValue} type={type} placeholder={placeholder} onChange={onChange} ref={refInput} />
            )
        }

      

        if (type === "password") {
            return (
                <input onKeyUp={onKeyUp} type={type} name={name} disabled={disabled} value={value} placeholder={placeholder} onChange={onChange} />
            )
        }

        if (type === "number") {
            return (
                <input type={type} step="any" name={name} disabled={disabled} value={value} placeholder={placeholder} onChange={onChange} />
            )
        }

        if (type === "email") {
            return (
                <input type={type} name={name} disabled={disabled} value={value} placeholder={placeholder} onChange={onChange} />
            )
        }

        if (type === "textarea") {
            return (
                <textarea name={name} disabled={disabled} value={defaultValue} placeholder={placeholder} onChange={onChange} />
            )
        }

        if (type === "file") {
            return (
                <input type="file" name={name} disabled={disabled} value={defaultValue} placeholder={placeholder} onChange={onChange} />
            )
        }
        if (type === "checkbox") {
            return (
                <input type="checkbox" name={name} disabled={disabled} value={defaultValue} placeholder={placeholder} onChange={onChange} />
            )
        }
    }


    return (
        <div ref={ref} className={styles.wrapper__input}>
            <div className={styles.content__input}>
                {isLabel && <label>{label}</label>}
            </div>
            {renderInput()}
        </div>
    )
}

export default Input;