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
  console.info("3. Virtual DOM")

  // framework

  // type VNode = {
  //   type: string;
  //   attrs?: Record<string, string>;
  //   children?: VNode[];
  //   value?: string;
  //   _el?: Node;
  // };

  class Framework {
    state = {};
    _node;

    constructor(initState/*: Record<string, any>*/) {
      this.state = initState;
      this._diff(this.template());
    }
    template()/*: VNode*/ {
      throw new Error("must be implemented");
    }
    setState(newState/*: Record<string, any>*/) {
      this.state = newState;
      this._diff(this.template());
    }
    _diff(newNode/*: VNode*/) {
      diff(this._node, newNode, document.getElementById("app"));
      this._node = newNode;
    }
  }

  function h(...args) {
    let node/*: VNode | null*/ = null;
    function item(value) {
      if (value == null) {
      } else if ("string" === typeof value) {
        if (!node) {
          node = { type: value, attrs: {}, children: [] };
        } else {
          node.children.push({ type: "#text", value });
        }
      } else if ("number" === typeof value || "boolean" === typeof value || value instanceof Date) {
        node.children.push({ type: "#text", value: value.toString() });
      } else if (Array.isArray(value)) {
        value.forEach(item);
      } else if ("object" === typeof value) {
        if (value.type) {
          node.children.push(value);
        } else {
          // attributes
          for (let k in value) {
            node.attrs[k] = value[k];
          }
        }
      }
    }

    while (args.length) {
      item(args.shift())
    }

    return node;
  }

  function diff(node/*: VNode | undefined*/, newNode/*: VNode*/, root/*: Node*/) {
    let element;
    // diff element
    if (!node || node.type !== newNode.type) {
      if (node && node._el) {
        (node._el/* as Element*/).remove();
      }
      element = newNode.type === "#text" ? document.createTextNode(newNode.value) : document.createElement(newNode.type);
      (root/* as Element*/).append(element);
    } else {
      element = node._el;
    }
    newNode._el = element;
    if (newNode.type === "#text") {
      element.textContent = newNode.value;
      return;
    }

    // diff attributes
    for (let k in newNode.attrs) {
      if (node?.attrs[k] !== newNode.attrs[k]) {
        (element/* as Element*/).setAttribute(k, newNode.attrs[k]);
      }
    }
    // diff children
    if (newNode.children) {
      for (let i = 0; i < newNode.children.length; i++) {
        diff(node?.children?.[i], newNode.children[i], element);
      }
    }
  }

  // import { h, Framework } from "./framework"

  class App extends Framework {
    constructor() {
      super({ count: 0 });
      setInterval(() => this.setState({ count: this.state.count + 1 }), 1000);
    }
    template() {
      return h("div", this.state.count);
    }
  }

  new App();
})
