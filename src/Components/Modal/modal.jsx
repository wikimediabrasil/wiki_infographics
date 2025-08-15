/* eslint-disable react/prop-types */
import { Button, Modal, TextInput, Label, Select, HelperText } from "flowbite-react";
// Components documentation: https://flowbite-react.com/docs/components/forms
import { useEffect, useState } from "react";


export function InfoModal({ currState, onCloseModal, handleChartDisplay, handleChartTitle, handleChartSpeed, handleChartColorPalette }) {
  const [openModal, setOpenModal] = useState(false);
  const [chartTitle, setChartTitle] = useState("");
  const [chartSpeed, setChartSpeed] = useState(5);
  const [chartColorPalette, setChartColorPalette] = useState("");

  useEffect(() => {
    setOpenModal(currState);
  }, [currState])

  const handleTitleChange = (event) => {
    setChartTitle(event.target.value);
    handleChartTitle(event.target.value);
  }

  const handleSpeedChange = (event) => {
    var value = event.target.value;
    setChartSpeed(value);
    handleChartSpeed(value);
  }

  const handleColorPaletteChange = (event) => {
    var value = event.target.value;
    setChartColorPalette(value);
    handleChartColorPalette(value);
  }

  const handleChartType = () => {
    handleChartDisplay("Bar chart race");
  }

  return (
    <>
      <Modal show={openModal} size="sm" onClose={() => { setOpenModal(false); onCloseModal() }}>
        <Modal.Header>Bar chart race setup</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">

            <div className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="chartTitle">Title</Label>
              </div>
              <TextInput id="chartTitle" placeholder="Optional" value={chartTitle} onChange={handleTitleChange} maxLength={50} />
            </div>

            <div className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="chartUnit">Speed unit</Label>
              </div>
              <Select id="chartUnit" required>
                <option>Years</option>
              </Select>
            </div>

            <div className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="chartSpeed">Speed in units per second</Label>
              </div>
              <TextInput id="chartSpeed" type="number" min="1" max="10" placeholder="Speed in units per second" value={chartSpeed} onChange={handleSpeedChange} required />
            </div>

            <div className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="chartTitle">Color palette</Label>
              </div>
              <TextInput id="chartTitle" placeholder="#4e79a7,#f28e2c,#e15759,... (Optional)" value={chartColorPalette} onChange={handleColorPaletteChange} maxLength={300} />
              <HelperText>In hex format, separated by commas.</HelperText>
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
