/* eslint-disable react/prop-types */
import { useRef, useState, useEffect, useContext } from "react";
import { Alert } from "flowbite-react";
import { initializeChart, updateChart } from "./barChartRaceUtils";
import * as d3 from "d3";
import "./barChartRace.css";
import 'font-awesome/css/font-awesome.min.css';
import api from '../../../api/axios';
import { LanguageContext } from "../../../context/LanguageContext";

/**
 * BarChartRace component visualizes a bar chart race with play/pause and selection controls.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the chart
 * @param {number} props.speed - Speed of the chart
 * @param {string} props.colorPalette - List of colors for the chart
 * @param {Array} props.barRaceData - Data for the bar chart race
 */
const BarChartRace = ({ title, speed, colorPalette, timeUnit, barRaceData, isDownloadingVideo, setIsDownloadingVideo }) => {
  const DEFAULT_TRANSITION_DELAY = 250;
  const DOWNLOAD_WAIT_MULTIPLIER = 4;
  const svgRef = useRef(null); // Reference to the SVG element
  const currentKeyframeRef = useRef(0); // Tracks the current keyframe
  const [isPlaying, setIsPlaying] = useState(false); // Play/pause state
  const [progressBarTick, setProgressBarTick] = useState(0);
  const [progressBarMaxTick, setProgressBarMaxTick] = useState(0);
  const [dataset, setDataset] = useState(null); // Processed data
  const [currentKeyframeState, setCurrentKeyFrameState] = useState(0); // Current keyframe state
  const [downloadPercentage, setDownloadPercentage] = useState(null);
  const keyframesRef = useRef([]); // Stores all keyframes
  const timeoutRef = useRef(null); // Handles animation timing
  const abortControllerRef = useRef(null);
  const videoIdRef = useRef(null);
  const { locale } = useContext(LanguageContext);

  useEffect(() => {
    const fetchDataAsync = () => {
      if (barRaceData) {
        var data_to_use = barRaceData.values_by_date;
        if (timeUnit === "day") {
          data_to_use = barRaceData.values_by_date_daily;
        } else if (timeUnit === "month") {
          data_to_use = barRaceData.values_by_date_monthly;
        };
        var keyframes = data_to_use.map(d => [new Date(d.date), d.values]);

        const dataset = {
          "elements": barRaceData.elements,
          "keyframes": keyframes
        };
        setDataset(dataset);
        setProgressBarMaxTick(keyframes.length - 1);
      }
    };
    fetchDataAsync();
  }, [barRaceData, timeUnit]);

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
      const keyframes = initializeChart(svgRef, dataset, width, title, colorPaletteArray, timeUnit, locale);
      keyframesRef.current = keyframes;

      // Initialize chart with the first keyframe.
      clearTimeout(timeoutRef.current);
      setProgressBarTick(0);
      currentKeyframeRef.current = 0;
      updateChart(keyframes[0], svgRef.current.transition().duration(0));
      setIsDownloadingVideo(false);
    }
    const currentSvg = svgRef.current;
    // Cleanup function to remove SVG on component unmount or before re-render
    return () => {
      if (currentSvg) {
        currentSvg.remove();
      }
    };

  }, [dataset, timeUnit, title, colorPalette, locale]);

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

      updateChart(keyframe, transition);
      setCurrentKeyFrameState(keyframe);

      // Sync range input with keyframe
      setProgressBarTick(currentKeyframeRef.current);
      currentKeyframeRef.current += 1;
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
      updateChart(currentKeyframeState, transition);
    } else {
      startAnimation();
    }
    
    if (!(progressBarTick >= progressBarMaxTick)) {
      setIsPlaying(!isPlaying);
    }
  };

  const onRangeChange = (event) => {
    const selectedTick = parseInt(event.target.value, 10);
    setAnimationToTick(selectedTick);
  };

  const setAnimationToTick = (tick) => {
    const frameIndex = tick;
    if (frameIndex !== -1) {
      clearTimeout(timeoutRef.current);
      setIsPlaying(false);
      setProgressBarTick(tick);
      const transition = getTransition(DEFAULT_TRANSITION_DELAY);
      currentKeyframeRef.current = frameIndex; // Set current keyframe
      updateChart(keyframesRef.current[frameIndex], transition);
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
          setAnimationToTick(0);
          setDownloadPercentage(0);
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
    const framerate = 36; // measured experimentally
    // each keyframe will generate around (framerate / speed) frames
    // 36 requests at once on Toolforge is taking up to 2 seconds
    // since animationDelay is 1 second / speed, we can multiply it by DOWNLOAD_WAIT_MULTIPLIER
    // to be safe when waiting.
    if (canIncreaseAnimationTick()) {
      const transition = getTransition(animationDelay()).tween("capture", () => {
        return async (time) => {
          const ordering = currentKeyframeRef.current + 0.95 * time;
          const svgString = document.getElementById("container").getHTML();
          await api.postForm(frameEndpoint, { ordering: ordering, svg: svgString });
        };
      });
      increaseAnimationTick(transition);
      updateDownloadPercentage();
      timeoutRef.current = setTimeout(startDownloadAnimation, DOWNLOAD_WAIT_MULTIPLIER * animationDelay());
    } else {
      const svgString = document.getElementById("container").getHTML();
      abortControllerRef.current = new AbortController();
      setTimeout(async () => {
        await api.postForm(frameEndpoint, { ordering: currentKeyframeRef.current + 1, svg: svgString }).then(async (_) => {
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
    setDownloadPercentage(null);
    videoIdRef.current = null;
    if (abortControllerRef.current !== null) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    };
  }

  const updateDownloadPercentage = () => {
    // so that the last 1% is compiling the frames
    setDownloadPercentage(99 * currentKeyframeRef.current / keyframesRef.current.length);
  };

  const DownloadingAlert = () =>{
    if (downloadPercentage !== null && downloadPercentage >= 0) {
      return (
        <Alert><span className="font-medium">Your video is being compiled ({Math.round(downloadPercentage)}%)...</span></Alert>
      )
    }
  }

  return (
    <div id="parent-container" className="relative p-4">
      <DownloadingAlert/>
      <div id="play-controls" className="flex items-center">
        <button
          id="play-pause-button"
          className={`bg-cyan-700 hover:bg-cyan-800 dark:bg-cyan-600 dark:hover:bg-cyan-800 fa ${isPlaying ? "fa-pause" : "fa-play"}`}
          title="play"
          onClick={playPause}
        ></button>
        <input
          id="play-range"
          type="range"
          min="0"
          value={progressBarTick}
          max={progressBarMaxTick}
          className="ml-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          onChange={onRangeChange}
        />
      </div>
      <div id="container"></div>
    </div>
  );
};

export default BarChartRace;
