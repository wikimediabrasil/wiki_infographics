import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';

import NavBar from '../Components/NavBar/navBar';
import CodeEditor from '../Components/CodeEditor/codeEditor';
import { ChartTable } from '../Components/Infographics/Table/table';
import BarChartRace from '../Components/Infographics/BarChartRace/barChartRace';
import Overlay from '../Components/Overlay/overlay';
import { InfoAlert, ErrorAlert } from "../Components/Alert/alert";
import { DownloadButtons, DropDownButton } from "../Components/Button/button"
import { downloadCSV } from '../Components/Infographics/Table/tableUtils';
import { InfoModal } from '../Components/Modal/modal';
import { LanguageContext } from "../context/LanguageContext";


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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, _] = useState("");
  const [isDownloadingCsv, setIsDownloadingCsv] = useState(false);
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [chartType, setChartType] = useState("Table") //Table, Bar chart race, Line chart, etc
  const [chartTitle, setChartTiltle] = useState("");
  const [chartSpeed, setChartSpeed] = useState(5);
  const [chartColorPalette, setChartColorPalette] = useState("");
  const [chartTimeUnit, setChartTimeUnit] = useState("year");
  const [isBarChartRaceEnabled, setIsBarChartRaceEnabled] = useState(false)
  const { getContent } = useContext(LanguageContext);

  useEffect(() => {
    if(Object.keys(chartData).length > 0){
      
      if(chartData.bar_chart_race.failed){    
        setIsBarChartRaceEnabled(false);
      }else{
        setIsBarChartRaceEnabled(true);
      }
    }
  }, [chartData])
  
  
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
      setIsLoading(true);
      const sparql_query = encodeURIComponent(code);
      const response = await api.get(`/query/?query=${sparql_query}`) //GET request is required for better line error response
      handleClearError();
      setChartData(response.data.data);
      setChartType("Table");
      setChartTimeUnit("year");
    } catch (error) {
      handleClearError()
      setError(error?.response?.data?.error || "preview-error-fetching-data")
      setChartData({})
      console.error(error?.response?.data?.error || error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    setIsDownloadingCsv(true)
    downloadCSV(chartData.table);
    setTimeout(() => setIsDownloadingCsv(false), 2000);
  }

  const handleDownloadVideo = () => {
    setIsDownloadingVideo(dv => !dv);
  }

  const changeModalState = (currState) => {
    setOpenModal(currState);
  }

  const onCloseModal = () => {
    setOpenModal(false);
  }
  
  const handleChartDisplay = (chartName) => {
    setChartType(chartName);
  }

  const handleChartTitle = (title) => {
    setChartTiltle(title);
  }

  const handleChartSpeed = (speed) => {
    setChartSpeed(speed);
  }

  const handleChartColorPalette = (colorPalette) => {
    setChartColorPalette(colorPalette);
  }

  const handleChartTimeUnit = (timeUnit) => {
    setChartTimeUnit(timeUnit);
  }

  const handleClearError = () => {
    setError("");
  }


  return (
    <>

      <NavBar username={username}/>
      <div className="mx-auto bg-gray-100 dark:bg-gray-700 container mt-2">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div style={{minHeight: "82vh"}} className="flex-1 border dark:border-gray-800 bg-white dark:bg-gray-600">
            <CodeEditor onCodeChange={handleCodeChange} handleFetchChartData={getChartData} isLoading={isLoading} errorMessage={error}/>
          </div>
          <div style={{minHeight: "82vh", minWidth: "50%" }} className="flex-1 border dark:border-gray-800 relative overflow-x-auto bg-white dark:bg-gray-600">
            {isLoading && <Overlay />}
            {error && <div className="flex items-center justify-center mt-7"><ErrorAlert alertText={getContent(error) || error} /></div>}
            {Object.keys(chartData).length < 1 && !error && <div className="flex items-center justify-center mt-7"><InfoAlert alertText={getContent("preview-no-data")} /></div>}
            {chartData.table && <div className="flex justify-between items-center h-12 border-b-4 dark:border-gray-700 px-4 py-1">
              <DropDownButton updateModalState={changeModalState} handleCDisplay={handleChartDisplay} isBarChartRaceEnabled={isBarChartRaceEnabled} chartType={chartType} disabled={isDownloadingVideo || isDownloadingCsv}/>
              <DownloadButtons handleDownloadCsv={handleDownloadCsv} isDownloadingCsv={isDownloadingCsv} handleDownloadVideo={handleDownloadVideo} isDownloadingVideo={isDownloadingVideo} chartType={chartType}/>
            </div>}
            <InfoModal barRaceData={chartData.bar_chart_race} currState={openModal} onCloseModal={onCloseModal} handleChartDisplay={handleChartDisplay} handleChartTitle={handleChartTitle} handleChartSpeed={handleChartSpeed} handleChartColorPalette={handleChartColorPalette} handleChartTimeUnit={handleChartTimeUnit}/>
            {chartData.table && chartType == "Table" && <ChartTable tableData={chartData.table} />}
            {chartType == "Bar chart race" && !error && Object.keys(chartData).length > 0 && <BarChartRace title={chartTitle} speed={chartSpeed} colorPalette={chartColorPalette} timeUnit={chartTimeUnit} barRaceData={chartData.bar_chart_race} isDownloadingVideo={isDownloadingVideo} setIsDownloadingVideo={setIsDownloadingVideo} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Infographics;
