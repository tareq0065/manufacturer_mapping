export interface CSVRow {
	title: string;
	manufacturer: string;
	source: string;
	source_id: string;
	country_code?: string;
	barcode?: string;
	composition?: string;
	description?: string;
	competitor_source?: string;
	competitor_source_id?: string;
}

export interface MatchRow {
	id: string;
	m_source: string;
	c_source: string;
	m_country_code?: string;
	c_country_code?: string;
	m_source_id: string;
	c_source_id: string;
	validation_status?: string;
}
