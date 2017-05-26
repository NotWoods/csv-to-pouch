/**
 * Creates the output dump file for the given GTFS file, and resolves once
 * complete. Tries to use 'memory' adapter for PouchDB, which requires a plugin.
 */
function parseCSVFile<T>(
	db: PouchDB.Database<T>,
	input: NodeJS.ReadableStream,
	transformer?: (row: any) => T,
): Promise<void>

export default parseCSVFile
export { parseCSVFile };
