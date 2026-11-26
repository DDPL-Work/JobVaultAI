/**
 * Client Master Excel Schema (Exact 12 Columns) & Multi-Tab XLSX Export Engine
 * 
 * Implements the specification from README.md:
 * 12 Columns:
 * 1. S. No. | 2. Job ID | 3. Date | 4. Role | 5. Sector | 6. Company |
 * 7. Salary | 8. Location | 9. Experience | 10. Qualification | 11. Other Details | 12. How to apply
 * 
 * Workbook Tabs:
 * 1. All Jobs (Master Overview)
 * 2. India · Fresher
 * 3. India · Junior
 * 4. India · Mid-level
 * 5. India · Senior
 * 6. Remote
 * 7. Global
 * 
 * Styling:
 * Navy Dark Header (#15202C), white bold font (#FFFFFF), auto column widths, auto-filters
 */

import { getJobVaults } from "../components/jobs/jobsData";
import { API_BASE_URL, getAccessToken } from "../apis/apiClient";

export const CLIENT_EXCEL_COLUMNS = [
  { key: "s_no", label: "S. No.", width: 8, align: "center" },
  { key: "job_id", label: "Job ID", width: 16, align: "center" },
  { key: "created_at", label: "Date", width: 14, align: "center" },
  { key: "title", label: "Role", width: 30, align: "left" },
  { key: "sector", label: "Sector", width: 22, align: "left" },
  { key: "company", label: "Company", width: 26, align: "left" },
  { key: "salary", label: "Salary", width: 20, align: "left" },
  { key: "location", label: "Location", width: 20, align: "left" },
  { key: "experience", label: "Experience", width: 16, align: "left" },
  { key: "qualification", label: "Qualification", width: 24, align: "left" },
  { key: "other_details", label: "Other Details", width: 38, align: "left" },
  { key: "apply_contact", label: "How to apply", width: 26, align: "left" },
];

export const WORKBOOK_TABS = [
  "All Jobs",
  "Early Career Access Vault",
  "Executive Access Vault",
  "Leadership Access Vault",
  "Management Access Vault",
  "Remote Access Vault",
  "UAE & Global Access Vault",
];

const VAULT_ALIASES = {
  "Early Career Access Vault": [
    "Early Career Access Vault",
    "India · Fresher",
    "India · Junior",
  ],
  "Executive Access Vault": ["Executive Access Vault"],
  "Leadership Access Vault": ["Leadership Access Vault", "India · Senior"],
  "Management Access Vault": ["Management Access Vault", "India · Mid-level"],
  "Remote Access Vault": ["Remote Access Vault", "Remote"],
  "UAE & Global Access Vault": ["UAE & Global Access Vault", "Global"],
};

const COL_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

/**
 * Format date cleanly to DD-MM-YYYY format
 */
export function formatDateForExcel(dateInput) {
  if (!dateInput) return "16-11-2026";
  try {
    if (typeof dateInput === "string") {
      const clean = dateInput.trim();
      // If already DD-MM-YYYY or DD/MM/YYYY
      if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(clean)) {
        return clean.replace(/\//g, "-");
      }
      // If YYYY-MM-DD
      const ymdMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (ymdMatch) {
        return `${ymdMatch[3]}-${ymdMatch[2]}-${ymdMatch[1]}`;
      }
    }
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
  } catch {
    // fallback
  }
  return "16-11-2026";
}

/**
 * Generates exact 12-column row array for a given job
 */
export function getJobRowValues(job, index) {
  const sNo = index + 1;
  const jobId = job.job_id || job.code || "";
  const dateStr = formatDateForExcel(job.created_at);
  const role = job.title || "";
  const sector = job.sector && job.sector !== "—" ? job.sector : "";
  const company = job.company && job.company !== "—" ? job.company : "";
  const salary = job.salary && job.salary !== "—" ? job.salary : "";
  const location = job.location && job.location !== "—" ? job.location : "";
  const experience = job.experience && job.experience !== "—" ? job.experience : "";
  const qualification =
    job.qualification && job.qualification !== "—" ? job.qualification : "";
  const otherDetails =
    job.other_details && job.other_details !== "—"
      ? job.other_details
      : job.raw_text
      ? job.raw_text.replace(/\n+/g, " · ").slice(0, 160)
      : "";
  const howToApply =
    job.apply_contact && job.apply_contact !== "—" ? job.apply_contact : "";

  return [
    sNo,
    jobId,
    dateStr,
    role,
    sector,
    company,
    salary,
    location,
    experience,
    qualification,
    otherDetails,
    howToApply,
  ];
}

