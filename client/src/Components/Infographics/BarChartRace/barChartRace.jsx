/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import { HiOutlineDownload  } from "react-icons/hi";
import { Button } from "flowbite-react";
import { initializeChart, updateChart } from "./barChartRaceUtils";
import * as d3 from "d3";
import "./barChartRace.css";
import 'font-awesome/css/font-awesome.min.css';
import api from '../../../api/axios';

/**
 * BarChartRace component visualizes a bar chart race with play/pause and year selection controls.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the chart
 * @param {number} props.speed - Speed of the chart
 * @param {string} props.colorPalette - List of colors for the chart
 * @param {Array} props.barRaceData - Data for the bar chart race
 */
const BarChartRace = ({ title, speed, colorPalette, barRaceData }) => {
  const DEFAULT_TRANSITION_DELAY = 250;
  const svgRef = useRef(null); // Reference to the SVG element
  const currentKeyframeRef = useRef(0); // Tracks the current keyframe
  const [isPlaying, setIsPlaying] = useState(false); // Play/pause state
  const [startYear, setStartYear] = useState(0); // Minimum year in data
  const [endYear, setEndYear] = useState(0); // Maximum year in data
  const [year, setYear] = useState(startYear); // Current selected year
  const [dataset, setDataset] = useState(null); // Processed data
  const [currentKeyframeState, setCurrentKeyFrameState] = useState(0); // Current keyframe state
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const keyframesRef = useRef([]); // Stores all keyframes
  const timeoutRef = useRef(null); // Handles animation timing
  const inputRef = useRef(null); // Reference to range input
  var videoId;

  useEffect(() => {
    const fetchDataAsync = () => {
      if (barRaceData) {
        const dataset = {
          "elements": barRaceData.elements,
          "keyframes": barRaceData.values_by_date.map(d => [new Date(d.date), d.values])
        }
        setDataset(dataset);

        // Find and set the minimum and maximum years
        const years = dataset.keyframes.map(d => d[0].getFullYear());
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

      // Prepare color palette
      var colorPaletteArray = d3.schemeTableau10;
      if (colorPalette.length > 6 && colorPalette.includes("#")) {
        colorPaletteArray = colorPalette.replace(" ", "").split(",");
      };

      const width = container.clientWidth;
      const keyframes = initializeChart(svgRef, dataset, width, title, colorPaletteArray);
      keyframesRef.current = keyframes;

      // Initialize chart with the first keyframe.
      clearTimeout(timeoutRef.current);
      setYear(startYear);
      currentKeyframeRef.current = 0;
      updateChart(keyframes[0], svgRef.current.transition().duration(0), inputRef, null);
      setIsDownloadingVideo(false);
    }
    const currentSvg = svgRef.current;
    // Cleanup function to remove SVG on component unmount or before re-render
    return () => {
      if (currentSvg) {
        currentSvg.remove();
      }
    };

  }, [dataset, title, speed, colorPalette]);

  useEffect(() => {
    const playButton = document.getElementById("play-pause-button");
    const playRange = document.getElementById("play-range");
    playButton.disabled = isDownloadingVideo;
    playRange.disabled = isDownloadingVideo;
  }, [isDownloadingVideo]);

  const animationDelay = () => {
    return 1000 / speed;
  };

  const startAnimation = () => {
    if (canIncreaseAnimationTick()) {
      const transition = getTransition(animationDelay());
      increaseAnimationTick(transition);
      timeoutRef.current = setTimeout(startAnimation, animationDelay());
    } else {
      setIsPlaying(false);
    }
  };

  const getTransition = (delay) => {
    return svgRef.current.transition().duration(delay).ease(d3.easeLinear);
  }

  const increaseAnimationTick = (transition) => {
    if (canIncreaseAnimationTick()) {
      const keyframe = keyframesRef.current[currentKeyframeRef.current];

      updateChart(keyframe, transition, inputRef, null);
      currentKeyframeRef.current += 1;
      setCurrentKeyFrameState(keyframe);

      // Sync range input with keyframe
      inputRef.current.value = keyframe[0].getFullYear();
      setYear(keyframe[0].getFullYear());
      return true;
    } else {
      return false;
    };
  };

  const canIncreaseAnimationTick = () => {
    return currentKeyframeRef.current < keyframesRef.current.length;
  }

  const playPause = () => {
    if (isPlaying) {
      clearTimeout(timeoutRef.current);
      const transition = getTransition(DEFAULT_TRANSITION_DELAY);
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
    setAnimationToYear(selectedYear);
  };

  const setAnimationToYear = (year) => {
    const frameIndex = keyframesRef.current.findIndex(frame => frame[0].getFullYear() === year);
    if (frameIndex !== -1) {
      clearTimeout(timeoutRef.current);
      setIsPlaying(false);
      setYear(year);
      const transition = getTransition(DEFAULT_TRANSITION_DELAY);
      currentKeyframeRef.current = frameIndex; // Set current keyframe
      updateChart(keyframesRef.current[frameIndex], transition, inputRef, null);
    }
  }

  const handleDownloadVideoStart = async () => {
    if (!isDownloadingVideo) {
      await api.post('/video/create/').then((response) => {
        if (response.status == 201) {
          videoId = response.data.id;
          setIsDownloadingVideo(true);
          setAnimationToYear(startYear);
          timeoutRef.current = setTimeout(startDownloadAnimation, animationDelay() * 2);
        };
      }).catch((error) => {
        console.log(`error while creating video: ${error}`);
        stopDownload();
      });
    } else {
      stopDownload();
    }
  };

  const startDownloadAnimation = () => {
    if (canIncreaseAnimationTick()) {
      const frameEndpoint = `/video/${videoId}/frame/`;
      const transition = getTransition(animationDelay()).tween("capture", () => {
        return async (time) => {
          const ordering = currentKeyframeRef.current + 0.95 * time;
          const svgString = document.getElementById("container").getHTML();
          await api.postForm(frameEndpoint, { ordering: ordering, svg: svgString }).then((response) => {
            if (response.status == 201) {
              console.log(`video ${videoId} / ordering ${ordering}`);
            };
          });
        };
      });
      increaseAnimationTick(transition);
      timeoutRef.current = setTimeout(startDownloadAnimation, animationDelay() * 1.5);
    } else {
      stopDownload();
    }
  };

  const stopDownload = () => {
    clearTimeout(timeoutRef.current);
    setIsPlaying(false);
    setIsDownloadingVideo(false);
    videoId = null;
  }

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
        <Button size="xs" className="ml-2" color="info" onClick={handleDownloadVideoStart} isProcessing={isDownloadingVideo}>
          <HiOutlineDownload className="h-5 w-5" />
        </Button>
      </div>
      <div id="container"></div>
    </div>
  );
};

export default BarChartRace;
