// Referenced from https://observablehq.com/@d3/bar-chart-race

import * as d3 from "d3";


// Constants
export const margin = { top: 32, right: 16, bottom: 32, left: 0 }; // Added padding/margin
export const n = 12;
export const max_rank = n;
export const barSize = 48;
export let color;

// Variables
let updateBars, updateAxis, updateLabels, updateTicker, x;
let dateFormatter;

// Function to initialize the chart
export const initializeChart = (svgRef, dataset, width, title, colorPaletteArray, timeUnit) => {
  const chartMargin = 30; // Adjust this value to increase the space

   // Create SVG element
  svgRef.current = d3
    .select("#container")
    .append("svg")
    .attr("viewBox", [0, -chartMargin, width, margin.top + barSize * n + margin.bottom + chartMargin]);

  // Add a title to the SVG
  svgRef.current.append("text")
    .attr("x", width / 2)  // Center horizontally
    .attr("y", -11)  // Adjust this value to move the title up
    .attr("text-anchor", "middle")  // Center the text
    .attr("font-size", "24px")
    .attr("font-weight", "bold")
    .text(title || "");

  const keyframes = dataset.keyframes;

  // Create scales and axes
  const nameframes = d3.groups(
    keyframes.flatMap(([, data]) => data),
    (d) => d.name
  );

  const prev = new Map(
    nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a]))
  );  

  const next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)));
  x = d3.scaleLinear([0, 1], [margin.left, width - margin.right]);
  const y = d3
        .scaleBand()
        .domain(d3.range(max_rank + 2))
        .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
        .padding(0.1);

  const scale = d3.scaleOrdinal(colorPaletteArray);
  if (dataset.elements.some((e) => e.category !== undefined)) {
    const categoryByName = new Map(dataset.elements.map((e) => [e.name, e.category]));
    scale.domain(categoryByName.values());
    color = (x) => scale(categoryByName.get(x.name));
  } else {
    color = (x) => scale(x.name);
  }

  // define date format
  let dateFormat = { year: "numeric" };

  if (timeUnit === "day") {
    dateFormat = { year: "numeric", month: "numeric", day: "numeric" };
  } else if (timeUnit === "month") {
    dateFormat = { year: "numeric", month: "long" };
  };

  // undefined uses the browser's default locale
  dateFormatter = Intl.DateTimeFormat(undefined, dateFormat);

  // Initialize update functions
  updateBars = bars(svgRef.current, x, y, prev, next);
  updateAxis = axis(svgRef.current, x, y, width);
  updateLabels = labels(svgRef.current, x, y, prev, next);
  updateTicker = ticker(svgRef.current, width, keyframes);

  return keyframes;
}

// Function to update the chart
export const updateChart = (keyframe, transition) => {

  // Update based on keyframe
  x.domain([0, keyframe[1][0].value]);
  updateAxis(keyframe, transition);
  updateBars(keyframe, transition);
  updateLabels(keyframe, transition);
  updateTicker(keyframe, transition);
};


// Helper functions

// Ticker function
function ticker(svgRef, width, keyframes) {
  const now = svgRef
    .append("text")
    .style("font", `bold ${barSize}px var(--sans-serif)`)
    .style("font-variant-numeric", "tabular-nums")
    .attr("text-anchor", "end")
    .attr("x", width - 6)
    .attr("y", margin.top + barSize * (n - 0.45))
    .attr("dy", "0.32em")
    .text(dateFormatter.format(keyframes[0][0]));

  return ([date], transition) => {
    transition.end().then(() => now.text(dateFormatter.format(date)));
  };  
}

function cap_at_max_rank(rank) {
  return Math.min(rank, max_rank);
}

// Labels function
function labels(svgRef, x, y, prev, next) {
  let label = svgRef
    .append("g")
    .style("font", "bold 12px var(--sans-serif)")
    .style("font-variant-numeric", "tabular-nums")
    .attr("text-anchor", "end")
    .selectAll("text");

  return ([, data], transition) =>
    (label = label
      .data(data.slice(0, n), (d) => d.name)
      .join(
        (enter) =>
          enter
            .append("text")
            .attr(
              "transform",
              (d) =>
                `translate(${x((prev.get(d) || d).value)},${y(
                  cap_at_max_rank((prev.get(d) || d).rank)
                )})`
            )
            .attr("y", y.bandwidth() / 2)
            .attr("x", -6)
            .attr("dy", "-0.25em")
            .text((d) => d.name)
            .call((text) =>
              text
                .append("tspan")
                .attr("fill-opacity", 0.7)
                .attr("font-weight", "normal")
                .attr("x", -6)
                .attr("dy", "1.15em")
                .text((d) => d.value)
            ),
        (update) => update,
        (exit) =>
          exit
            .transition(transition)
            .remove()
            .attr(
              "transform",
              (d) =>
                `translate(${x((next.get(d) || d).value)},${y(
                  cap_at_max_rank((next.get(d) || d).rank)
                )})`
            )
            .call((g) =>
              g
                .select("tspan")
                .tween("text", (d) =>
                  textTween(d.value, (next.get(d) || d).value)
                )
            )
      )
      .call((bar) =>
        bar
          .transition(transition)
          .attr("transform", (d) => `translate(${x(d.value)},${y(cap_at_max_rank(d.rank))})`)
          .call((g) =>
            g
              .select("tspan")
              .tween("text", (d) =>
                textTween((prev.get(d) || d).value, d.value)
              )
          )
      ));
}

// Text tween for smooth transition
function textTween(a, b) {
  const i = d3.interpolateNumber(a, b);
  const formatNumber = d3.format(",d");

  return function (t) {
    this.textContent = formatNumber(i(t));
  };
}

// Axis function
function axis(svgRef, x, y, width) {
  const g = svgRef
    .append("g")
    .attr("transform", `translate(0,${margin.top})`);

  const tickFormat = undefined;
  const axis = d3
    .axisTop(x)
    .ticks(width / 160, tickFormat)
    .tickSizeOuter(0)
    .tickSizeInner(-barSize * (n + y.padding()));

  return (_, transition) => {
    g.transition(transition).call(axis);
    g.select(".tick:first-of-type text").remove();
    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
    g.select(".domain").remove();
  };
}

// Bars function
function bars(svgRef, x, y, prev, next) {
  let bar = svgRef
    .append("g")
    .attr("fill-opacity", 0.6)
    .selectAll("rect");

  return ([, data], transition) =>
    (bar = bar
      .data(data.slice(0, max_rank), (d) => d.name)
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("fill", color)
            .attr("height", y.bandwidth())
            .attr("x", x(0))
            .attr("y", (d) => y(cap_at_max_rank((prev.get(d) || d).rank)))
            .attr("width", (d) => x((prev.get(d) || d).value) - x(0)),
        (update) => update,
        (exit) =>
          exit
            .transition(transition)
            .remove()
            .attr("y", (d) => y(cap_at_max_rank((next.get(d) || d).rank)))
            .attr("width", (d) => x((next.get(d) || d).value) - x(0))
      )
      .call((bar) =>
        bar
          .transition(transition)
          .attr("y", (d) => y(cap_at_max_rank(d.rank)))
          .attr("width", (d) => x(d.value) - x(0))
      ));
}
