/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import { initializeChart, updateChart } from "./barChartRaceUtils";
import * as d3 from "d3";
import "./barChartRace.css";
import 'font-awesome/css/font-awesome.min.css';

/**
 * BarChartRace component visualizes a bar chart race with play/pause and year selection controls.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the chart
 * @param {Array} props.barRaceData - Data for the bar chart race
 */
const BarChartRace = ({ title, barRaceData }) => {
  const svgRef = useRef(null); // Reference to the SVG element
  const currentKeyframeRef = useRef(0); // Tracks the current keyframe
  const [isPlaying, setIsPlaying] = useState(false); // Play/pause state
  const [startYear, setStartYear] = useState(0); // Minimum year in data
  const [endYear, setEndYear] = useState(0); // Maximum year in data
  const [year, setYear] = useState(startYear); // Current selected year
  const [dataset, setDataset] = useState(null); // Processed data
  const [currentKeyframeState, setCurrentKeyFrameState] = useState(0); // Current keyframe state
  const keyframesRef = useRef([]); // Stores all keyframes
  const timeoutRef = useRef(null); // Handles animation timing
  const inputRef = useRef(null); // Reference to range input

  useEffect(() => {
    const fetchDataAsync = () => {
      if (barRaceData) {
        // Convert dates to Date objects and values to integers
        const data = barRaceData.map(d => ({
          ...d,
          date: new Date(d.date),
          value: parseInt(d.value, 10)
        }));
        setDataset(data);

        // Find and set the minimum and maximum years
        const years = data.map(d => d.date.getFullYear());
        setStartYear(Math.min(...years));
        setEndYear(Math.max(...years));
      }
    };
    fetchDataAsync();
  }, [barRaceData]);

  useEffect(() => {
    if (dataset) {
      const container = document.getElementById("container");

      // Cleanup previous SVG element
      if (container) {
        container.innerHTML = "";
      }

      const width = container.clientWidth;
      const keyframes = initializeChart(svgRef, dataset, width, title);
      keyframesRef.current = keyframes;

      // Initialize chart with the first keyframe.
      updateChart(keyframes[0], svgRef.current.transition().duration(0), inputRef, null);
    }
    const currentSvg = svgRef.current;
    // Cleanup function to remove SVG on component unmount or before re-render
    return () => {
      if (currentSvg) {
        currentSvg.remove();
      }
    };

  }, [dataset, title]);

  const startAnimation = () => {
    if (currentKeyframeRef.current < keyframesRef.current.length) {
      const transition = svgRef.current.transition().duration(250).ease(d3.easeLinear);
      const keyframe = keyframesRef.current[currentKeyframeRef.current];
      
      updateChart(keyframe, transition, inputRef, null);
      currentKeyframeRef.current += 1;
      setCurrentKeyFrameState(keyframe);

      // Sync range input with keyframe
      inputRef.current.value = keyframe[0].getFullYear();
      setYear(keyframe[0].getFullYear());

      // Continue animation after delay
      timeoutRef.current = setTimeout(startAnimation, 250);
    } else {
      setIsPlaying(false);
    }
  };

  const playPause = () => {
    if (isPlaying) {
      clearTimeout(timeoutRef.current);
      const transition = svgRef.current.transition().duration(250).ease(d3.easeLinear);
      updateChart(currentKeyframeState, transition, inputRef, null);
    } else {
      startAnimation();
    }
    
    if (!(year >= endYear)) {
      setIsPlaying(!isPlaying);
    }
  };

  const onRangeChange = (event) => {
    const selectedYear = parseInt(event.target.value, 10);
    setYear(selectedYear);
    
    const frameIndex = keyframesRef.current.findIndex(frame => frame[0].getFullYear() === selectedYear);
    
    if (frameIndex !== -1) {
      const transition = svgRef.current.transition().duration(250).ease(d3.easeLinear);
      currentKeyframeRef.current = frameIndex; // Set current keyframe
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
