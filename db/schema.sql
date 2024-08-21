CREATE TABLE IF NOT EXISTS manufacturers (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             name TEXT NOT NULL UNIQUE,
                                             parent_id INTEGER,
                                             relationship_type TEXT,
                                             FOREIGN KEY(parent_id) REFERENCES manufacturers(id)
    );

CREATE TABLE IF NOT EXISTS products (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        source TEXT NOT NULL,
                                        source_id TEXT NOT NULL,
                                        product_name TEXT NOT NULL,
                                        manufacturer_id INTEGER,
                                        FOREIGN KEY(manufacturer_id) REFERENCES manufacturers(id)
    );

CREATE TABLE IF NOT EXISTS product_matches (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               main_source TEXT NOT NULL,
                                               main_source_id TEXT NOT NULL,
                                               competitor_source TEXT NOT NULL,
                                               competitor_source_id TEXT NOT NULL,
                                               match_strength REAL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS related_manufacturers (
                                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                     manufacturer_id_1 INTEGER NOT NULL,
                                                     manufacturer_id_2 INTEGER NOT NULL,
                                                     relationship_type TEXT NOT NULL,
                                                     FOREIGN KEY(manufacturer_id_1) REFERENCES manufacturers(id),
    FOREIGN KEY(manufacturer_id_2) REFERENCES manufacturers(id)
    );

CREATE TABLE IF NOT EXISTS validation_issues (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 product_id INTEGER NOT NULL,
                                                 issue_description TEXT NOT NULL,
                                                 is_resolved BOOLEAN DEFAULT 0,
                                                 FOREIGN KEY(product_id) REFERENCES products(id)
    );

CREATE TABLE IF NOT EXISTS processed_files (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               file_name TEXT NOT NULL UNIQUE,
                                               processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
