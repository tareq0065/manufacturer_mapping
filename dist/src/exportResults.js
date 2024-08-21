"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const csv_writer_1 = require("csv-writer");
// Ensure the output directory exists
function ensureOutputDirectory() {
    const outputDir = path_1.default.resolve(__dirname, '../../output');
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
}
// Function to export related manufacturers to a CSV file
function exportRelatedManufacturers() {
    return __awaiter(this, void 0, void 0, function* () {
        ensureOutputDirectory();
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: path_1.default.resolve(__dirname, '../../output/related_manufacturers.csv'),
            header: [
                { id: 'manufacturer_1', title: 'Manufacturer 1' },
                { id: 'manufacturer_2', title: 'Manufacturer 2' },
                { id: 'relationship_type', title: 'Relationship Type' },
            ],
        });
        db_1.db.all(`
        SELECT m1.name as manufacturer_1, m2.name as manufacturer_2, rm.relationship_type
        FROM related_manufacturers rm
        JOIN manufacturers m1 ON rm.manufacturer_id_1 = m1.id
        JOIN manufacturers m2 ON rm.manufacturer_id_2 = m2.id
    `, (err, rows) => {
            if (err) {
                console.error('Error querying related manufacturers:', err.message);
                return;
            }
            csvWriter
                // @ts-ignore
                .writeRecords(rows)
                .then(() => {
                console.log('Related manufacturers exported successfully.');
            })
                .catch((error) => {
                console.error('Error writing CSV:', error.message);
            });
        });
    });
}
// Function to export validation issues to a CSV file
function exportValidationIssues() {
    return __awaiter(this, void 0, void 0, function* () {
        ensureOutputDirectory();
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: path_1.default.resolve(__dirname, '../../output/validation_issues.csv'),
            header: [
                { id: 'product_id', title: 'Product ID' },
                { id: 'issue_description', title: 'Issue Description' },
                { id: 'is_resolved', title: 'Is Resolved' },
            ],
        });
        db_1.db.all(`
        SELECT product_id, issue_description, is_resolved
        FROM validation_issues
    `, (err, rows) => {
            if (err) {
                console.error('Error querying validation issues:', err.message);
                return;
            }
            csvWriter
                // @ts-ignore
                .writeRecords(rows)
                .then(() => {
                console.log('Validation issues exported successfully.');
            })
                .catch((error) => {
                console.error('Error writing CSV:', error.message);
            });
        });
    });
}
function exportAllResults() {
    return __awaiter(this, void 0, void 0, function* () {
        yield exportRelatedManufacturers();
        yield exportValidationIssues();
    });
}
exportAllResults()
    .then(() => {
    console.log('All results exported successfully.');
})
    .catch((err) => {
    console.error('Error exporting results:', err.message);
});
