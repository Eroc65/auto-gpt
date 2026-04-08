# Channel Export Inputs

Drop one CSV per channel in this folder.

Expected filename examples:
- `google.csv`
- `microsoft.csv`
- `meta.csv`
- `nextdoor.csv`
- `blog.csv`

Expected headers:
- `date` (YYYY-MM-DD recommended)
- `impressions`
- `clicks`
- `spend`
- `revenue`
- `leads`
- `qualified_leads`

Notes:
- Additional columns are ignored.
- Date rows outside the reporting window are excluded.
- Currency symbols and commas in numeric fields are accepted.
