import { ChangeEvent, useEffect, useState } from 'react';
import styles from './date.module.css'
import { Icons } from '../Svg/iconsPack';


import moment from 'moment';
import { motion } from 'framer-motion'


import Input from '../Input';
import { formateDate } from '../../utils/validations';

import Icon from '../Icon';
import useOutsideClick from './useOutsideClick';

export interface CalendarEvent {
    date: Date;
    description: string;
}

const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{1,4})$/;

export const Calendar = ({ events, text, onChange, name, defaultValue, rigth, left, disabled, top }: any) => {

    const [writeDate, setWriteDate] = useState<string>("")
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isOpen, setIsOpen, ref] = useOutsideClick(false);

    useEffect(() => {
        if (defaultValue?.length === 10) {
            setWriteDate(defaultValue);
        }
    }, [defaultValue])

    const daysInMonth = (date: Date): number => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date: Date): number => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handleDateClick = (date: Date): any => {
        setWriteDate(moment(date).format("DD/MM/YYYY"));
        setSelectedDate(date);
    };

    const handleClickOutsideDate = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    }

    const getEventDescription = (date: Date): string | null => {
        const event = events?.find((e: any) => e.date.toDateString() === date.toDateString());
        return event ? event.description : null;
    };

    const renderDays = (): JSX.Element[] => {
        const days: JSX.Element[] = [];
        for (let i = 0; i < firstDayOfMonth(selectedDate); i++) {
            days.push(<div key={`empty-${i}`} className={styles.empty}></div>);
        }
        for (let i = 1; i <= daysInMonth(selectedDate); i++) {
            const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i);
            const eventDescription = getEventDescription(date);
            const classNames = [`${styles.day}`];
            if (date.toDateString() === new Date().toDateString()) {
                classNames.push(`${styles.today}`);
            }
            if (date.toDateString() === selectedDate.toDateString()) {
                classNames.push(`${styles.selected}`);
            }
            if (eventDescription) {
                classNames.push(`${styles['has-event']}`);
            }
            days.push(
                <div key={`day-${i}`} className={classNames.join(' ')} onClick={() => handleDateClick(date)} title={eventDescription ? eventDescription : ''}>
                    {i}
                </div>
            );
        }
        return days;
    };

    const handleChangeDate = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;

        if (input.length > 10 || input.replace(dateRegex, '').length > 0) {
            // Si el valor de entrada excede los 10 caracteres o contiene caracteres no válidos, no lo actualice
            return;
        }

        const dateMatch = input.match(dateRegex);

        if (dateMatch) {
            const [_, day, month, year] = dateMatch;

            // Verificando que el día y mes no sean mayores que 31 y 12, respectivamente
            if (parseInt(day) > 31 || parseInt(month) > 12) {
                return;
            }

            const formattedDate = `${day}/${month}/${year}`;
            console.log(formattedDate)
            setWriteDate(formattedDate);
        }
    }


    useEffect(() => {
        if (writeDate.length === 10) {
            const date = formateDate(writeDate);
            setSelectedDate(date);
        }
    }, [writeDate])

    useEffect(() => {
        if (selectedDate) {
            onChange(moment(selectedDate).format('DD/MM/YYYY'), name)
        }
    }, [selectedDate])


    return (

        <>
            <div ref={ref} className={styles.date}>
                <div className={disabled && styles.disabled}>
                    <div className={styles.icon__date} onClick={() => setIsOpen(!isOpen)}>
                        <Icon icon={Icons.date} />
                    </div>
                    <Input disabled={disabled} name={name} isLabel label={text} type='date' onChange={handleChangeDate} value={writeDate ? writeDate : moment(selectedDate).format('DD/MM/YYYY')} />
                </div>
                {
                    isOpen &&
                    <motion.div
                        animate={left ? { x: -100, y: 10 } : top ?  { x: -60, y: -340 } : rigth ? { y: 40 } : { x: 0, y: 10 }}
                        initial={left ? { y: 10, x: -10 } : top ?  { x: 0, y: -380 } : rigth ? { y: 20 } : { y: 40 }}
                    >
                        <div onClick={(e) => handleClickOutsideDate(e)}>
                            <div className={styles.header}>
                                <button type='reset' onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}>
                                    <Icon icon={Icons.arrowLeft} />
                                </button>
                                <div className={styles.month}>{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                                <button type='reset' onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}>
                                    <Icon icon={Icons.arrowRight} />
                                </button>
                            </div>
                            <div className={styles.days}>
                                <div className={styles['day-label']}>Dom</div>
                                <div className={styles['day-label']}>Lun</div>
                                <div className={styles['day-label']}>Mar</div>
                                <div className={styles['day-label']}>Mie</div>
                                <div className={styles['day-label']}>Jue</div>
                                <div className={styles['day-label']}>Vie</div>
                                <div className={styles['day-label']}>Sab</div>
                                {renderDays()}
                            </div>
                        </div>
                    </motion.div>
                }
            </div>
        </>
    );
};