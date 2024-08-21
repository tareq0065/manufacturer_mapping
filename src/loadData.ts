import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { db } from './db';
import { CSVRow, MatchRow } from '../types';

// Function to load and parse CSV files
function loadCSV<T>(filePath: string): Promise<T[]> {
	return new Promise((resolve, reject) => {
		const results: T[] = [];
		fs.createReadStream(filePath)
			.pipe(csvParser({ separator: ';' })) // Ensure correct delimiter is used
			.on('data', (data) => results.push(data))
			.on('end', () => resolve(results))
			.on('error', (err) => reject(err));
	});
}

// Normalize product data
function normalizeProductData(data: CSVRow[]): CSVRow[] {
	return data.map((row) => ({
		title: row.title.trim().toLowerCase(),
		manufacturer: row.manufacturer.trim().toLowerCase(),
		source: row.source.trim().toLowerCase(),
		source_id: row.source_id.trim(),
		country_code: row.country_code?.trim(),
		barcode: row.barcode?.trim(),
		composition: row.composition?.trim(),
		description: row.description?.trim(),
	}));
}

// Normalize match data
function normalizeMatchData(data: MatchRow[]): MatchRow[] {
	return data.map((row) => ({
		id: row.id.trim(),
		m_source: row.m_source.trim().toLowerCase(),
		c_source: row.c_source.trim().toLowerCase(),
		m_country_code: row.m_country_code?.trim(),
		c_country_code: row.c_country_code?.trim(),
		m_source_id: row.m_source_id.trim(),
		c_source_id: row.c_source_id.trim(),
		validation_status: row.validation_status?.trim(),
	}));
}

// Insert manufacturers into the database
async function insertManufacturers(products: CSVRow[]): Promise<void> {
	const uniqueManufacturers = new Set<string>();

	products.forEach((product) => {
		if (product.manufacturer) {
			uniqueManufacturers.add(product.manufacturer);
		}
	});

	for (const manufacturer of uniqueManufacturers) {
		const manufacturerExists = await isManufacturerExists(manufacturer);
		if (!manufacturerExists) {
			db.run(
				`INSERT INTO manufacturers (name) VALUES (?)`,
				[manufacturer],
				(err) => {
					if (err) {
						console.error('Error inserting manufacturer:', err.message);
					} else {
						console.log(`Manufacturer inserted: ${manufacturer}`);
					}
				},
			);
		}
	}
}

// Check if a manufacturer already exists in the database
function isManufacturerExists(manufacturer: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT 1 FROM manufacturers WHERE name = ?`,
			[manufacturer],
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					resolve(!!row);
				}
			},
		);
	});
}

// Insert products into the database
async function insertProducts(products: CSVRow[]): Promise<void> {
	await insertManufacturers(products); // Ensure all manufacturers are inserted first

	for (const product of products) {
		// Get the manufacturer ID for this product's manufacturer
		const manufacturerId = await getManufacturerId(product.manufacturer);

		if (manufacturerId) {
			db.run(
				`
                INSERT INTO products (source, source_id, product_name, manufacturer_id)
                VALUES (?, ?, ?, ?)
            `,
				[product.source, product.source_id, product.title, manufacturerId],
				function (err) {
					if (err) {
						console.error('Error inserting product:', err.message);
					} else {
						console.log(
							`Product inserted: ${product.title} with manufacturer ID ${manufacturerId}`,
						);
					}
				},
			);
		} else {
			console.warn(
				`Manufacturer not found for product: ${product.title}. Skipping...`,
			);
		}
	}
}

// Function to get the manufacturer ID from the manufacturers table
function getManufacturerId(manufacturerName: string): Promise<number | null> {
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT id FROM manufacturers WHERE name = ?`,
			[manufacturerName],
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					// @ts-ignore
					resolve(row ? row.id : null);
				}
			},
		);
	});
}

// Insert matches into the database
function insertMatches(matches: MatchRow[]): void {
	matches.forEach((match) => {
		db.run(
			`
            INSERT INTO product_matches (main_source, main_source_id, competitor_source, competitor_source_id, match_strength)
            VALUES (?, ?, ?, ?, ?)
        `,
			[
				match.m_source,
				match.m_source_id,
				match.c_source,
				match.c_source_id,
				1.0, // Default match strength; adjust as needed
			],
			function (err) {
				if (err) {
					console.error('Error inserting match:', err.message);
				} else {
					console.log(
						`Match inserted: ${match.m_source_id} vs ${match.c_source_id}`,
					);
				}
			},
		);
	});
}

