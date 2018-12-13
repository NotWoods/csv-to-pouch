import { Plugin } from "rollup";

export default function nodeResolve(options?: {
    module?: boolean;
    jsnext?: boolean;
    main?: boolean;
    browser?: boolean;
    extensions?: ReadonlyArray<string>;
    preferBuiltins?: boolean;
    jail?: string;
    only?: ReadonlyArray<string>;
    modulesOnly?: boolean;
    customResolveOptions?: { moduleDirectory?: string };
}): Plugin;
