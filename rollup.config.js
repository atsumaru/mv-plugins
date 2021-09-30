import typescript from "rollup-plugin-typescript2";

const glob = require("glob");

const banner = (fileName) => `//=============================================================================
// ${fileName}
//
// Copyright (c) 2018-${new Date().getFullYear()} ゲームアツマール開発チーム(https://game.nicovideo.jp/atsumaru)
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================
`;

const files = glob.sync("./src/*.ts").map(file => {
    return {
        input: file,
        output: file.replace("./src", "./plugins").replace(".ts", ".js"),
        banner: banner(file.replace("./src/", "").replace(".ts", ".js"))
    };
});

export default files.map(file => {
    return {
        input: file.input,
        output: {
            file: file.output,
            format: "iife",
            banner: file.banner
        },
        plugins: [
            typescript()
        ]
    };
});
