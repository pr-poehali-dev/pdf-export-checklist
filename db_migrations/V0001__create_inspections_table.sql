CREATE TABLE IF NOT EXISTS t_p27133687_pdf_export_checklist.inspections (
    id SERIAL PRIMARY KEY,
    address TEXT NOT NULL,
    inspection_date DATE NOT NULL,
    inspector_signature TEXT,
    client_signature TEXT,
    checklist_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inspections_date ON t_p27133687_pdf_export_checklist.inspections(inspection_date);
CREATE INDEX idx_inspections_address ON t_p27133687_pdf_export_checklist.inspections(address);