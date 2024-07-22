import DataTables from "datatables.net-dt";
import { useEffect, useRef } from "react";
import "datatables.net-dt/css/dataTables.dataTables.css";
import $ from 'jquery';

/**
 * DataTables component for React.
 * @param {Object} props - The props for the DataTables component.
 * @returns {JSX.Element} The DataTables component.
 */
export function ReactDataTables({ ...props }) {
  const tableRef = useRef(null);

  useEffect(() => {
    const dt = new DataTables(tableRef.current, {
      ...props,
      scrollX: true,
      drawCallback: function () {
        // Set the width of the select element
        $("div.dt-length select").css("width", "60px");
      },
    });
    return () => {
      dt.destroy();
    };
  }, [props]);

  return <table ref={tableRef} className="hover cell-border" id="react-table"></table>;
}

export default ReactDataTables;
