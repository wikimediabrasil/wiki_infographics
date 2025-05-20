/* eslint-disable react/prop-types */
import { Button, Modal, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";


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
            
            <div className="max-w-md">
              <TextInput id="chartTitle" placeholder="Optional" value={chartTitle} onChange={handleTitleChange} maxLength={50} addon="Title" />
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
