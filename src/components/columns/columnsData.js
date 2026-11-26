export const REQUIRABLE_COLUMNS = [
  "job_id",
  "title",
  "sector",
  "company",
  "salary",
  "location",
  "experience",
  "qualification",
  "other_details",
  "apply_contact",
  "work_mode",
];

// Client Master Excel Schema (Exact 12 Columns A-L per README.md)
export const INITIAL_COLUMNS = [
  { key: "s_no", label: "S. No.", required: false, enabled: true },
  { key: "job_id", label: "Job ID", required: true, enabled: true },
  { key: "created_at", label: "Date", required: false, enabled: true },
  { key: "title", label: "Role", required: true, enabled: true },
  { key: "sector", label: "Sector", required: false, enabled: true },
  { key: "company", label: "Company", required: true, enabled: true },
  { key: "salary", label: "Salary", required: false, enabled: true },
  { key: "location", label: "Location", required: true, enabled: true },
  { key: "experience", label: "Experience", required: true, enabled: true },
  { key: "qualification", label: "Qualification", required: false, enabled: true },
  { key: "other_details", label: "Other Details", required: false, enabled: true },
  { key: "apply_contact", label: "How to apply", required: false, enabled: true },
];

