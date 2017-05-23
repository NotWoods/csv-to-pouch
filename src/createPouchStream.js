import { PromiseWritable } from 'promise-stream-utils';

/**
 * Creates a Writable stream that saves data into a PouchDB database.
 * @param {PouchDB.Database} db - database to save to
 * @param {object} [pouchOpts] - options passed to PouchDB's put or bulkDocs
 * function
 * @returns {stream.Writable}
 */
export default function createPouchStream(db, pouchOpts) {
	return new PromiseWritable({
		objectMode: true,
		decodeStrings: false,
		async write(chunk) {
			// Data should be in object format. Convert buffers and strings
			// by parsing the JSON they should represent
			let data = chunk;
			if (Buffer.isBuffer(data)) data = data.toString();
			if (typeof data === 'string') data = JSON.parse(data);

			if (Array.isArray(data)) {
				// Find all objects in the array without a `_rev` field
				const noRevs = data
					.filter(doc => !doc._rev)
					.reduce((map, doc) => map.set(doc._id, doc), new Map());

				if (noRevs.size > 0) {
					// If there are objects without a `_rev` key,
					// check if they already exist in the database.
					// If so, add the existing rev property to the doc.
					const existing = await db.allDocs({ keys: [...noRevs.keys()] });
					existing.rows
						.filter(row => !row.error)
						.forEach((row) => { noRevs.get(row.id)._rev = row.value.rev; });
				}

				// Save the results in the database
				return db.bulkDocs(data, pouchOpts);
			} else {
				if (!data._rev) {
					try {
						// If there is no `_rev` key, check if the doc already exists
						const doc = await db.get(data._id, { latest: true });
						// Save the rev from the database onto the object if the doc exists
						data._rev = doc._rev;
					} catch (err) {
						// If the doc doesn't already exist, just keep going
						if (err.status !== 404) throw err;
					}
				}
				return db.put(data, pouchOpts);
			}
		}
	});
}
