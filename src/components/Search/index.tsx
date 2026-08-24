import styles from './search.module.css'
import { Icon } from '@iconify/react';

interface ISearch{
  handleSearch?:any;
  placeholder:string;
  value?:string;
}

export const Search = ({handleSearch,placeholder, value}:ISearch) => {
  return (
    <div className={styles.containerSearch}>
    <input
      type="text"
      onChange={handleSearch}
      className={styles.search}
      value={value}
      placeholder={`${placeholder?`${`Buscar en ${placeholder} ...`}`:'Buscar...'}`}
    />
    <button type="submit" className={styles.searchButton}>
   {/*    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="black"
        className="bi bi-search"
        viewBox="0 0 16 16"
      >
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"></path>
      </svg> */}
      <Icon icon="ion:search" />
    </button>
   
  </div>
  )
}
