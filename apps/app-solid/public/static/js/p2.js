/*
 * Copyright 2025 Grzegorz Grzybek
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

document.addEventListener("DOMContentLoaded", () => {
  console.info("2. Dirty Checking")

  function tt() {
    console.info(arguments)
  }
  let name = "Grzegorz", day = "Tuesday";
  tt`Hello ${name}, How are you? Today is ${day}.`

  // framework

  class Framework {
    state = {};
    constructor(initState) {
      this.state = initState;
      document.getElementById("app").append(this.template());
    }
    template()/*: Node*/ {
      throw new Error("must be implemented");
    }
    setState(newState) {
      this.state = newState;
      this.template();
    }
  }

  // type Binding = { type: string; ref: Node; value: any };
  const cache = new Map/*<TemplateStringsArray, { node: Node; bindings: Binding[]; }>*/();

  function html(template/*: TemplateStringsArray*/, ...holes/*: any[]*/) {
    let prev;
    if (!(prev = cache.get(template))) {
      // create the first time
      // https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template
      const t = document.createElement("template");
      // when set to innerHTML, "<!>" is sanitized to "<!---->". "<!x>" would be sanitized to "<!--x-->"
      t.innerHTML = template.join("<!>");
      cache.set(
          template,
          (prev = { node: t.content.firstChild, bindings: createBindings(t.content.firstChild), }),
      );
      document.querySelector("body").appendChild(t)
    }
    // diff holes
    diff(holes, prev.bindings);
    return prev.node;
  }

  function createBindings(element/*: Node*/) {
    const bindings = [];
    let tw = document.createTreeWalker(element, NodeFilter.SHOW_COMMENT, null), comment;
    while ((comment = tw.nextNode())) {
      bindings.push({ type: "insert", ref: comment, value: undefined });
    }
    return bindings;
  }

  function diff(holes/*: any[]*/, bindings/*: Binding[]*/) {
    for (let i = 0; i < holes.length; i++) {
      const binding = bindings[i];
      if (holes[i] !== binding.value) {
        if (binding.type === "insert") {
          if (binding.value == null) {
            binding.ref.parentNode.insertBefore(
                document.createTextNode(holes[i]),
                binding.ref
            );
          } else binding.ref.previousSibling.nodeValue = holes[i];
        }
        // other cases;
        binding.value = holes[i];
      }
    }
  }

  // import { html, Framework } from "./framework"

  class App extends Framework {
    constructor() {
      super({ count: 0 });
      setInterval(() => this.setState({ count: this.state.count + 1 }), 1000);
    }
    template() {
      // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
      return html`<div>${this.state.count}</div>`;
    }
  }

  new App();
})
