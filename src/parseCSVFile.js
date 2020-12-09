// @ts-check
import parse from "csv-parse";
import transform from "stream-transform";
import batch from "stream-batch";
import { finished } from "promise-stream-utils";
import createPouchStream from "./createPouchStream";

/**
 * Parse CSV data from the input stream and save it to the PouchDB database.
 * Each row is saved as a separate PouchDB document. If the `_id` preexists in
 * the database, the existing document will be updated with the new version
 * and the revision version will change.
 * @template T
 * @param {PouchDB.Database<T>} db Database to save results to.
 * @param {NodeJS.ReadableStream} input Stream representing the CSV file,
 * such as `fs.createReadableStream('data.csv')`
 * @param {(row: any) => T} [transformer] Optional function to transform CSV rows.
 * Input `row` represents the CSV data, and the returned object will be used as
 * a PouchDB document.
 * @returns {Promise<void>} resolves when db has been written to
 */
function parseCSVFile(db, input, transformer = (doc) => doc) {
    const csvParser = parse({
        columns: true,
        ltrim: true,
        rtrim: true,
        skip_empty_lines: true,
        relax_column_count: true,
    });
    const _transformer = transform(transformer);
    const batcher = batch({ maxWait: 100, maxItems: 50 });
    const dbStream = createPouchStream(db);

    const parsingStream = input
        .pipe(csvParser)
        .pipe(_transformer)
        .pipe(batcher)
        .pipe(dbStream);

    return finished(parsingStream);
}

export default parseCSVFile;
export { parseCSVFile };
