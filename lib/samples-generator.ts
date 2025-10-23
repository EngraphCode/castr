import fg from "fast-glob";

import degit from "degit";
import { unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";

const emitter = degit("https://github.com/OAI/OpenAPI-Specification/examples", {
    cache: true,
    force: true,
    verbose: true,
});

emitter.on("info", (info) => {
    console.log(info.message);
});

emitter.clone("./samples").then(() => {
    console.log("done cloning samples");

    spawnSync("rm -rf ./samples/v2.0", { shell: true });
    console.log("removed v2.0 swagger samples");

    const jsonList = fg.sync([String.raw`./samples/v3\.*/**/*.json`]);
    jsonList.forEach((jsonPath) => unlinkSync(jsonPath));
});
