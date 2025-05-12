/* eslint-disable react/prop-types */
"use client";


import ReactDataTables from "./reactDataTables";
import { formatURL, formatDate } from "./tableUtils"; // Utility for URL formatting

/**
 * ChartTable component for displaying data in a DataTable.
 * @param {Object} tableData - The data to be displayed in the table, with `columns` and `data` properties.
 * @returns {JSX.Element} The ChartTable component.
 */
export function ChartTable({ tableData }) {

  // Extract headers from list of columns
  const headers = tableData.columns;
  const columns = headers.map(header => ({
    name: header,
    selector: row => row[header], // Ensure this matches the key in your data
    sortable: true,
    cell: row => {
      const data = row[header];
      if (data && (data.startsWith('http://') || data.startsWith('https://'))) {
        return <a href={data} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{formatURL(data)}</a>;
      } else if (typeof data === 'string' && data.includes('T')) {
        // Check if data is a valid ISO date string and format it
        const parsedDate = Date.parse(data);
        if (!isNaN(parsedDate)) {
          return formatDate(data);
        }
      }
      return data;
    }
  }));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ReactDataTables columns={columns} data={tableData.data} headers={headers}/>
    </div>
  );
}

export default ChartTable;