async function mapRelatedManufacturers(matches: MatchRow[]): Promise<void> {
	for (const match of matches) {
		const { m_source, c_source, m_source_id, c_source_id } = match;

		// Get manufacturer IDs associated with these product IDs
		db.get(
			`
            SELECT p1.manufacturer_id as m_manufacturer_id, p2.manufacturer_id as c_manufacturer_id
            FROM products p1, products p2
            WHERE p1.source = ? AND p1.source_id = ?
            AND p2.source = ? AND p2.source_id = ?
            `,
			[m_source, m_source_id, c_source, c_source_id],
			(err, row) => {
				if (err) {
					console.error('Error querying product manufacturers:', err.message);
					return;
				}

				// @ts-ignore
				if (row && row.m_manufacturer_id && row.c_manufacturer_id) {
					// @ts-ignore
					const { m_manufacturer_id, c_manufacturer_id } = row;

					if (m_manufacturer_id !== c_manufacturer_id) {
						insertRelatedManufacturers(
							m_manufacturer_id,
							c_manufacturer_id,
							'sibling',
						);
						updateManufacturerHierarchy(
							m_manufacturer_id,
							c_manufacturer_id,
							'sibling',
						);
					}
				}
			},
		);
	}
}

function insertRelatedManufacturers(
	manufacturerId1: number,
	manufacturerId2: number,
	relationshipType: string,
): void {
	db.run(
		`
        INSERT INTO related_manufacturers (manufacturer_id_1, manufacturer_id_2, relationship_type)
        VALUES (?, ?, ?)
    `,
		[manufacturerId1, manufacturerId2, relationshipType],
		(err) => {
			if (err) {
				console.error('Error inserting related manufacturers:', err.message);
			} else {
				console.log(
					`Related manufacturers inserted: ${manufacturerId1} and ${manufacturerId2} as ${relationshipType}`,
				);
			}
		},
	);
}

function updateManufacturerHierarchy(
	manufacturerId1: number,
	manufacturerId2: number,
	relationshipType: string,
): void {
	if (relationshipType === 'sibling') {
		// For simplicity, assume manufacturerId1 is the parent and manufacturerId2 is the child
		db.run(
			`
            UPDATE manufacturers
            SET parent_id = ?, relationship_type = ?
            WHERE id = ?
            `,
			[manufacturerId1, relationshipType, manufacturerId2],
			(err) => {
				if (err) {
					console.error('Error updating manufacturer hierarchy:', err.message);
				} else {
					console.log(
						`Manufacturer ${manufacturerId2} updated with parent ${manufacturerId1} and relationship ${relationshipType}`,
					);
				}
			},
		);
	}
	// Add more logic for different relationship types as needed
}

async function assignManufacturersToProducts(
	products: CSVRow[],
): Promise<void> {
	for (const product of products) {
		if (!product.manufacturer) {
			const assignedManufacturer = await findRelatedManufacturer(product.title);
			if (assignedManufacturer) {
				if (typeof assignedManufacturer === 'string') {
					product.manufacturer = assignedManufacturer;
				}
				console.log(
					`Assigned manufacturer ${assignedManufacturer} to product: ${product.title}`,
				);
			} else {
				console.log(
					`No related manufacturer found for product: ${product.title}`,
				);
			}
		}
	}

	// Now insert the products, including those with newly assigned manufacturers
	await insertProducts(products);
}

async function findRelatedManufacturer(productTitle: string): Promise<unknown> {
	return new Promise((resolve, reject) => {
		db.get(
			`
            SELECT m.name
            FROM manufacturers m
            JOIN related_manufacturers rm ON rm.manufacturer_id_1 = m.id OR rm.manufacturer_id_2 = m.id
            WHERE EXISTS (
                SELECT 1 FROM products p
                WHERE p.product_name LIKE ? AND p.manufacturer_id = m.id
            )
            LIMIT 1
        `,
			[`%${productTitle}%`],
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					// @ts-ignore
					resolve(row ? row.name : null);
				}
			},
		);
	});
}

