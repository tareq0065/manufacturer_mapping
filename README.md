## Manufacturer Mapping and Product Management System

---

This project is designed to process, normalize, and analyze product data from multiple CSV files, identify and map related manufacturers, and validate the quality of the data. The results are exported to CSV files for easy review and further processing. The entire system is built using Node.js, TypeScript, and SQLite.

### **Table of Contents**

- [Installation](#installation)
- [Project Structure](#project-structure)
- [Steps and Functions](#steps-and-functions)
    1. [Project Setup](#1-project-setup)
    2. [Data Loading](#2-data-loading)
    3. [Data Insertion](#3-data-insertion)
    4. [Manufacturer Mapping](#4-manufacturer-mapping)
    5. [Manufacturer Assignment](#5-manufacturer-assignment)
    6. [Validation](#6-validation)
    7. [Output Generation](#7-output-generation)
- [Complexities and Considerations](#complexities-and-considerations)
- [Running Instructions](#running-instructions)

---

### **Installation**

Before running the project, ensure you have Node.js and npm installed on your system.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/tareq0065/manufacturer_mapping.git
   cd manufacturer-mapping-system
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Compile TypeScript:**

   ```bash
   npm run build
   ```

### **Project Structure**

```
manufacturer-mapping-system/
│
├── csv/            # Directory for raw CSV files
├── db/             # Directory for database-related files
│   └── schema.sql  # SQL schema for setting up the SQLite database
├── dist/           # Directory for compiled JavaScript files
├── output/         # Directory for exported CSV files
├── src/            # Directory for TypeScript source files
│   ├── db.ts       # Database connection setup
│   ├── loadData.ts # Script for loading, normalizing, and inserting data
│   ├── cleanDatabase.ts # Script for cleaning the database tables
│   ├── exportResults.ts # Script for exporting results to CSV files
├── types/          # Directory for TypeScript types
│   └── index.ts    # Definitions of types used in the project
├── .gitignore      # Git ignore file
├── main.ts         # Entry point for the application
├── package.json    # Project dependencies and scripts
├── prettier.config.js # Prettier configuration file
├── README.md       # Project README file
└── tsconfig.json   # TypeScript configuration file
```

### **Steps and Functions**

#### **1. Project Setup**

- **File**: `db/schema.sql`
- **Description**:
    - Initializes the SQLite database with the necessary tables:
        - `manufacturers`: Stores manufacturer details.
        - `products`: Stores product details linked to manufacturers.
        - `product_matches`: Stores matches between products from different sources.
        - `related_manufacturers`: Stores relationships between different manufacturer names.
        - `validation_issues`: Stores any validation issues detected during the process.
        - `processed_files`: Tracks which files have been processed to prevent duplication.

#### **2. Data Loading**

- **File**: `src/loadData.ts`
- **Functions**:
    - `loadCSV<T>(filePath: string)`: Loads and parses CSV files dynamically.
    - `normalizeProductData(data: CSVRow[])`: Normalizes product data for consistency.
    - `normalizeMatchData(data: MatchRow[])`: Normalizes match data for consistency.
    - **Flow**:
        - Loads CSV files from the `csv` directory.
        - Normalizes data for consistent processing.

#### **3. Data Insertion**

- **File**: `src/loadData.ts`
- **Functions**:
    - `insertManufacturers(products: CSVRow[])`: Inserts unique manufacturers into the database.
    - `insertProducts(products: CSVRow[])`: Inserts products into the database, linking them to their manufacturers.
    - `insertMatches(matches: MatchRow[])`: Inserts product matches into the database.
    - **Flow**:
        - Manufacturers are inserted first to ensure proper linkage.
        - Products are inserted with references to the corresponding manufacturers.
        - Product matches are then stored.

#### **4. Manufacturer Mapping**

- **File**: `src/loadData.ts`
- **Functions**:
    - `mapRelatedManufacturers(matches: MatchRow[])`: Identifies and maps related manufacturers based on product matches.
    - `insertRelatedManufacturers(manufacturerId1: number, manufacturerId2: number, relationshipType: string)`: Inserts relationships between manufacturers.
    - `updateManufacturerHierarchy(manufacturerId1: number, manufacturerId2: number, relationshipType: string)`: Updates the `manufacturers` table to reflect hierarchical relationships.
    - **Flow**:
        - Identifies relationships between manufacturers based on matching products.
        - Updates the `manufacturers` table with hierarchical relationships.

#### **5. Manufacturer Assignment**

- **File**: `src/loadData.ts`
- **Functions**:
    - `assignManufacturersToProducts(products: CSVRow[])`: Assigns manufacturers to products where the manufacturer is not explicitly listed.
    - `findRelatedManufacturer(productTitle: string)`: Searches for a related manufacturer based on the product title.
    - **Flow**:
        - Ensures that all products have an assigned manufacturer.
        - Uses related manufacturers to infer missing manufacturer assignments.

#### **6. Validation**

- **File**: `src/loadData.ts`
- **Functions**:
    - `validateData()`: Runs all validation checks.
    - `validateMissingManufacturers()`: Flags products that have no manufacturer assigned.
    - `validateCommonWordManufacturers()`: Flags manufacturers that may be common words, indicating potential errors.
    - `logValidationIssue(productId: number, issueDescription: string)`: Logs validation issues to the `validation_issues` table.
    - **Flow**:
        - Identifies and logs potential issues in the data.
        - Ensures data quality and consistency.

#### **7. Output Generation**

- **File**: `src/exportResults.ts`
- **Functions**:
    - `exportRelatedManufacturers()`: Exports related manufacturers to a CSV file.
    - `exportValidationIssues()`: Exports validation issues to a CSV file.
    - **Flow**:
        - Generates output files summarizing the results.
        - Exports both related manufacturers and validation issues for further analysis.

### **Complexities and Considerations**

- **Data Normalization**: Ensures that variations in manufacturer names and product titles do not cause incorrect data associations.
- **Error Handling**: The system is designed to handle various errors gracefully, such as missing manufacturers or failed database operations.
- **Efficiency**: The system is optimized to process large datasets efficiently, ensuring timely completion even for substantial data inputs.
- **Validation**: The validation step is crucial for ensuring data quality, flagging potential issues that might otherwise go unnoticed.

### **Running Instructions**

1. **Compile the TypeScript files:**

   ```bash
   npm run build
   ```

2. **Start the main processing script:**

   ```bash
   npm start
   ```

3. **Clean the database tables if needed:**

   ```bash
   npm run clean-db
   ```

4. **Export the results:**

   ```bash
   npm run export-results
   ```

### **Conclusion**

This project provides a comprehensive solution for processing product data from multiple sources, identifying and mapping related manufacturers, validating data quality, and generating reports. The system is built with extensibility in mind, allowing for future enhancements as needed.
