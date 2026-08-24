import React from 'react';
import { TabItem } from './TabItem';
import styles from './tabs.module.css'


interface TabData {
  id: number;
  value: string;
}

interface TabsContainerProps {
  data: TabData[];
  activeTab:any;
  setActiveTab:any;
}

export const Tabs: React.FC<TabsContainerProps> = ({ data,setActiveTab,activeTab }) => {
 /*  const [activeTab, setActiveTab] = useState(data[0].id); */

  const handleTabClick = (tabId: number) => {
    setActiveTab(tabId);
  };

  return (
    <div className={styles["tabs-container"]}>
      <div className={styles["tab-list"]}>
        {data.map((tab) => (
          <TabItem
            key={tab.id}
            label={tab.value}
            onClick={() => handleTabClick(tab.id)}
            isActive={activeTab === tab.id}
          />
        ))}
      </div>
    {/*   {
        activeTab &&   <div className={styles["tab-content"]}>
       
          <div
           
           
          >
            Content {activeTab}
          </div>
   
      </div>
      } */}
    
    </div>
  );
};

