import parse from 'csv-parse';
import transform from 'stream-transform';
import batch from 'stream-batch';
import createPouchStream from './createPouchStream';
import { finished } from 'promise-stream-utils';

/**
 * Parse CSV data from the input stream and save it to the PouchDB database.
 * Each row is saved as a seperate PouchDB document. If the `_id` prexists in
 * the database, the existing document will be updated with the new version
 * and the revision version will change.
 * @param {PouchDB.Database} db Database to save results to.
 * @param {stream.Readable} input Stream representing the CSV file,
 * such as `fs.createReadableStream('data.csv')`
 * @param {function} [transformer] Optional function to transform CSV rows.
 * Input `row` represents the CSV data, and the returned object will be used as
 * a PouchDB document.
 * @returns {Promise<void>} resolves when db has been written to
 */
export default async function parseCSVFile(db, input, transformer = doc => doc) {
	const parsingStream = input
		.pipe(parse({
			columns: true,
			ltrim: true,
			rtrim: true,
			skip_empty_lines: true,
		}))
		.pipe(transform(transformer))
		.pipe(batch({
			maxWait: 100,
			maxItems: 50,
		}))
		.pipe(createPouchStream(db));

	await finished(parsingStream);
}
