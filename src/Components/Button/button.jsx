/* eslint-disable react/prop-types */

import { Button, Dropdown } from "flowbite-react";
import { HiOutlineDownload  } from "react-icons/hi";
import { BsBarChartSteps, BsTable  } from "react-icons/bs";
import { useState, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";

export function DownloadButtons({handleDownloadCsv, isDownloadingCsv, handleDownloadVideo, isDownloadingVideo, chartType}) {
  const { getContent } = useContext(LanguageContext);
  
  return (
    <div className="flex justify-between items-center h-12 px-4 py-1">
      {chartType == "Bar chart race" && <Button className="mr-2" size="xs" color="info" onClick={handleDownloadVideo} isProcessing={isDownloadingVideo} disabled={isDownloadingCsv}>
        <HiOutlineDownload className="mr-2 h-5 w-5" />
        <span className="mt-[2px]">{getContent("button-download-video")}</span>
      </Button>}
      <Button size="xs" color="info" onClick={handleDownloadCsv} isProcessing={isDownloadingCsv} disabled={isDownloadingVideo}>
        <HiOutlineDownload className="mr-2 h-5 w-5" />
        <span className="mt-[2px]">{getContent("button-download-csv")}</span>
      </Button>
    </div>
  );
}


export function DropDownButton({updateModalState, handleCDisplay, isBarChartRaceEnabled, chartType, disabled}) {
  const [openModal, setOpenModal] = useState(true);
  const { getContent } = useContext(LanguageContext);

  const handleModalState = () => {
    setOpenModal(true);
    updateModalState(openModal);
  }

  const chartDisplay = () => {
    handleCDisplay("Table");
  }

  const getLabel = (chartType) => {
    if (chartType === "Table") {
      return getContent("graphic-table-title");
    } else if (chartType == "Bar chart race") {
      return getContent("graphic-bar-chart-race-title");
    }
  }

  return (
    <Dropdown label={getLabel(chartType)} size="sm" outline disabled={disabled}>
      <Dropdown.Item 
        icon={BsTable} 
        onClick={() => {chartDisplay()}}
      > 
        {getContent("graphic-table-title")} 
      </Dropdown.Item>
      <Dropdown.Item 
        icon={BsBarChartSteps} 
        onClick={() => {
          if (isBarChartRaceEnabled) {
            handleModalState();
          }
        }} 
        className={!isBarChartRaceEnabled ? 'opacity-50 cursor-not-allowed' : ''}
      > 
        {getContent("graphic-bar-chart-race-title")} 
      </Dropdown.Item>
    </Dropdown>
  );
}
