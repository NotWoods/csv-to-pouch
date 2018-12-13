/// <reference types="node" />

import * as stream from "stream";

export = batch;

declare function batch(opts?: {
    maxWait?: number;
    maxTime?: number;
    maxItems?: number;
}): stream.Transform;
