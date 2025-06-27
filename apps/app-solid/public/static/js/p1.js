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
  console.info("1. DOM Replacement method")

  // framework

  class Framework {
    state = {}
    constructor(initState) {
      this.state = initState;
      this._template();
    }
    template() {
      throw new Error("must be implemented");
    }
    setState(newState) {
      this.state = newState;
      this._template();
    }
    _template() {
      document.getElementById("app").innerHTML = this.template();
    }
  }

  // import { Framework } from "./framework"

  class App extends Framework {
    constructor() {
      super({ count: 0 });
      setInterval(() => this.setState({ count: this.state.count + 1 }), 1000);
    }
    template() {
      return `<div>${this.state.count}</div>`;
    }
  }

  new App();
})
