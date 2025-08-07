/* eslint-disable react/prop-types */
import { Button, Modal, TextInput, HelperText } from "flowbite-react";
import { useEffect, useState } from "react";


export function InfoModal({ currState, onCloseModal, handleChartDisplay, handleChartTitle, handleChartSpeed}) {
  const [openModal, setOpenModal] = useState(false);
  const [chartTitle, setChartTitle] = useState("");
  const [chartSpeed, setChartSpeed] = useState(5);

  useEffect(() => {
    setOpenModal(currState);
  },[currState])

  const handleTitleChange = (event) => {
    setChartTitle(event.target.value);
    handleChartTitle(event.target.value);
  }

  const handleSpeedChange = (event) => {
    setChartSpeed(event.target.value);
    handleChartSpeed(event.target.value);
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
            
            <div className="max-w-md">
              <TextInput id="chartTitle" placeholder="Optional" value={chartTitle} onChange={handleTitleChange} maxLength={50} addon="Title" />
            </div>

            <div className="max-w-md">
              <TextInput id="chartSpeed" type="number" min="1" max="10" placeholder="Speed in units per second" value={chartSpeed} onChange={handleSpeedChange} addon="Speed" required />
              <HelperText>Speed in units per second.</HelperText>
            </div>
            
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => { handleChartType(); setOpenModal(false); onCloseModal(); }}>Create bar chart race</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
