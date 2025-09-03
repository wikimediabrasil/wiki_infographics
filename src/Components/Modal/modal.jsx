/* eslint-disable react/prop-types */
import { Button, Modal, TextInput, Label, Select, HelperText } from "flowbite-react";
// Components documentation: https://flowbite-react.com/docs/components/forms
import { useEffect, useState, useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";


export function InfoModal({ barRaceData, currState, onCloseModal, handleChartDisplay, handleChartTitle, handleChartSpeed, handleChartColorPalette, handleChartTimeUnit }) {
  const [openModal, setOpenModal] = useState(false);
  const [chartTitle, setChartTitle] = useState("");
  const [chartSpeed, setChartSpeed] = useState(5);
  const [chartColorPalette, setChartColorPalette] = useState("");
  const [chartTimeUnit, setChartTimeUnit] = useState("year");
  const { getContent } = useContext(LanguageContext);

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

  const handleTimeUnitChange = (event) => {
    var value = event.target.value;
    setChartTimeUnit(value);
    handleChartTimeUnit(value);
  }

  const handleChartType = () => {
    handleChartDisplay("Bar chart race");
  }

  return (
    <>
      <Modal show={openModal} size="sm" onClose={() => { setOpenModal(false); onCloseModal() }}>
        <Modal.Header>{getContent("bar-chart-race-setup-display")}</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">

            <div className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="chartTitle">{getContent("bar-chart-race-setup-title")}</Label>
              </div>
              <TextInput id="chartTitle" placeholder={getContent("bar-chart-race-setup-optional")} value={chartTitle} onChange={handleTitleChange} maxLength={50} />
            </div>

            <div className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="chartUnit">{getContent("bar-chart-race-setup-speed-unit")}</Label>
              </div>
              <Select id="chartUnit" value={chartTimeUnit} onChange={handleTimeUnitChange} required>
                <option value="year">{getContent("bar-chart-race-setup-speed-unit-years")}</option>
                {barRaceData?.hasOwnProperty("values_by_date_monthly") && <option value="month">{getContent("bar-chart-race-setup-speed-unit-months")}</option>}
                {barRaceData?.hasOwnProperty("values_by_date_daily") && <option value="day">{getContent("bar-chart-race-setup-speed-unit-days")}</option>}
              </Select>
            </div>

            <div className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="chartSpeed">{getContent("bar-chart-race-setup-speed-in-units-per-second")}</Label>
              </div>
              <TextInput id="chartSpeed" type="number" min="1" max="50" placeholder={getContent("bar-chart-race-setup-speed-in-units-per-second")} value={chartSpeed} onChange={handleSpeedChange} required />
            </div>

            <div className="max-w-md">
              <div className="mb-2 block">
                <Label htmlFor="chartTitle">{getContent("bar-chart-race-setup-color-palette")}</Label>
              </div>
              <TextInput id="chartTitle" placeholder="#4e79a7,#f28e2c,#e15759,..." value={chartColorPalette} onChange={handleColorPaletteChange} maxLength={300} />
              <HelperText className="dark:text-white">{getContent("bar-chart-race-setup-color-palette-help")}</HelperText>
            </div>

          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => { handleChartType(); setOpenModal(false); onCloseModal(); }}>{getContent("bar-chart-race-setup-create")}</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
