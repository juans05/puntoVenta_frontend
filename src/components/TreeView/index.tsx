import { DiCss3, DiJavascript, DiNpm } from "react-icons/di";
import { FaList, FaRegFolder, FaRegFolderOpen } from "react-icons/fa";
import TreeView, { flattenTree } from "react-accessible-treeview";
import styles from './treeView.module.css'
const folder = {
  name: "",
  children: [
    {
      name: "src",
      children: [{ name: "index.js" },{ name: "text.js", children:[{name:'junior.js'}] }, { name: "styles.css" }]
    },
    {
      name: "node_modules",
      children: [
        {
          name: "react-accessible-treeview",
          children: [{ name: "index.js" }]
        },
        { name: "react", children: [{ name: "index.js" }] }
      ]
    },
    {
      name: ".npmignore"
    },
    {
      name: "package.json"
    },
    {
      name: "webpack.config.js"
    }
  ]
};
const data = flattenTree(folder);
export const MultiSelectDirectoryTreeView=()=> {
  return (
    <div>
      <div className={styles["ide"]}>
        <TreeView
          data={data}
          aria-label="directory tree"
          togglableSelect
          clickAction="EXCLUSIVE_SELECT"
          multiSelect
          onBlur={({ treeState, dispatch }) => {
            dispatch({
              type: "DESELECT",
              id: Array.from(treeState.selectedIds)[0]
            });
          }}
          nodeRenderer={({
            element,
            isBranch,
            isExpanded,
            getNodeProps,
            level,
            
          }) => (
            <div {...getNodeProps()} style={{ paddingLeft: 20 * (level - 1) }}>
              {isBranch ? (
                <FolderIcon isOpen={isExpanded} />
              ) : (
                <FileIcon filename={element.name} />
              )}
              {element.name}
            </div>
          )}
        />
      </div>
    </div>
  );
}
const FolderIcon = ({ isOpen }:any) =>
  isOpen ? (
    <FaRegFolderOpen color="e8a87c" className={styles['icon']} />
  ) : (
    <FaRegFolder color="e8a87c" className={styles['icon']} />
  );
const FileIcon = ({ filename }:any) => {
  const extension = filename.slice(filename.lastIndexOf(".") + 1);
  switch (extension) {
    case "js":
      return <DiJavascript color="yellow" className={styles['icon']} />;
    case "css":
      return <DiCss3 color="turquoise" className={styles['icon']} />;
    case "json":
      return <FaList color="yellow" className={styles['icon']} />;
    case "npmignore":
      return <DiNpm color="red" className={styles['icon']} />;
    default:
      return null;
  }
};
