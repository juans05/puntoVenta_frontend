import  { FC, useEffect, useState } from 'react'
import TableHeader, { ITableHeaderProps } from './TableHeader/TableHeader';
import TableBody from '../table/TableBody/TableBody';
import { ITableButton } from '../table/TableButton';

import { IInputCheckbox } from './InputCheckBox';
import styles from '../../Datatable/datatable.module.css'
import { TableSkeleton } from '../../Skeleton';



export interface IDataTableProps {
    header: ITableHeaderProps;
    body: any;
    color?: string;
    actions: ITableButton[];
    idTable?: string;
    border?: boolean;
    colorFont?: string;
    colorIndex?: string;
    classNameRow?: string;
    classNameTable?: string;
    checkbox?: IInputCheckbox;
    loading?: boolean;
}

type SortType = {
  column: string,
  asc: boolean
}

const DataTable: FC<IDataTableProps | any> = (props) => {

    const {  header, body, color, actions, idTable, border, colorFont, colorIndex, checkbox, loading } = props;

    const [colorTable, setColorTable] = useState(color);
    const [head, ] = useState<any>(header);
    const [data, setData] = useState<any>(body);
    const [sort, setSort] = useState<SortType>({column: '', asc: true});
    console.log(sort);

    useEffect(() => {
        setData(body)
    }, [body, setData])

    const initialState = {
        List: data,
        MasterChecked: false,
        SelectedList: [],
    }

    const [dataState, setDataState] = useState(initialState)

    useEffect(() => {
        setDataState(
            {
                ...dataState,
                List: body,
                MasterChecked: false
            }
        )
    }, [body])

    useEffect(() => {
        color ?
            setColorTable(color)
            : setColorTable('#E8EDF1');
    }, [color])

    const handleSort = (column: string) => {
        const asc = sort.column === column ? !sort.asc : true;
        setSort({column, asc});
        const sortedData = [...data];
        sortedData.sort((a: any, b: any) => {
          if (a[column] < b[column]) return asc ? -1 : 1;
          if (a[column] > b[column]) return asc ? 1 : -1;
          return 0;
        });
        setData(sortedData);
    }

    return (
        <div className={styles['table-scroll']}>
             <div className={styles.table}>
            <table id={idTable} >
                <thead >
                    <TableHeader dataHeader={head} colorFont={colorFont} handleSort={handleSort} sort={sort} ></TableHeader>
                </thead>
                {loading ? (
                    <tbody>
                        <tr><td colSpan={head?.length || 1} style={{ padding: 0 }}>
                            <TableSkeleton columns={head?.length || 4} />
                        </td></tr>
                    </tbody>
                ) : (
                <tbody  id="tableToModify" >
                    <TableBody dataState={dataState}   columns={head} dataBody={data} color={colorTable} actions={actions} border={border} colorFont={colorFont} colorIndex={colorIndex} checkbox={checkbox} handleSort={handleSort} sort={sort} idTable={idTable}></TableBody>
                </tbody>
                )}
            </table>
        </div>
        </div>
       
    )
}

export default DataTable;
