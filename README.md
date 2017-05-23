# csv-to-pouch
Parse CSV files and save their data to a PouchDB database.

## API
```
function parseCSVFile<T>(
	db: PouchDB.Database<T>,
	input: NodeJS.ReadableStream,
	transformer?: (row: any) => T,
): Promise<void>
```
Parse CSV data from the input stream and save it to the PouchDB database.
Each row is saved as a seperate PouchDB document. If the `_id` prexists in
the database, the existing document will be updated with the new version
and the revision version will change.

- **db**: Database to save results to.
- **input**: Stream representing the CSV file,
  such as `fs.createReadableStream('data.csv')`
- **transformer**: Optional function to transform CSV rows.
  Input `row` represents the CSV data, and the returned object will be used as a
	PouchDB document.

## Command Line
Examples:
```
csv-to-pouch http://localhost:5984/mydb < data.csv
csv-to-pouch --db http://localhost:5984/mydb -i data.csv
csv-to-pouch /path/to/mydb < data.csv
csv-to-pouch http://localhost:5984/mydb -u myUsername -p myPassword < data.csv
```

Options:
```
--db            URL or filepath to database
-i, --input     CSV file path. Can also pipe from stdin.
-h, --help      Show help text
-u, --username  Username for password-protected database
-p, --password  Password for password-protected database
```
