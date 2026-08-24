import { FC, useState } from "react";
import { ITableHeaderProps, TableUserHeader } from "./UserTableHeader";
import { TableUserBody } from "./UserTableBody";
import styles from './usertable.module.css'
import { TableSkeleton } from "../../../../../../../components/Skeleton";



export interface IDataTableProps {
  header: ITableHeaderProps;
  body: any;
  color?: string;

  idTable?: string;
  loading?: boolean;

}



export const UserTable: FC<IDataTableProps | any> = (props) => {



  const { header, body, actions, idTable, loading } = props;
  const [head] = useState<any>(header);

  return (
    <div className={`${styles.table}`}>
      <table className={`w-full ${styles['text-size']} text-left text-neutral-500`} id={idTable}>
        <thead className="text-xs text-neutral-700 uppercase">
          <TableUserHeader dataHeader={head} ></TableUserHeader>
        </thead>
        {loading ? (
          <tbody>
            <tr><td colSpan={head?.length || 1} style={{ padding: 0 }}>
              <TableSkeleton columns={head?.length || 4} />
            </td></tr>
          </tbody>
        ) : (
        <tbody>
          <TableUserBody columns={head} dataBody={body} actions={actions}  ></TableUserBody>
        </tbody>
        )}
      </table>
    </div>
  );
};
