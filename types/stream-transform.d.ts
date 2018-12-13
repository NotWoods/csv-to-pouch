/// <reference types="node" />

import * as stream from "stream";

export = transform;

interface TransformOptions {
    parallel?: number;
    consume?: boolean;
    params?: any;
}

declare function transform<Input, Output>(
    handler: (data: Input) => Output,
    options?: TransformOptions
): NodeJS.WritableStream;
