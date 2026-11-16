export const REQUIRABLE_COLUMNS = [
  "title",
  "company",
  "location",
  "experience",
  "salary",
  "work_mode",
  "apply_contact",
];

export const INITIAL_COLUMNS = [
  { key: "title", label: "Job Title", required: true, enabled: true },
  { key: "company", label: "Company", required: true, enabled: true },
  { key: "location", label: "Location", required: true, enabled: true },
  { key: "experience", label: "Experience", required: true, enabled: true },
  { key: "salary", label: "Salary / CTC", required: false, enabled: true },
  { key: "work_mode", label: "Work Mode", required: false, enabled: true },
  { key: "vault", label: "Vault", required: false, enabled: true },
  { key: "source_app", label: "Source", required: false, enabled: true },
  { key: "apply_contact", label: "Apply Link / Contact", required: false, enabled: true },
  { key: "created_at", label: "Date Received", required: false, enabled: true },
  { key: "screenshot", label: "Screenshot Link", required: false, enabled: true },
];

