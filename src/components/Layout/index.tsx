import React,{useEffect} from "react";
import styles from "./layout.module.css";
import { Sidebar } from "./Sidebar";
import { IconType } from "react-icons";
import { Button } from "@tremor/react";
//@ts-ignore
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { Tabs } from "./Tabs";
import { Search } from "../Search";



interface ILayout {
  children?: React.ReactNode;
  title?: string;
  tabs: Tab[] | any;
  tabs1: TabButton[] | any;
  handleTabClick: any;
  activeTab: any;
  selectTabButton: any;
  activeTab1: any;
  buttons: IButton[];
  handleSearch?:any
  setClientSearch?:any
  clienteSearch?:any;
  onEditTab?: any;
  onDeleteTab?: any;
  onEditTab1?: any;
  onDeleteTab1?: any;
}
export interface Tab {
  id: number;
  label: string;
  icon: IconType;
  children?: any;
  data?: any;
  dataBtns?: any;
  btnsHeader?:any;
}
export interface TabButton {
  id: number;
  name: string;
}
export interface IButton {
  id: number;
  value: string;
  onClick: any;
}
export const Layout = ({
  children,
  title = "Productos",
  tabs,
  tabs1,
  handleTabClick,
  activeTab,
  selectTabButton,
  activeTab1,
  buttons,
  handleSearch,
  setClientSearch,
  clienteSearch,
  onEditTab,
  onDeleteTab,
  onEditTab1,
  onDeleteTab1,
}: ILayout) => {

  const optionSelected=tabs1?.find((value:any)=>value?.id===activeTab1)
  const textToPlaceholder=optionSelected?.name;

  useEffect(() => {

      setClientSearch("");
    
   
  }, [activeTab])
 


  return (
    <div>
      <div className={styles.main}>
        <div className={styles.sidebar}>
          <Sidebar
            tabs={tabs}
            handleTabClick={handleTabClick}
            activeTab={activeTab}
            onEditTab={onEditTab}
            onDeleteTab={onDeleteTab}
          />
        </div>
        <div className={styles.outlet}>
          <div className={styles.header}>
            <h4>{title}</h4>
            <div className={styles.btn}>
              {buttons?.map((item, index) => {
                return (
                  <Button key={index} size="sm" onClick={item?.onClick}>
                    {item?.value}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className={styles.navbar}>
            <div className={styles["search-main"]}>
              <Search handleSearch={handleSearch} placeholder={textToPlaceholder} value={clienteSearch}/>
            </div>
            <div>
              <Tabs
                tabs={tabs1}
                handleClick={selectTabButton}
                activeTab={activeTab1}
                onEditTab={onEditTab1}
                onDeleteTab={onDeleteTab1}
              />
            </div>
          </div>
          <div className={styles.content}>
          
            <div  className={styles.items}>{children}</div>
         
          </div>
        </div>
      </div>
    </div>
  );
};
