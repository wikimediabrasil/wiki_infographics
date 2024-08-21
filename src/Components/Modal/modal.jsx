/* eslint-disable react/prop-types */
import { Button, Modal, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";


import { Select } from "flowbite-react";

function SelectColumn() {
  return (
    <div className="inline">
      
      <Select id="countries" required>
        <option>Quantity</option>
        <option>Identifier</option>
      </Select>
    </div>
  );
}



export function InfoModal({ currState, onCloseModal, handleChartDisplay, handleChartTitle}) {
  const [openModal, setOpenModal] = useState(false);
  const [chartTitle, setChartTiltle] = useState("");

  useEffect(() => {
    setOpenModal(currState);
  },[currState])

  const handleTitleChange = (event) => {
    setChartTiltle(event.target.value);
    handleChartTitle(event.target.value);
  }

  const handleChartType = () => {
    handleChartDisplay("Bar chart race");
  }

  return (
    <>
      <Modal show={openModal}  size="sm" onClose={() => {setOpenModal(false); onCloseModal()}}>
        <Modal.Header>Bar chart race setup</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              <span className="font-medium">Note!</span> Bar chart race works better with the default date format <span className="font-medium">{"1872-01-01T00:00:00Z"}</span>. Formatting the date may lead to an unexpected bar race.
              <br />
              Try making queries for just the data you need to visualize
            </p>
            <hr />
            <div className="max-w-md">
              <TextInput id="chartTitle" placeholder="Optional" value={chartTitle} onChange={handleTitleChange} maxLength={50} addon="Title" />
            </div>
            <p className="text-base font-medium leading-relaxed flex  justify-center text-gray-500 dark:text-gray-400">
              Bar chart race for 
            </p>
            <div className="flex flex-shrink gap-3"> <SelectColumn inline />  <span className="font-medium pt-2 text-gray-500 dark:text-gray-400">in</span>  <SelectColumn inline/> 
            </div> 
            <p className="text-base font-bold leading-relaxed flex  justify-center">
              <span className="font-medium text-gray-500 dark:text-gray-400">over time</span>
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => { handleChartType(); setOpenModal(false); onCloseModal(); }}>Create bar chart race</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
