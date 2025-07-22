import * as d3 from "d3"
import * as webcola from "webcola"
import { type SimulationNodeDatum } from 'd3'

// https://ialab.it.monash.edu/webcola/index.html

let c = document.getElementById("console")

function debug(msg: string) {
  c.appendChild(document.createElement("span")).innerHTML = `${msg}\n`
}

let app = document.getElementById("app")

const svg = d3.select(app)
  .append("div")
    .attr("id", "p")
  .append("svg")
    .attr("width", 800)
    .attr("height", 600)
    .attr('pointer-events',"all")

// see https://d3js.org/d3-force/link#link_id about "id", because SimulationNodeDatum type doesn't include id
// see https://observablehq.com/@d3/force-directed-graph/2
// see https://observablehq.com/@d3/disjoint-force-directed-graph/2
// see https://observablehq.com/@mbostock/hello-cola - this example uses cola.d3adaptor(d3) directly
interface N extends SimulationNodeDatum {
  id: string
}

const nodes: N[] = [
  { id: "a", x: 20, y: 20 },
  { id: "b", x: 60, y: 20 },
  { id: "c", x: 100, y: 20 },
]
const index = new Map(nodes.map(d => [d.id, d]));
const links = [
  { source: "a", target: "b" },
  { source: "a", target: "c" },
].map(l => Object.assign(Object.create(l), {
  source: index.get(l.source),
  target: index.get(l.target),
}))

// https://observablehq.com/@mbostock/hello-cola
const cola = webcola.d3adaptor(d3)

const d3nodes = svg
  .selectAll("circle")
  .data(nodes)
  .join("circle")
    .attr("r", 10)
    .attr("fill", "blue")
  // .call(cola.drag)

const d3links = svg
  .append("g")
    .attr("stroke", "#999")
    .attr("stroke-width", 2)
  .selectAll("line")
  .data(links)
  .join("line")

// const sim = d3.forceSimulation(nodes)
//     .force("mb", d3.forceManyBody())
//     // https://d3js.org/d3-force/link#link_id
//     // see d3-force/src/link.js#initialize()
//     //     nodeById = new Map(nodes.map((d, i) => [id(d, i, nodes), d])),
//     .force("links", d3.forceLink(links).id(d => {
//       return (d as N).id
//     }))
//     .force("f1", d3.forceCenter(400, 300))

const sim = cola
    .nodes(nodes)
    .links(links)
    .size([800, 600])
    // .constraints(graph.constraints)
    .symmetricDiffLinkLengths(5)
    .avoidOverlaps(true)
    .jaccardLinkLengths(150)
    .start(100, 150, 200)

sim.on("tick", () => {
  d3nodes
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
  d3links
      .attr("x1", d => {
        return (d.source as unknown as N).x
      })
      .attr("y1", d => (d.source as unknown as N).y)
      .attr("x2", d => (d.target as unknown as N).x)
      .attr("y2", d => (d.target as unknown as N).y);
})
sim.on("end", () => {
  d3nodes
      .attr("fill", "red")
})
