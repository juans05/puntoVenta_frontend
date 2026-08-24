import React, { useState } from "react";
import { TabItem } from "./TabItem";
import styles from "./tabs.module.css";

interface Tab {
  id: number;
  title: string;
  children?: Tab[];

  
}


interface ThreeTabsProps {
  tabsData: Tab[];
}

export const ThreeTabs: React.FC<ThreeTabsProps> = ({ tabsData }) => {
  const [activeIds, setActiveIds] = useState<number[]>([]);
console.log(activeIds);
  const handleTabClick = (tab: Tab) => {
    console.log(tab)
    const tabId = tab.id;
    const index = activeIds.indexOf(tabId);
    if (index !== -1) {
      setActiveIds(activeIds.slice(0, index));
    } else {
      setActiveIds([...activeIds, tabId]);
    }
  };

  const renderTabs = (tabs: Tab[]) => {
    return tabs.map((tab) => (
      <TabItem
        key={tab.id}
        data={tab}
        onClick={handleTabClick}
        activeIds={activeIds}
      />
    ));
  };

  return <div className={styles["tabs-container"]}>{renderTabs(tabsData)}</div>;
};