// https://webpack.js.org/concepts/module-federation/#uncaught-error-shared-module-is-not-available-for-eager-consumption
// says that with module-federation it's worth to put "an asynchronous boundary" by switching to import("./bootstrap")
// import "./bootstrap"
import("./bootstrap")
