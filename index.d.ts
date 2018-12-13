/**
 * Parse CSV data from the input stream and save it to the PouchDB database.
 * Each row is saved as a separate PouchDB document. If the `_id` preexists in
 * the database, the existing document will be updated with the new version
 * and the revision version will change.
 * @param db Database to save results to.
 * @param input Stream representing the CSV file,
 * such as `fs.createReadableStream('data.csv')`
 * @param transformer Optional function to transform CSV rows.
 * Input `row` represents the CSV data, and the returned object will be used as
 * a PouchDB document.
 * @returns Promise that resolves when db has been written to
 */
declare function parseCSVFile<T>(
    db: PouchDB.Database<T>,
    input: NodeJS.ReadableStream,
    transformer?: (row: any) => T
): Promise<void>;

export default parseCSVFile;
export { parseCSVFile };
