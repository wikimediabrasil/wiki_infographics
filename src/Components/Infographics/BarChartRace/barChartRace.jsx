/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import { startYear, endYear, initializeChart, updateChart } from "./barChartRaceUtils";
import * as d3 from "d3";
import "./barChartRace.css";
import 'font-awesome/css/font-awesome.min.css';

const BarChartRace = ({title, barRaceData}) => {
  const svgRef = useRef(null);
  const currentKeyframeRef = useRef(0); // useRef for currentKeyframe
  const [isPlaying, setIsPlaying] = useState(false);
  const [year, setYear] = useState(startYear);
  const [dataset, setDataset] = useState(null);
  const [currentKeyframeState, setCurrentKeyFrameState] = useState(0)
  const keyframesRef = useRef([]);
  const timeoutRef = useRef(null);
  const inputRef = useRef(null);

  
  useEffect(() => {
    const fetchDataAsync = () => {

      if(barRaceData){
        const data = barRaceData.map(d => ({
          ...d,
          date: new Date(d.date)
        }));
        setDataset(data);
      }
    }
    fetchDataAsync();
  }, [barRaceData]);

  useEffect(() => {
    const container = document.getElementById("container");
    const width = container.clientWidth;
    if (dataset) {
      const keyframes = initializeChart(svgRef, dataset, width, title);
      keyframesRef.current = keyframes;

       // Display the first keyframe to initialize the chart
      const firstKeyframe = keyframes[0];
      updateChart(firstKeyframe, svgRef.current.transition().duration(0), inputRef, null)
    }
  }, [dataset]);

  const startAnimation = () => {
    if (currentKeyframeRef.current < keyframesRef.current.length) {
      const transition = svgRef.current
        .transition()
        .duration(250)
        .ease(d3.easeLinear);

      const keyframe = keyframesRef.current[currentKeyframeRef.current];
      // Update chart based on keyframe data and increment range input
      updateChart(keyframe, transition, inputRef, null);
      currentKeyframeRef.current += 1;
      setCurrentKeyFrameState(keyframe)

      // Manually update the range input to keep it in sync with the keyframe
      inputRef.current.value = keyframe[0].getFullYear(); // Assuming keyframe[0] is the date object
      setYear(keyframe[0].getFullYear());

      // Delay next frame based on transition duration
      timeoutRef.current = setTimeout(() => {
        startAnimation();
      }, 250);
    } else {
      setIsPlaying(false);
    }
  };
  const playPause = () => {
    if (isPlaying) {
      const transition = svgRef.current
        .transition()
        .duration(250)
        .ease(d3.easeLinear);
      clearTimeout(timeoutRef.current);
      updateChart(currentKeyframeState, transition, inputRef, null)
    } else {
      startAnimation();
    }
    if(!(year >= endYear)){

      setIsPlaying(!isPlaying);
    }
  };

  const onRangeChange = (event) => {
    const selectedYear = parseInt(event.target.value, 10);
    setYear(selectedYear);
    const frameIndex = keyframesRef.current.findIndex(
      (frame) => frame[0].getFullYear() === selectedYear
    );

    if (frameIndex !== -1) {
      const transition = svgRef.current
        .transition()
        .duration(250)
        .ease(d3.easeLinear);
      currentKeyframeRef.current = frameIndex; // Set currentKeyframeRef directly
      updateChart(keyframesRef.current[frameIndex], transition, inputRef, null);
    }
  };

  return (
    <div id="parent-container" className="relative p-4">
      <div id="play-controls" className="flex items-center mb-4">
        <button
          id="play-pause-button"
          className={`fa ${isPlaying ? "fa-pause" : "fa-play"}`}
          title="play"
          onClick={playPause}
        ></button>
        <input
          id="play-range"
          type="range"
          value={year}
          min={startYear}
          max={endYear}
          className="ml-1"
          onChange={onRangeChange}
          ref={inputRef}
        />
      </div>
      <div id="container"></div>
      <p className="highcharts-description pl-2 italic mt-4">
        Wiki infographics
      </p>
    </div>
  );
};

export default BarChartRace;
