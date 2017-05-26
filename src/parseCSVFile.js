import parse from 'csv-parse';
import transform from 'stream-transform';
import batch from 'stream-batch';
import createPouchStream from './createPouchStream';

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
function parseCSVFile(db, input, transformer = doc => doc) {
	return new Promise((resolve, reject) => {
		const csvParser = parse({
			columns: true,
			ltrim: true, rtrim: true,
			skip_empty_lines: true,
		});
		const _transformer = transform(transformer);
		const batcher = batch({ maxWait: 100, maxItems: 50 });
		const dbStream = createPouchStream(db);

		function rejectAndClear(err) {
			reject(err);
			csvParser.removeListener('error', rejectAndClear);
			_transformer.removeListener('error', rejectAndClear);
			batcher.removeListener('error', rejectAndClear);
			dbStream.removeListener('error', rejectAndClear);
		}

		csvParser.on('error', rejectAndClear);
		_transformer.on('error', rejectAndClear);
		batcher.on('error', rejectAndClear);
		dbStream.on('error', rejectAndClear);

		const parsingStream = input
			.pipe(csvParser)
			.pipe(_transformer)
			.pipe(batcher)
			.pipe(dbStream)
			.once('finish', resolve);
	});
}

export default parseCSVFile;
export { parseCSVFile };
