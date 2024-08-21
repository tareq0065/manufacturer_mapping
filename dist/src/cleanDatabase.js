"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbPath = path_1.default.resolve(__dirname, '../db/products.sqlite');
const db = new sqlite3_1.default.Database(dbPath);
function cleanDatabase() {
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
                }
                else {
                    console.log(`Table ${table} cleaned.`);
                }
            });
            // Optionally, you can reset the auto-increment (rowid) for each table
            db.run(`DELETE FROM sqlite_sequence WHERE name = ?;`, [table], (err) => {
                if (err) {
                    console.error(`Error resetting auto-increment for table ${table}:`, err.message);
                }
                else {
                    console.log(`Auto-increment for table ${table} reset.`);
                }
            });
        });
        // Re-enable foreign key checks
        db.run('PRAGMA foreign_keys = ON;');
    });
}
cleanDatabase();
