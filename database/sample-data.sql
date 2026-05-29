USE swsai_dms;

INSERT INTO documents (file_name, file_size, file_path, upload_date, status) VALUES
  ('Employee_Handbook.pdf', 1254789, '/uploads/Employee_Handbook.pdf', '2026-05-29 10:15:00', 'COMPLETE'),
  ('Product_Roadmap_Q3.pdf', 983412, '/uploads/Product_Roadmap_Q3.pdf', '2026-05-29 10:20:00', 'COMPLETE'),
  ('Financial_Report_2025.pdf', 2145780, '/uploads/Financial_Report_2025.pdf', '2026-05-29 10:22:00', 'COMPLETE');

INSERT INTO notifications (message, type, timestamp, is_read) VALUES
  ('3 documents uploaded successfully.', 'SUCCESS', '2026-05-29 10:23:00', FALSE),
  ('Document upload started for Product_Roadmap_Q3.pdf.', 'INFO', '2026-05-29 10:20:10', TRUE),
  ('Failed to process one upload due to file size limits.', 'ERROR', '2026-05-29 10:25:00', FALSE);
