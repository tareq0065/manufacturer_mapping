import fs from 'fs';
import path from 'path';
import { db } from './db';
import { createObjectCsvWriter } from 'csv-writer';

// Ensure the output directory exists
function ensureOutputDirectory() {
	const outputDir = path.resolve(__dirname, '../../output');
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}
}

// Function to export related manufacturers to a CSV file
async function exportRelatedManufacturers(): Promise<void> {
	ensureOutputDirectory();

	const csvWriter = createObjectCsvWriter({
		path: path.resolve(__dirname, '../../output/related_manufacturers.csv'),
		header: [
			{ id: 'manufacturer_1', title: 'Manufacturer 1' },
			{ id: 'manufacturer_2', title: 'Manufacturer 2' },
			{ id: 'relationship_type', title: 'Relationship Type' },
		],
	});

	db.all(
		`
        SELECT m1.name as manufacturer_1, m2.name as manufacturer_2, rm.relationship_type
        FROM related_manufacturers rm
        JOIN manufacturers m1 ON rm.manufacturer_id_1 = m1.id
        JOIN manufacturers m2 ON rm.manufacturer_id_2 = m2.id
    `,
		(err, rows) => {
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
		},
	);
}

// Function to export validation issues to a CSV file
async function exportValidationIssues(): Promise<void> {
	ensureOutputDirectory();

	const csvWriter = createObjectCsvWriter({
		path: path.resolve(__dirname, '../../output/validation_issues.csv'),
		header: [
			{ id: 'product_id', title: 'Product ID' },
			{ id: 'issue_description', title: 'Issue Description' },
			{ id: 'is_resolved', title: 'Is Resolved' },
		],
	});

	db.all(
		`
        SELECT product_id, issue_description, is_resolved
        FROM validation_issues
    `,
		(err, rows) => {
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
		},
	);
}

async function exportAllResults(): Promise<void> {
	await exportRelatedManufacturers();
	await exportValidationIssues();
}

exportAllResults()
	.then(() => {
		console.log('All results exported successfully.');
	})
	.catch((err) => {
		console.error('Error exporting results:', err.message);
	});
