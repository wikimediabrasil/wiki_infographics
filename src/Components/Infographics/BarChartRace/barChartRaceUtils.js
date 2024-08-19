import * as d3 from "d3";
import data from './barChartData.json';


export const startYear = 1872; // Adjust accordingly
export const endYear = 2022; // Adjust accordingly

export const margin = { top: 32, right: 16, bottom: 32, left: 16 }; // Added padding/margin
export const n = 12;
export const barSize = 48;
export const k = 10;
export const duration = 250;
export let color;

let updateBars;
let updateAxis;
let updateLabels;
let updateTicker;
let x;

export const fetchData = async () => {
  return data;
};

export const initializeChart = (svgRef, dataset, width, title) => {
  const chartMargin = 30; // Adjust this value to increase the space
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

  const keyframes = [];
  
  for (let [[ka, a], [kb, b]] of d3.pairs(getDateValues(dataset))) {
    for (let i = 0; i < k; ++i) {
      const t = i / k;
      keyframes.push([
        new Date(ka * (1 - t) + kb * t),
        rank((name) => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t, dataset),
      ]);
    }
    keyframes.push([new Date(kb), rank((name) => b.get(name) || 0, dataset)]);
  }
  
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
        .domain(d3.range(n + 1))
        .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
        .padding(0.1);

  const scale = d3.scaleOrdinal(d3.schemeTableau10);
  if (dataset.some((d) => d.category !== undefined)) {
    const categoryByName = new Map(dataset.map((d) => [d.name, d.category]));
    scale.domain(categoryByName.values());
    color = (d) => scale(categoryByName.get(d.name));
  } else {
    color = (d) => scale(d.name);
  }

  updateBars = bars(svgRef.current, x, y, prev, next);
  updateAxis = axis(svgRef.current, x, y, width);
  updateLabels = labels(svgRef.current, x, y, prev, next);
  updateTicker = ticker(svgRef.current, width, keyframes);

  return keyframes;
}

export const updateChart = (keyframe, transition, inputRef, increment) => {

  // Update based on keyframe
  x.domain([0, keyframe[1][0].value]);
  updateAxis(keyframe, transition);
  updateBars(keyframe, transition);
  updateLabels(keyframe, transition);
  updateTicker(keyframe, transition);

  // Update range input value if increment is true and within bounds
  if (increment) {
    const newValue = parseInt(inputRef.current.value, 10) + increment;
    if (newValue <= parseInt(inputRef.current.max, 10)) {
      inputRef.current.value = newValue;
    }
  }

};




      
  
      
      
      
      
      
      
  
      // const handleKeyframeAnimate = async() => {
  
      //   for (const keyframe of keyframes) {
      //     const transition = svgRef.current
      //       .transition()
      //       .duration(duration)
      //       .ease(d3.easeLinear);
  
  
      //     // Extract the top bar’s value.
      //     x.domain([0, keyframe[1][0].value]);
      //     console.log(keyframe);
      //     updateAxis(keyframe, transition);
      //     updateBars(keyframe, transition);
      //     updateLabels(keyframe, transition);
      //     updateTicker(keyframe, transition);
      //     // svgRef.interrupt();
      //     await transition.end();
      //   }
      // }





  function ticker(svgRef, width, keyframes) {
    const formatDate = d3.utcFormat("%Y");

    const now = svgRef
      .append("text")
      .style("font", `bold ${barSize}px var(--sans-serif)`)
      .style("font-variant-numeric", "tabular-nums")
      .attr("text-anchor", "end")
      .attr("x", width - 6)
      .attr("y", margin.top + barSize * (n - 0.45))
      .attr("dy", "0.32em")
      .text(formatDate(keyframes[0][0]));

    return ([date], transition) => {
      transition.end().then(() => now.text(formatDate(date)));
    };  
  }


  function labels(svgRef, x, y, prev, next) {
    let label = svgRef
      .append("g")
      .style("font", "bold 12px var(--sans-serif)")
      .style("font-variant-numeric", "tabular-nums")
      .attr("text-anchor", "end")
      .selectAll("text");

    return ([date, data], transition) =>
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
                    (prev.get(d) || d).rank
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
                    (next.get(d) || d).rank
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
            .attr("transform", (d) => `translate(${x(d.value)},${y(d.rank)})`)
            .call((g) =>
              g
                .select("tspan")
                .tween("text", (d) =>
                  textTween((prev.get(d) || d).value, d.value)
                )
            )
        ));
  }


  function textTween(a, b) {
    const i = d3.interpolateNumber(a, b);
    const formatNumber = d3.format(",d");

    return function (t) {
      this.textContent = formatNumber(i(t));
    };
  }


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


  function bars(svgRef, x, y, prev, next) {
    let bar = svgRef
      .append("g")
      .attr("fill-opacity", 0.6)
      .selectAll("rect");

    return ([date, data], transition) =>
      (bar = bar
        .data(data.slice(0, n), (d) => d.name)
        .join(
          (enter) =>
            enter
              .append("rect")
              .attr("fill", color)
              .attr("height", y.bandwidth())
              .attr("x", x(0))
              .attr("y", (d) => y((prev.get(d) || d).rank))
              .attr("width", (d) => x((prev.get(d) || d).value) - x(0)),
          (update) => update,
          (exit) =>
            exit
              .transition(transition)
              .remove()
              .attr("y", (d) => y((next.get(d) || d).rank))
              .attr("width", (d) => x((next.get(d) || d).value) - x(0))
        )
        .call((bar) =>
          bar
            .transition(transition)
            .attr("y", (d) => y(d.rank))
            .attr("width", (d) => x(d.value) - x(0))
        ));
  }
  

  function rank(valueFunc, dataset) {
    const data = Array.from(getNames(dataset), (name) => ({
      name,
      value: valueFunc(name),
    }));
    data.sort((a, b) => d3.descending(a.value, b.value));
    for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
    return data;
  }


  function getNames(dataset) {
    const names = new Set(dataset.map((d) => d.name));
    
    return names;
  }

  function getDateValues(dataset){

    const datevalues = Array.from(

      d3.rollup(
        dataset,
        ([d]) => d.value,
        (d) => +d.date,
        (d) => d.name
      )
    )
    .map(([date, data]) => [new Date(date), data])
    .sort(([a], [b]) => d3.ascending(a, b));

    return datevalues;
  }