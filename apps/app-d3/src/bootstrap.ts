import * as d3 from "d3"

// no need for this when using Webpack
document.addEventListener("DOMContentLoaded", () => {
  // ...
})

let c = document.getElementById("console")
function debug(msg: string) {
  c.appendChild(document.createElement("span")).innerHTML = `${msg}\n`
}
function debugRow(table: HTMLTableElement, ...msg: string[]) {
  const tr = table.appendChild(document.createElement("tr"))
  for (const m of msg) {
    tr.appendChild(document.createElement("td")).innerHTML = `${m}`
  }
}

debug(`Origin: ${performance.timeOrigin}`)
debug(`performance.now(): ${performance.now()}`)
debug(`d3.now(): ${d3.now()}`)
// document.timeline expresses the time in milliseconds since Performance.timeOrigin
debug(`document.timeline.currentTime: ${document.timeline.currentTime}`)

let app = document.getElementById("app")
let div = app.appendChild(document.createElement("div"))
div.innerHTML = `<span id="s1">${d3.now()}</span>`

const s1 = document.getElementById("s1")

// https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame

// the highest precision available is the duration of a single frame, 16.67ms @60hz
// that's why probably d3-timer uses setTimeout(f, 17) as fallback for the setFrame function

let zero1: DOMHighResTimeStamp
let zero2: number = document.timeline.currentTime as number
let zero3: DOMHighResTimeStamp = performance.now() // d3.now()

function firstStep(ts: DOMHighResTimeStamp) {
  zero1 = ts
  requestAnimationFrame(step)
}

let previous1 = 0
let previous2 = zero2
let previous3 = zero3

const table = c.appendChild(document.createElement("table"))

function step(ts: DOMHighResTimeStamp) {
  // The callback's timestamp argument represents the end of the previous frame,
  // so the soonest your newly calculated value(s) will be rendered is in the next frame.
  const now1 = ts
  const now2 = document.timeline.currentTime as number // should be the same as "ts"
  const now3 = performance.now() // d3.now()
  const d1 = now1 - previous1
  const d2 = now2 - previous2
  const d3 = now3 - previous3
  debugRow(table, `${now1}`, `${d1}`, `${now2}`, `${d2}`, `${now3}`, `${d3}`)

  previous1 = now1
  previous2 = now2
  previous3 = now3

  s1.innerHTML = `${now1}`
  const elapsed = ts - zero1
  console.info("grgr", "elapsed =", elapsed)
  const shift = Math.min(0.1 * elapsed, 200)
  div.style.transform = `translateX(${shift}px)`
  if (shift < 200) {
    requestAnimationFrame(step)
  }
}

// requestAnimationFrame(firstStep)

// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transforms/Using_CSS_transforms
// 3 transformations: transform = translate + rotate + scale
// two properties:
//  - transform: transforms applied from right to left
//  - transform-origin: position of the origin for the transformation (defaults to center)

const d1 = document.createElement("div")
d1.innerHTML = "d1"
d1.className = "d1"
const d2 = document.createElement("div")
d2.innerHTML = "d2"
d2.className = "d2"

app.appendChild(d1)
app.appendChild(d2)

let t
let printed = false
d1.addEventListener("transitionstart", ev => {
  debug(`transitionstart of d1 ${ev.propertyName}`)
  t = setInterval(() => {
    if (t) {
      d1.innerHTML = `${d1.getAnimations().length}`
      if (!printed && d1.getAnimations().length > 0) {
        console.log(d1.getAnimations()[0])
        // prints something like:
        //   currentTime: null
        //   effect: KeyframeEffect { target: div.d1
        //   , iterationComposite: "replace", composite: "replace", … }
        //   finished: Promise { <state>: "pending" }
        //   id: ""
        //   oncancel: null
        //   onfinish: null
        //   onremove: null
        //   pending: false
        //   playState: "idle"
        //   playbackRate: 1
        //   ready: Promise { <state>: "fulfilled", <value>: CSSTransition }
        //   replaceState: "active"
        //   startTime: null
        //   timeline: DocumentTimeline { currentTime: 3585.84 }
        //   transitionProperty: "transform"
        //   <prototype>: CSSTransitionPrototype { transitionProperty: Getter, … }
        printed = true
      }
    }
  }, 10)
})
d1.addEventListener("transitionend", ev => {
  debug(`transitionend of d1 ${ev.propertyName}`)
  clearInterval(t)
  t = undefined
  d1.innerHTML = `d1: ${d3.now()}`
})

// function sleep(time?) {
//   console.info("grgr", time)
// }
// sleep()

// const timer = d3.timer(elapsed => {
//   debug(`elapsed:${elapsed}`)
//   if (elapsed >= 200) {
//     timer.stop()
//   }
// })
let prev = 0
const timer = d3.interval(elapsed => {
  debug(`elapsed:${elapsed - prev}`)
  prev = elapsed
}, 2000)
setTimeout(() => { timer.stop() }, 10000)

const select = d3.select("div")
console.info(select)