/**
 * Sort jobs newest/current first (descending by created_at, then id)
 */
export function sortJobsNewestFirst(jobs = []) {
  return [...jobs].sort((a, b) => {
    const timeA = a?.created_at
      ? new Date(String(a.created_at).replace(" ", "T")).getTime()
      : 0;
    const timeB = b?.created_at
      ? new Date(String(b.created_at).replace(" ", "T")).getTime()
      : 0;
    if (timeB !== timeA && !Number.isNaN(timeA) && !Number.isNaN(timeB)) {
      return timeB - timeA;
    }
    return Number(b?.id || 0) - Number(a?.id || 0);
  });
}

/**
 * Filter jobs per tab adhering to Cross-Vault Dual-Routing Architecture
 */
export function getJobsForTab(tabName, jobs = []) {
  const ordered = sortJobsNewestFirst(jobs);
  if (tabName === "All Jobs") return ordered;
  const acceptedNames = VAULT_ALIASES[tabName] || [tabName];
  return ordered.filter((j) =>
    getJobVaults(j).some((v) => acceptedNames.includes(v))
  );
}

function xmlEscape(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Standard CRC32 table for zero-dependency Zip generation
 */
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

function crc32(uint8) {
  let crc = 0 ^ -1;
  for (let i = 0; i < uint8.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ uint8[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

/**
 * Pure JavaScript ZIP archive generator
 */
function createZipBuffer(files) {
  const encoder = new TextEncoder();
  let totalLocalSize = 0;
  let totalCdSize = 0;

  const prepared = files.map((f) => {
    const nameBytes = encoder.encode(f.name);
    const dataBytes = typeof f.data === "string" ? encoder.encode(f.data) : f.data;
    const crc = crc32(dataBytes);
    const localHeaderSize = 30 + nameBytes.length;
    const cdHeaderSize = 46 + nameBytes.length;

    totalLocalSize += localHeaderSize + dataBytes.length;
    totalCdSize += cdHeaderSize;

    return { nameBytes, dataBytes, crc, localHeaderSize, cdHeaderSize };
  });

  const totalSize = totalLocalSize + totalCdSize + 22;
  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer);

  let offset = 0;
  prepared.forEach((p) => {
    p.offset = offset;
    view.setUint32(offset, 0x04034b50, true);
    view.setUint16(offset + 4, 20, true);
    view.setUint16(offset + 6, 0, true);
    view.setUint16(offset + 8, 0, true);
    view.setUint16(offset + 10, 0, true);
    view.setUint16(offset + 12, 0, true);
    view.setUint32(offset + 14, p.crc, true);
    view.setUint32(offset + 18, p.dataBytes.length, true);
    view.setUint32(offset + 22, p.dataBytes.length, true);
    view.setUint16(offset + 26, p.nameBytes.length, true);
    view.setUint16(offset + 28, 0, true);
    out.set(p.nameBytes, offset + 30);
    out.set(p.dataBytes, offset + 30 + p.nameBytes.length);
    offset += p.localHeaderSize + p.dataBytes.length;
  });

  const cdStartOffset = offset;
  prepared.forEach((p) => {
    view.setUint32(offset, 0x02014b50, true);
    view.setUint16(offset + 4, 20, true);
    view.setUint16(offset + 6, 20, true);
    view.setUint16(offset + 8, 0, true);
    view.setUint16(offset + 10, 0, true);
    view.setUint16(offset + 12, 0, true);
    view.setUint16(offset + 14, 0, true);
    view.setUint32(offset + 16, p.crc, true);
    view.setUint32(offset + 20, p.dataBytes.length, true);
    view.setUint32(offset + 24, p.dataBytes.length, true);
    view.setUint16(offset + 28, p.nameBytes.length, true);
    view.setUint16(offset + 30, 0, true);
    view.setUint16(offset + 32, 0, true);
    view.setUint16(offset + 34, 0, true);
    view.setUint16(offset + 36, 0, true);
    view.setUint32(offset + 38, 0, true);
    view.setUint32(offset + 42, p.offset, true);
    out.set(p.nameBytes, offset + 46);
    offset += p.cdHeaderSize;
  });

  // End of Central Directory
  view.setUint32(offset, 0x06054b50, true);
  view.setUint16(offset + 4, 0, true);
  view.setUint16(offset + 6, 0, true);
  view.setUint16(offset + 8, prepared.length, true);
  view.setUint16(offset + 10, prepared.length, true);
  view.setUint32(offset + 12, totalCdSize, true);
  view.setUint32(offset + 16, cdStartOffset, true);
  view.setUint16(offset + 20, 0, true);

  return out;
}

/**
 * Generates OpenXML Sheet XML with Navy Header (#15202C), Auto-Widths, and Auto-Filters
 */
function buildWorksheetXml(sheetJobs) {
  const colDefs = CLIENT_EXCEL_COLUMNS.map(
    (c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.width}" customWidth="1"/>`
  ).join("");

  // Header row (Row 1): style index 1 = Navy Header (#15202C)
  const headerCells = CLIENT_EXCEL_COLUMNS.map(
    (col, i) => `<c r="${COL_LETTERS[i]}1" s="1" t="inlineStr"><is><t>${xmlEscape(col.label)}</t></is></c>`
  ).join("");

  const headerRowXml = `<row r="1" ht="28" customHeight="1">${headerCells}</row>`;

  // Data rows
  const dataRowsXml = sheetJobs.map((job, idx) => {
    const rowNum = idx + 2;
    const values = getJobRowValues(job, idx);

    const cellsXml = values
      .map((val, colIdx) => {
        const colLetter = COL_LETTERS[colIdx];
        const cellRef = `${colLetter}${rowNum}`;

        if (colIdx === 0) {
          // S. No. (Numeric center)
          return `<c r="${cellRef}" s="2" t="n"><v>${val}</v></c>`;
        }
        if (colIdx === 1 || colIdx === 2) {
          // Job ID & Date (Centered inline text)
          return `<c r="${cellRef}" s="2" t="inlineStr"><is><t>${xmlEscape(val)}</t></is></c>`;
        }
        // General text fields (Left aligned with wrap)
        return `<c r="${cellRef}" s="3" t="inlineStr"><is><t>${xmlEscape(val)}</t></is></c>`;
      })
      .join("");

    return `<row r="${rowNum}" ht="24" customHeight="1">${cellsXml}</row>`;
  }).join("");

  const lastRow = Math.max(sheetJobs.length + 1, 2);
  const autoFilterRef = `A1:L${lastRow}`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>${colDefs}</cols>
  <sheetData>
    ${headerRowXml}
    ${dataRowsXml}
  </sheetData>
  <autoFilter ref="${autoFilterRef}"/>
</worksheet>`;
}

/**
 * Helper to download Blob in browser
 */
function triggerBrowserDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 1. REAL MULTI-TAB EXCEL (.xlsx) EXPORT
 * Produces genuine multi-tab workbook with:
 * - All Jobs tab + 6 Access Vault tabs
 * - Exact 12 columns per tab
 * - Navy Dark Header (#15202C), white bold font
 * - Auto-column widths and auto-filters
 */
export function exportToMultiTabExcel(
  allJobs = [],
  filename = "Website_Load_Export.xlsx",
  tabs = WORKBOOK_TABS
) {
  const cleanFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  const workbookTabs = Array.isArray(tabs) && tabs.length > 0 ? tabs : WORKBOOK_TABS;

  // [Content_Types].xml
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${workbookTabs
    .map(
      (_, i) =>
        `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    ).join("\n  ")}
</Types>`;

  // _rels/.rels
  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  // xl/_rels/workbook.xml.rels
  const wbRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  ${workbookTabs
    .map(
      (_, i) =>
        `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`
    ).join("\n  ")}
</Relationships>`;

  // xl/workbook.xml
  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${workbookTabs
      .map(
        (name, i) =>
          `<sheet name="${xmlEscape(String(name).slice(0, 31))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`
      ).join("\n    ")}
  </sheets>
</workbook>`;

  // xl/styles.xml
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><name val="Calibri"/><sz val="11"/></font>
    <font><b/><name val="Calibri"/><sz val="11"/><color rgb="FFFFFFFF"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF15202C"/></patternFill></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="4">
    <!-- 0: General Normal -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"><alignment vertical="center"/></xf>
    <!-- 1: Navy Dark Header (#15202C), bold white font, centered -->
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 2: Normal Centered (S.No, Job ID, Date) -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <!-- 3: Normal Left (Role, Company, Details, Apply with wrap) -->
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
  </cellXfs>
</styleSheet>`;

  const files = [
    { name: "[Content_Types].xml", data: contentTypesXml },
    { name: "_rels/.rels", data: rootRelsXml },
    { name: "xl/workbook.xml", data: workbookXml },
    { name: "xl/styles.xml", data: stylesXml },
    { name: "xl/_rels/workbook.xml.rels", data: wbRelsXml },
  ];

  workbookTabs.forEach((tabName, i) => {
    const tabJobs = getJobsForTab(tabName, allJobs);
    files.push({
      name: `xl/worksheets/sheet${i + 1}.xml`,
      data: buildWorksheetXml(tabJobs),
    });
  });

  const zipBytes = createZipBuffer(files);
  const blob = new Blob([zipBytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerBrowserDownload(blob, cleanFilename);
}

/**
 * Builds query string for backend /api/export.csv and /api/export.xlsx endpoints
 */
function buildExportQuery(filters = {}) {
  const params = new URLSearchParams();
  if (filters.vault && filters.vault !== "all") params.set("vault", filters.vault);
  if (filters.source && filters.source !== "all") params.set("source", filters.source);
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.search && String(filters.search).trim()) {
    params.set("search", String(filters.search).trim());
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function extractFilenameFromHeader(disposition, fallback) {
  if (!disposition) return fallback;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
  return match?.[1] ? match[1].trim() : fallback;
}

async function downloadFromBackendEndpoint(endpoint, defaultFilename, filters = {}) {
  const qs = buildExportQuery(filters);
  const url = `${API_BASE_URL}${endpoint}${qs}`;
  const headers = new Headers();
  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) {
    throw new Error(`Export failed with status ${res.status}`);
  }

  const filename = extractFilenameFromHeader(
    res.headers.get("content-disposition"),
    defaultFilename
  );
  const blob = await res.blob();
  triggerBrowserDownload(blob, filename);
  return { source: "server", filename };
}

/**
 * Downloads the multi-tab Excel workbook from GET /api/export.xlsx
 * (with client-side multi-tab fallback if server request fails).
 */
export async function downloadBackendExcel(jobs = [], customTabs = null, filters = {}) {
  try {
    return await downloadFromBackendEndpoint(
      "/api/export.xlsx",
      "Website_Load_Export.xlsx",
      filters
    );
  } catch {
    const syncedJobs = jobs.filter((j) => !j.status || j.status === "synced");
    const exportRows = sortJobsNewestFirst(
      syncedJobs.length > 0 ? syncedJobs : jobs
    );
    exportToMultiTabExcel(
      exportRows,
      "Website_Load_Export.xlsx",
      customTabs || WORKBOOK_TABS
    );
    return { source: "fallback", filename: "Website_Load_Export.xlsx" };
  }
}

/**
 * Downloads the CSV export from GET /api/export.csv
 * (with client-side 12-column CSV fallback if server request fails).
 */
export async function downloadBackendCsv(
  jobs = [],
  filters = {},
  fallbackFilename = `Website_Load_Export_${Date.now()}.csv`
) {
  try {
    return await downloadFromBackendEndpoint(
      "/api/export.csv",
      "Website_Load_Export.csv",
      filters
    );
  } catch {
    exportToCsv(jobs, fallbackFilename);
    return { source: "fallback", filename: fallbackFilename };
  }
}

/**
 * 2. CLIPBOARD COPY FOR EXCEL (12 Columns Tab-Separated)
 */
export async function copyToClipboardAsExcel(jobs = []) {
  const headers = CLIENT_EXCEL_COLUMNS.map((c) => c.label);
  const rows = jobs.map((job, idx) => getJobRowValues(job, idx));

  const tsv = [
    headers.join("\t"),
    ...rows.map((row) =>
      row.map((val) => String(val).replace(/[\t\n\r]/g, " ")).join("\t")
    ),
  ].join("\n");

  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(tsv);
    return true;
  }
  return false;
}

/**
 * 3. STANDARDIZED 12-COLUMN CSV EXPORT
 */
export function exportToCsv(jobs = [], filename = `jobvault_export_${Date.now()}.csv`) {
  const headers = CLIENT_EXCEL_COLUMNS.map((c) => `"${c.label}"`);
  const rows = jobs.map((job, idx) => {
    return getJobRowValues(job, idx).map(
      (val) => `"${String(val).replace(/"/g, '""')}"`
    );
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerBrowserDownload(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}
