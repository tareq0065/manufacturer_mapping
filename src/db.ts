import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(__dirname, '../../db/products.sqlite');
const schemaPath = path.resolve(__dirname, '../../db/schema.sql');

const db = new sqlite3.Database(dbPath);

function initializeDatabase(): void {
	const schema = fs.readFileSync(schemaPath, 'utf-8');
	db.exec(schema, (err) => {
		if (err) {
			console.error('Error initializing database schema:', err.message);
		} else {
			console.log('Database schema initialized successfully.');
		}
	});
}

export { db, initializeDatabase };
