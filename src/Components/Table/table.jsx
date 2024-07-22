/* eslint-disable react/prop-types */
"use client";

import { InfoAlert } from "../Alert/alert";
import ReactDataTables from "./reactDataTables";
import { formatURL } from "./tableUtils"; // Utility for URL formatting

/**
 * ChartTable component for displaying data in a DataTable.
 * @param {Object} tableData - The data to be displayed in the table, with `columns` and `data` properties.
 * @returns {JSX.Element} The ChartTable component.
 */
export function ChartTable({ tableData }) {

  if (!tableData) {
    return <div className="flex items-center justify-center mt-7"><InfoAlert/></div>;
  }

  // Extract headers from list of columns
  const headers = tableData.columns;
  const columns = headers.map(header => ({
    data: header,
    title: header,
    render: (data) => {
      // Format only if the data is a URL
      if (data && (data.startsWith('http://') || data.startsWith('https://'))) {
        return formatURL(data);
      }
      // For non-URL data, just return it as is
      return data;
    },
    type: 'html' // Ensure DataTables interprets this column as HTML
  }));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ReactDataTables data={tableData.data} columns={columns} />
    </div>
  );
}
