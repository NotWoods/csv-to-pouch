import parse from 'csv-parse';
import transform from 'stream-transform';
import batch from 'stream-batch';
import createPouchStream from './createPouchStream';
import { finished } from 'promise-stream-utils';

/**
 * @param {PouchDB} db
 * @param {stream.Readable} input
 * @param {function} [transformer]
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
