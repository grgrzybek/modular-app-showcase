import * as d3 from "d3"

// https://d3js.org/d3-selection/selecting

let c = document.getElementById("console")
function debug(msg: string) {
  c.appendChild(document.createElement("span")).innerHTML = `${msg}\n`
}

let app = document.getElementById("app")

// returns new Selection([[document.documentElement]], [root == null])
console.info(d3.selection())

// https://d3js.org/d3-selection/selecting#selecting-elements
// By convention, selection methods that return the current selection such as selection.attr use four spaces of indent,
// while methods that return a new selection use only two.
// d3.select() is also obvious:
// return typeof selector === "string"
//     ? new Selection([[document.querySelector(selector)]], [document.documentElement])
//     : new Selection([[selector]], root);
// d3.select(app)
const svg = d3.select("#app")
  .append("div")
    .attr("id", "p")
  .append("svg")
    .attr("width", 800).attr("height", 600)

svg.append("rect")
  .attr("width", 600).attr("height", 500).attr("fill", "#ffffde").attr("stroke", "gray").attr("stroke-width", "3px")
  .style("translate", "3px 3px")

const t = d3.transition().duration(2000)
const graph = svg.selectAll("circle")
graph.data([10, 30, 20])
  .enter()
  .append("circle")
    .call(c => c.transition(t)
    // .transition()
    // .style("transition", "r 0.3s")
    .attr("r", d => d)).attr("cy", 50).attr("cx", (d, i) => (i + 1) * 200).attr("fill", "blue")

setTimeout(() => {
  console.info("Removing data")
  svg.selectAll("circle")
    .data([40, 20])
    // The selections returned by the enter and update functions are merged and then returned by selection.join.
    // https://observablehq.com/@d3/selection-join - shows examples about transition
    .join(
        enter => enter.append("circle"),
        update => update,
        exit => exit.call(e => e.transition().duration(1500).attr("r", 0).remove())
    ).call(e => e.transition().duration(2000).attr("r", d => d).attr("cy", 50).attr("cx", (d, i) => (i + 1) * 200).attr("fill", "blue"))
}, 3000)

// Selection.prototype is altered in d3-selection/src/selection/index.js:
// Selection.prototype = selection.prototype = {
//   constructor: Selection,
//   select: selection_select,
//   selectAll: selection_selectAll,
//   ...
//   [Symbol.iterator]: selection_iterator
// };
