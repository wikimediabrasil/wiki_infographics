/* eslint-disable react/prop-types */

import { Button, Dropdown } from "flowbite-react";
import { HiOutlineDownload  } from "react-icons/hi";
import { BsBarChartSteps, BsTable  } from "react-icons/bs";
import { useState } from "react";

export function DownloadButtons({handleDownloadCsv, isDownloadingCsv, handleDownloadVideo, isDownloadingVideo, chartType}) {
  
  return (
    <div className="flex justify-between items-center h-12 px-4 py-1">
      {chartType == "Bar chart race" && <Button className="mr-2" size="xs" color="info" onClick={handleDownloadVideo} isProcessing={isDownloadingVideo} disabled={isDownloadingCsv}>
        <HiOutlineDownload className="mr-2 h-5 w-5" />
        <span className="mt-[2px]">Download video</span>
      </Button>}
      <Button size="xs" color="info" onClick={handleDownloadCsv} isProcessing={isDownloadingCsv} disabled={isDownloadingVideo}>
        <HiOutlineDownload className="mr-2 h-5 w-5" />
        <span className="mt-[2px]">Download CSV</span>
      </Button>
    </div>
  );
}


export function DropDownButton({updateModalState, handleCDisplay, isBarChartRaceEnabled, chartType, disabled}) {
  const [openModal, setOpenModal] = useState(true);


  const handleModalState = () => {
    setOpenModal(true);
    updateModalState(openModal);
  }

  const chartDisplay = () => {
    handleCDisplay("Table");
  }

  return (
    <Dropdown label={chartType} size="sm" outline disabled={disabled}>
      <Dropdown.Item 
        icon={BsTable} 
        onClick={() => {chartDisplay()}}
      > 
        Table 
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
        Bar chart race 
      </Dropdown.Item>
    </Dropdown>
  );
}
