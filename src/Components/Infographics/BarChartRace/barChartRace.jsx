/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import { Alert } from "flowbite-react";
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
const BarChartRace = ({ title, speed, colorPalette, barRaceData, isDownloadingVideo, setIsDownloadingVideo }) => {
  const DEFAULT_TRANSITION_DELAY = 250;
  const svgRef = useRef(null); // Reference to the SVG element
  const currentKeyframeRef = useRef(0); // Tracks the current keyframe
  const [isPlaying, setIsPlaying] = useState(false); // Play/pause state
  const [startYear, setStartYear] = useState(0); // Minimum year in data
  const [endYear, setEndYear] = useState(0); // Maximum year in data
  const [year, setYear] = useState(startYear); // Current selected year
  const [dataset, setDataset] = useState(null); // Processed data
  const [currentKeyframeState, setCurrentKeyFrameState] = useState(0); // Current keyframe state
  const [downloadTimeLeft, setDownloadTimeLeft] = useState(null);
  const keyframesRef = useRef([]); // Stores all keyframes
  const timeoutRef = useRef(null); // Handles animation timing
  const inputRef = useRef(null); // Reference to range input
  const abortControllerRef = useRef(null);
  const videoIdRef = useRef(null);

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

  useEffect(() => {
    const playControls = document.getElementById("play-controls");
    const container = document.getElementById("container");
    playControls.style.display = isDownloadingVideo ? "none" : "flex";
    container.style.display = isDownloadingVideo ? "none" : "block";
    if (isDownloadingVideo) {
      api.post('/video/create/').then((response) => {
        if (response.status == 201) {
          videoIdRef.current = response.data.id;
          setAnimationToYear(startYear);
          startTimeLeft();
          timeoutRef.current = setTimeout(startDownloadAnimation, animationDelay() * 2);
        } else {
          stopDownload();
        };
      }).catch((error) => {
        console.log(`error while creating video: ${error}`);
        stopDownload();
      });
    } else {
      stopDownload();
    }
  }, [isDownloadingVideo]);

  const startDownloadAnimation = () => {
    const frameEndpoint = `/video/${videoIdRef.current}/frame/`;
    if (canIncreaseAnimationTick()) {
      const transition = getTransition(animationDelay()).tween("capture", () => {
        return async (time) => {
          const ordering = currentKeyframeRef.current + 0.95 * time;
          const svgString = document.getElementById("container").getHTML();
          await api.postForm(frameEndpoint, { ordering: ordering, svg: svgString });
        };
      });
      increaseAnimationTick(transition);
      timeoutRef.current = setTimeout(startDownloadAnimation, animationDelay() * 3);
    } else {
      const svgString = document.getElementById("container").getHTML();
      abortControllerRef.current = new AbortController();
      setTimeout(async () => {
        await api.postForm(frameEndpoint, { ordering: currentKeyframeRef.current + 1, svg: svgString }).then(async (_) => {
          const framerate = 36; // measured experimentally
          await api.get(`/video/${videoIdRef.current}/generate/?framerate=${framerate}`, { responseType: 'blob', signal: abortControllerRef.current.signal }).then((response) => {
            const fileNameMatch = response.headers["content-disposition"].match(/filename="(.+)"/);
            let fileName = "video.webm";
            if (fileNameMatch.length === 2) { fileName = fileNameMatch[1] };
            // workaround to download files with axios
            const link = document.createElement("a");
            const href = URL.createObjectURL(response.data);
            link.href = href;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(href);
            //
            stopDownload();
          });
        });
      }, 1000); // timeout to wait a bit for the other frames
    }
  };

  const stopDownload = () => {
    clearTimeout(timeoutRef.current);
    setIsPlaying(false);
    setIsDownloadingVideo(false);
    setDownloadTimeLeft(null);
    videoIdRef.current = null;
    if (abortControllerRef.current !== null) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    };
  }

  const startTimeLeft = () => {
    const keyframeCount = keyframesRef.current.length
    const chartPlayingTime = Math.ceil(keyframeCount / speed);
    // this is proportional to the amount of images generated;
    const videoCompilationTime = keyframeCount;
    // sum chart playing and video compilation
    setDownloadTimeLeft(4 * chartPlayingTime + videoCompilationTime);
    setTimeout(decreaseTimeLeft, 1000);
  }

  const decreaseTimeLeft = () => {
    setDownloadTimeLeft(t => {
      if (t >= 1) {
        setTimeout(decreaseTimeLeft, 1000);
        return t - 1;
      } else {
        return null;
      }
    });
  }

  const TimeLeftAlert = () =>{
    if (downloadTimeLeft !== null && downloadTimeLeft >= 0) {
      return (
        <Alert><span className="font-medium">Your video is being compiled, please wait {downloadTimeLeft} seconds...</span></Alert>
      )
    }
  }

  return (
    <div id="parent-container" className="relative p-4">
      <TimeLeftAlert/>
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
    </div>
  );
};

export default BarChartRace;
