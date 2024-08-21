"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initializeDatabase = initializeDatabase;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dbPath = path_1.default.resolve(__dirname, '../../db/products.sqlite');
const schemaPath = path_1.default.resolve(__dirname, '../../db/schema.sql');
const db = new sqlite3_1.default.Database(dbPath);
exports.db = db;
function initializeDatabase() {
    const schema = fs_1.default.readFileSync(schemaPath, 'utf-8');
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error initializing database schema:', err.message);
        }
        else {
            console.log('Database schema initialized successfully.');
        }
    });
}
