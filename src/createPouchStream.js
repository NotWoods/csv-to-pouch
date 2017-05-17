import { PromiseWritable } from 'promise-stream-utils';

/**
 * Creates a Writable stream that saves data into a PouchDB database.
 * @param {PouchDB} db
 * @param {Object} [pouchOpts]
 * @returns {stream.Writable}
 */
export default function createPouchStream(db, pouchOpts) {
	return new PromiseWritable({
		objectMode: true,
		decodeStrings: false,
		async write(chunk) {
			let data = chunk;
			if (Buffer.isBuffer(data)) data = data.toString();
			if (typeof data === 'string') data = JSON.parse(data);

			if (Array.isArray(data)) {
				const noRevs = data.filter(doc => !doc._rev)
					.reduce((map, doc) => map.set(doc._id, doc), new Map());
				if (noRevs.size > 0) {
					const existing = await db.allDocs({ keys: [...noRevs.keys()] });
					existing.rows.filter(row => !row.error)
						.forEach((row) => { noRevs.get(row.id)._rev = row.value.rev; });
				}

				return db.bulkDocs(data, pouchOpts);
			} else {
				if (!data._rev) {
					try {
						const doc = await db.get(data._id, { latest: true });
						data._rev = doc._rev;
					} catch (err) {
						if (err.status !== 404) throw err;
					}
				}
				return db.put(data, pouchOpts);
			}
		}
	});
}
