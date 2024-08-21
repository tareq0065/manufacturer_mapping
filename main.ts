import { initializeDatabase } from './src/db';
import { loadAllCSVFiles } from './src/loadData';

async function main() {
	initializeDatabase();

	try {
		await loadAllCSVFiles();
		console.log('All files processed successfully.');
	} catch (err) {
		console.error('Error during data loading:', err);
	}
}

main();
