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
  console.info("4. Fine-Grained")

  // framework

  // type Observer = () => void;

  let Observer/*: Observer | null*/ = null;

  function createSignal/*<T>*/(value/*: T*/)/*: [() => T, (v: T) => void]*/ {
    const observers = new Set/*<Observer>*/();
    return [
      () => {
        if (Observer) {
          observers.add(Observer);
        }
        return value;
      },
      (v/*: T*/) => {
        value = v;
        for (let o of observers) {
          o();
        }
      },
    ];
  }

  function createEffect(fn/*: () => void*/) {
    function compute() {
      try {
        Observer = compute;
        fn();
      } finally {
        Observer = null;
      }
    }
    return compute();
  }

  // import { createSignal, createEffect } from "./framework"

  function App() {
    const [count, setCount] = createSignal(0);
    setInterval(() => setCount(count() + 1), 1000);

    const el = document.createElement("div");
    createEffect(() => {
      el.textContent = String(count());
    });
    return el;
  }

  document.getElementById("app").append(App());
})