// Common words that are not likely to be manufacturers
const commonWords = [
	'generic',
	'unknown',
	'product',
	'medicine',
	'tablet',
	'liquid',
];

async function validateData(): Promise<void> {
	// Validate products with no manufacturer_id
	await validateMissingManufacturers();

	// Validate manufacturers that may be common words
	await validateCommonWordManufacturers();
}

async function validateMissingManufacturers(): Promise<void> {
	db.all(
		`
        SELECT id, product_name FROM products
        WHERE manufacturer_id IS NULL
    `,
		(err, rows) => {
			if (err) {
				console.error(
					'Error querying products with missing manufacturers:',
					err.message,
				);
				return;
			}

			rows.forEach((row: any) => {
				logValidationIssue(
					row.id,
					`Product "${row.product_name}" has no manufacturer assigned.`,
				);
			});
		},
	);
}

async function validateCommonWordManufacturers(): Promise<void> {
	db.all(
		`
        SELECT p.id, p.product_name, m.name as manufacturer_name
        FROM products p
        JOIN manufacturers m ON p.manufacturer_id = m.id
        WHERE m.name IN (${commonWords.map(() => '?').join(', ')})
    `,
		commonWords,
		(err, rows) => {
			if (err) {
				console.error('Error querying common word manufacturers:', err.message);
				return;
			}

			rows.forEach((row: any) => {
				logValidationIssue(
					row.id,
					`Product "${row.product_name}" has a common word as a manufacturer: "${row.manufacturer_name}".`,
				);
			});
		},
	);
}

// Log the validation issues into the validation_issues table
function logValidationIssue(productId: number, issueDescription: string): void {
	db.run(
		`
        INSERT INTO validation_issues (product_id, issue_description)
        VALUES (?, ?)
    `,
		[productId, issueDescription],
		(err) => {
			if (err) {
				console.error('Error logging validation issue:', err.message);
			} else {
				console.log(`Validation issue logged: ${issueDescription}`);
			}
		},
	);
}

async function loadAllCSVFiles() {
	const productsDir = path.resolve(__dirname, '../../csv/products/');
	const matchesPath = path.resolve(__dirname, '../../csv/matches.csv');

	// Process product CSV files
	const productFiles = fs
		.readdirSync(productsDir)
		.filter((file) => file.endsWith('.csv'));

	for (const file of productFiles) {
		const filePath = path.join(productsDir, file);

		const fileAlreadyProcessed = await isFileProcessed(file);
		if (fileAlreadyProcessed) {
			console.log(`File already processed, skipping: ${file}`);
			continue;
		}

		try {
			let products = await loadCSV<CSVRow>(filePath);
			products = normalizeProductData(products);

			// Assign manufacturers to products where needed
			await assignManufacturersToProducts(products);

			markFileAsProcessed(file);
		} catch (err) {
			console.error(`Error processing file ${file}:`, err);
		}
	}

	// Process matches CSV file
	const matchesAlreadyProcessed = await isFileProcessed('matches.csv');
	if (!matchesAlreadyProcessed) {
		try {
			let matches = await loadCSV<MatchRow>(matchesPath);
			matches = normalizeMatchData(matches);

			console.log(`Inserting matches from file: matches.csv`);
			insertMatches(matches);

			// Map related manufacturers based on product matches
			await mapRelatedManufacturers(matches);

			markFileAsProcessed('matches.csv');
		} catch (err) {
			console.error(`Error processing matches.csv:`, err);
		}
	} else {
		console.log('matches.csv already processed, skipping.');
	}

	// Run the validation algorithm
	await validateData();
}

// Check if a file has already been processed
async function isFileProcessed(fileName: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		db.get(
			'SELECT 1 FROM processed_files WHERE file_name = ?',
			[fileName],
			(err, row) => {
				if (err) {
					reject(err);
				} else {
					resolve(!!row);
				}
			},
		);
	});
}

// Mark a file as processed
function markFileAsProcessed(fileName: string): void {
	db.run(
		'INSERT INTO processed_files (file_name) VALUES (?)',
		[fileName],
		(err) => {
			if (err) {
				console.error(`Error marking file as processed: ${fileName}`, err);
			} else {
				console.log(`File marked as processed: ${fileName}`);
			}
		},
	);
}

export { loadAllCSVFiles };
