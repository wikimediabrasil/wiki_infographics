import { useState } from 'react';
import api from '../api/axios';

import NavBar from '../Components/NavBar/navBar';
import CodeEditor from '../Components/CodeEditor/codeEditor';
import { ChartTable } from '../Components/Table/table';
import Overlay from '../Components/Overlay/overlay';

/**
 * Infographics component for displaying data visualization.
 * 
 * This component:
 * - Manages state for chart data, code input, and loading status.
 * - Provides a CodeEditor for users to input SPARQL queries.
 * - Fetches chart data based on the query and displays it in a ChartTable.
 * - Displays an overlay during data loading.
 * 
 * @returns {JSX.Element} The Infographics component.
 */
const Infographics = () => {
  const [chartData, setChartData] = useState({});
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Updates the code state when the CodeEditor value changes.
   * 
   * @param {string} newCode - The updated code from CodeEditor.
   */
  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };


  /**
   * Fetches chart data based on the SPARQL query from the code state.
   * Sets the chart data and handles loading state.
   */
  const getChartData = async () => {
    try {
      setLoading(true);
      const sparql_query = code;
      const response = await api.post('/query', { sparql_string: sparql_query });
      setChartData(response.data);
      console.log(response.data);
    } catch (err) {
      console.error(err.response?.data?.error || err);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
      <NavBar />
      <div className="min-h-screen px-4 py-8 mx-auto bg-gray-100 container">
        <div className="grid grid-rows-5 gap-4 lg:grid-cols-5 lg:grid-rows-1 lg:gap-4">
          <div className="lg:col-span-2 row-span-1 border overflow-x-auto">
            <CodeEditor onCodeChange={handleCodeChange} handleFetchChartData={getChartData} />
          </div>
          <div className="lg:col-span-3 row-span-4 border relative overflow-x-auto">
            {loading && <Overlay />}
            <ChartTable tableData={chartData.table} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Infographics;
