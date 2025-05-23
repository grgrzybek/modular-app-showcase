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

// My impression is that ordering the CSS imports here will lead to proper ordering of whatever webpack and its
// loaders are doing.
// However by default dynamic <style> elements are inserted into <head> and I found rules from "./index.css"
// to be somewhere in the middle of Patternfly CSS - --pf-v5-global--FontSize--md was take from my CSS, but
// --pf-v5-c-background-image--BackgroundSize--width was take from Patternfly
//
// even https://github.com/webpack-contrib/style-loader?tab=readme-ov-file#recommend
// says that style-loader is only for development (even with the ordering problems?)
// this is suggested in webpack.config.js:
// use: [
//   devMode ? "style-loader" : MiniCssExtractPlugin.loader,
//   "css-loader"
// ],

import "@patternfly/react-core/dist/styles/base.css"
import "@showcase/hawtio-react/styles"
import "./index.css"

import(/* webpackChunkName: "bootstrap" */"./bootstrap")
