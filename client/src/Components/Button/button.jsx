/* eslint-disable react/prop-types */

import { Button, Dropdown } from "flowbite-react";
import { HiOutlineDownload  } from "react-icons/hi";
import { BsBarChartSteps, BsTable  } from "react-icons/bs";
import { useState } from "react";

export function ButtonWithIcon({handleDownloadCSV, isDownloadng}) {
  
  return (
  
    <Button size="xs" color="info" onClick={handleDownloadCSV} isProcessing={isDownloadng}>
      <HiOutlineDownload className="mr-2 h-5 w-5" />
      <span className="mt-[2px]">Download CSV</span>
    </Button>
  
  );
}



export function DropDownButton({updateModalState, handleCDisplay, isBarChartRaceEnabled, chartType}) {
  const [openModal, setOpenModal] = useState(true);


  const handleModalState = () => {
    setOpenModal(true);
    updateModalState(openModal);
  }

  const chartDisplay = () => {
    handleCDisplay("Table");
  }

  return (
    <Dropdown label={chartType} size="sm" outline>
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