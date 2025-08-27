/* eslint-disable react/prop-types */
import { useState, useEffect, useContext } from 'react';
import DataTable from 'react-data-table-component';
import { DarkModeContext } from "../../../context/DarkModeContext";


/**
 * FilterComponent to provide search functionality in the DataTable.
 * @param {Object} props - The props for the FilterComponent.
 * @returns {JSX.Element} The FilterComponent.
 */
const FilterComponent = ({ filterText, onFilter, onClear }) => (
  <div className="search-bar">
    <input
      type="text"
      placeholder="Search..."
      value={filterText}
      onChange={onFilter}
      className="border dark:border-gray-800 p-2 rounded dark:bg-gray-700 dark:text-white"
    />
    <button type="button" onClick={onClear} className="border dark:border-gray-800 p-2 rounded text-white bg-cyan-700 dark:bg-cyan-600">
      X
    </button>
  </div>
);


/**
 * DataTables component for React using react-data-table-component.
 * @param {Object} props - The props for the DataTables component.
 * @returns {JSX.Element} The DataTables component.
 */
export function ReactDataTables({ columns, data, headers }) {
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [filteredData, setFilteredData] = useState(data);
  const {darkMode} = useContext(DarkModeContext);

  useEffect(() => {
    const filtered = data.filter(item => {
      return headers.some(column => {
        const cellData = item[column] || '';  // Use the column name directly as key
        return cellData.toString().toLowerCase().includes(filterText.toLowerCase());
      });
    });
    setFilteredData(filtered);
  }, [filterText, data, columns, headers]);

  // fix for the svg("v") element in the pagination displaying twice
  useEffect(() => {
    const paginationContainer = document.querySelector('.rdt_Pagination');
    const svgElement = paginationContainer?.querySelector('svg');
    if (svgElement) {
      svgElement.style.display = 'none';
    }
  }, []);

  const subHeaderComponent = (
    <FilterComponent
      filterText={filterText}
      onFilter={e => setFilterText(e.target.value)}
      onClear={() => {
        if (filterText) {
          setResetPaginationToggle(!resetPaginationToggle);
          setFilterText('');
        }
      }}
    />
  );

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      theme={darkMode ? 'dark' : 'light'}
      pagination
      paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to page 1
      highlightOnHover
      pointerOnHover
      responsive
      fixedHeader
      subHeader
      subHeaderComponent={subHeaderComponent}
    />
  );
}

export default ReactDataTables;
