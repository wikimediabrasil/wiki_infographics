/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';


// Custom styles for DataTable
const customStyles = {
  table: {
    style: {
      overflowY: 'hidden', // Hide vertical scrollbar
    },
  },
  headCells: {
    style: {
      borderRight: '1px solid #e0e0e0',
      borderTop: '1px solid #e0e0e0',
      fontSize: '16px',
    },
  },
  cells: {
    style: {
      borderRight: '1px solid #e0e0e0',
      fontSize: '14px'
    },
  },
};


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
      className="border p-2 rounded"
    />
    <button type="button" onClick={onClear} className="border p-2 rounded ml-2 text-white bg-black">
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
      pagination
      paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to page 1
      highlightOnHover
      pointerOnHover
      responsive
      fixedHeader
      subHeader
      subHeaderComponent={subHeaderComponent}
      customStyles={customStyles} // Apply custom styles
    />
  );
}

export default ReactDataTables;
