import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../db/products.sqlite');

const db = new sqlite3.Database(dbPath);

function cleanDatabase(): void {
	const tables = [
		'products',
		'manufacturers',
		'product_matches',
		'related_manufacturers',
		'validation_issues',
		'processed_files',
	];

	db.serialize(() => {
		// Disable foreign key checks to allow truncating tables with foreign key constraints
		db.run('PRAGMA foreign_keys = OFF;');

		tables.forEach((table) => {
			db.run(`DELETE FROM ${table};`, (err) => {
				if (err) {
					console.error(`Error cleaning table ${table}:`, err.message);
				} else {
					console.log(`Table ${table} cleaned.`);
				}
			});

			// Optionally, you can reset the auto-increment (rowid) for each table
			db.run(`DELETE FROM sqlite_sequence WHERE name = ?;`, [table], (err) => {
				if (err) {
					console.error(
						`Error resetting auto-increment for table ${table}:`,
						err.message,
					);
				} else {
					console.log(`Auto-increment for table ${table} reset.`);
				}
			});
		});

		// Re-enable foreign key checks
		db.run('PRAGMA foreign_keys = ON;');
	});
}

cleanDatabase();
