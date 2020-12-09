// @ts-check
import { builtinModules } from "module";
import nodeResolve from "@rollup/plugin-node-resolve";

const { dependencies } = require("./package.json");

/** @type {import("rollup").RollupWatchOptions} */
const config = {
    input: "src/parseCSVFile.js",
    output: [
        { file: "index.js", format: "cjs", sourcemap: true, exports: "named" },
        { file: "index.es.js", format: "es", sourcemap: true },
    ],
    external: [...Object.keys(dependencies), ...builtinModules],
    plugins: [nodeResolve()],
};

export default config;
