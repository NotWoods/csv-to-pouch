const parseArgs = require('minimist');

const helpText = `
Examples:
	csv-to-pouch http://localhost:5984/mydb < data.csv
	csv-to-pouch --db http://localhost:5984/mydb -i data.csv
	csv-to-pouch /path/to/mydb < data.csv
	csv-to-pouch http://localhost:5984/mydb -u myUsername -p myPassword < data.csv

Options:
	--db            URL or filepath to database
	-i, --input     CSV file path. Can also pipe from stdin.
	-h, --help      Show this help text
	-u, --username  Username for password-protected database
	-p, --password  Password for password-protected database
`;

if (require.main === module) {
	const args = parseArgs(process.argv, {
		alias: {
			i: 'input',
			h: 'help',
			u: 'username',
			p: 'password',
		},
		string: ['input', 'username', 'password', 'db'],
		boolean: ['help'],
	});

	if (args.help) {
		console.log(helpText);
		return process.exit(0);
	}

	let dbName = args.db || args._[0];
	if (!dbName) {
		console.error('You need to supply a database URL or filepath. -h for help');
		return process.exit(1);
	}

	const { input } = args;
	if (process.stdin.isTTY && !input) {
		console.error(
			'Missing --input path, either provide it or pipe in a file from stdin.');
		return process.exit(1);
	}

	const { password, username } = args;
	if ((password && !username) || (username && !password)) {
		console.error('You must either supply both a username and password, or neither');
		return process.exit(1);
	} else if (password) {
		const { parse } = require('url');
		const parsedURL = parse(dbName);
		if (!parsedURL.protocol) {
			console.error('Usernames/passwords are only for remote databases');
			console.error('Is ' + dbName + ' a remote database?');
			return process.exit(1);
		}

		dbName = parsedURL.protocol + '//' + encodeURIComponent(username) +
			':' + encodeURIComponent(password) + '@' + parsedURL.host +
			parsedURL.path;
	}

	const PouchDB = require('pouchdb');
	const { createReadStream } = require('fs');
	const parseCSVFile = require('./index.js');

	const inputStream = input ? createReadStream(input) : process.stdin;
	const db = new PouchDB(dbName, { ajax: { timeout: 60000 } });

	parseCSVFile(db, inputStream)
		.then(() => process.exit(0))
		.catch(err => {
			console.error('unexpected error');
			console.error(err);
			process.exit(1);
		});
}

