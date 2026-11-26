import { shotSvg, DEMO_ITEMS } from "../screenshots/screenshotData";

export const VAULTS = [
  "India · Fresher",
  "India · Junior",
  "India · Mid-level",
  "India · Senior",
  "Global",
  "Remote",
];

export const SOURCES = [
  "WhatsApp",
  "Telegram",
  "Instagram",
  "LinkedIn",
  "Other",
];

export const SOURCE_COLORS = {
  WhatsApp: "#25A35A",
  LinkedIn: "#0A66C2",
  Telegram: "#2A86C9",
  Instagram: "#D6336C",
  PDF: "#DC2626",
  Other: "#7A8696",
};

/**
 * Returns the client-standard vault prefix according to specification:
 * C-: Early Career (0–2 yrs, Freshers)
 * M-: Management (2–10 yrs, Junior & Mid-level)
 * L-: Leadership (10–15 yrs, Senior)
 * E-: Executive (15+ yrs, CXO, VP)
 * R-: Remote (Remote, Anywhere)
 * G-: UAE & Global (International)
 */
export function getVaultPrefix(vault = "") {
  const v = (vault || "").toLowerCase();
  if (v.includes("remote")) return "R";
  if (v.includes("global") || v.includes("uae")) return "G";
  if (v.includes("senior") || v.includes("leadership")) return "L";
  if (v.includes("executive") || v.includes("cxo") || v.includes("director")) return "E";
  if (v.includes("junior") || v.includes("mid-level") || v.includes("management")) return "M";
  if (v.includes("fresher") || v.includes("early career") || v.includes("intern")) return "C";
  return "C";
}

/**
 * Generates a client-standard formatted Job ID: [Prefix]-[DDMMYY]-[NN]
 * e.g., C-161126-01, R-191126-01, M-211126-02
 */
export function formatClientJobId(vault = "India · Fresher", dateInput = new Date(), sequence = 1) {
  const prefix = getVaultPrefix(vault);
  let d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) d = new Date();

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  const seqStr = String(sequence).padStart(2, "0");

  return `${prefix}-${dd}${mm}${yy}-${seqStr}`;
}

/**
 * Cross-Vault Dual-Routing Engine:
 * When a job is marked as Remote, it is routed to "Remote" AND placed into the matching experience tier.
 * Returns an array of vault names: e.g. ["Remote", "India · Fresher"] or ["India · Junior"]
 */
export function getJobVaults(job) {
  if (!job) return ["India · Fresher"];
  if (Array.isArray(job.vaults) && job.vaults.length > 0) {
    return job.vaults;
  }

  const v = (job.vault || "").toLowerCase();
  const mode = (job.work_mode || "").toLowerCase();
  const loc = (job.location || "").toLowerCase();
  const exp = (job.experience || "").toLowerCase();
  const expMin = job.exp_min != null && job.exp_min !== "" ? Number(job.exp_min) : null;
  const country = (job.country || "").toLowerCase();

  const isRemote =
    v.includes("remote") ||
    mode.includes("remote") ||
    loc.includes("remote") ||
    loc.includes("wfh");

  const isGlobal =
    (v.includes("global") ||
      v.includes("uae") ||
      loc.includes("dubai") ||
      loc.includes("uae") ||
      (country && country !== "india")) &&
    !isRemote;

  if (isGlobal) {
    return ["Global"];
  }

  // Determine experience tier
  let expTier = "India · Fresher";
  if (expMin != null && !isNaN(expMin)) {
    if (expMin < 2) expTier = "India · Fresher";
    else if (expMin < 5) expTier = "India · Junior";
    else if (expMin < 10) expTier = "India · Mid-level";
    else expTier = "India · Senior";
  } else {
    if (
      exp.includes("fresher") ||
      exp.includes("0") ||
      exp.includes("1 yr") ||
      exp.includes("1–2") ||
      exp.includes("intern")
    ) {
      expTier = "India · Fresher";
    } else if (
      exp.includes("2") ||
      exp.includes("3") ||
      exp.includes("4") ||
      exp.includes("1-3")
    ) {
      expTier = "India · Junior";
    } else if (
      exp.includes("5") ||
      exp.includes("6") ||
      exp.includes("7") ||
      exp.includes("4–6")
    ) {
      expTier = "India · Mid-level";
    } else if (
      exp.includes("8") ||
      exp.includes("10") ||
      exp.includes("12") ||
      exp.includes("+")
    ) {
      expTier = "India · Senior";
    } else if (v.includes("senior") || v.includes("leadership")) {
      expTier = "India · Senior";
    } else if (v.includes("mid-level") || v.includes("management")) {
      expTier = "India · Mid-level";
    } else if (v.includes("junior")) {
      expTier = "India · Junior";
    }
  }

  if (isRemote) {
    // Cross-Vault Dual-Routing: Routes to Remote AND matching Experience Tier!
    return ["Remote", expTier];
  }

  return [job.vault || expTier];
}

/**
 * Computes Dual-Routing Matrix for rules testing:
 * If Remote, returns [remoteVault, matchedExperienceTier].
 * If international, returns [globalVault].
 * Otherwise, returns [matchedExperienceTier].
 */
export function computeDualVaults({
  country = "India",
  workMode = "Onsite",
  expMin = "0",
  tiers = [],
  remoteVault = "Remote",
  globalVault = "Global",
  homeCountry = "India",
}) {
  const isRemote = (workMode || "").trim().toLowerCase() === "remote";
  const c = (country || "").trim().toLowerCase();
  const hc = (homeCountry || "").trim().toLowerCase();
  const isGlobal = c && hc && c !== hc && !isRemote;

  if (isGlobal) {
    return [globalVault || "Global"];
  }

  // Calculate experience tier
  const numExp = parseFloat(expMin);
  let matchedTier = tiers[0]?.name || "India · Fresher";

  if (!isNaN(numExp) && tiers.length > 0) {
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      if (t.below == null || t.below === "") {
        matchedTier = t.name;
        break;
      }
      if (numExp < parseFloat(t.below)) {
        matchedTier = t.name;
        break;
      }
    }
  }

  if (isRemote) {
    // Automated Dual-Routing Matrix: Remote (Work Mode) + Experience Tier
    return [remoteVault || "Remote", matchedTier];
  }

  return [matchedTier];
}

// 14 Jobs with Client-Standard Job ID Format: [Prefix]-[DDMMYY]-[NN]
export const INITIAL_JOBS = [
  {
    id: 1054,
    code: "C-161126-01",
    job_id: "C-161126-01",
    title: "Accounts Assistant",
    company: "Doon Valley Traders",
    location: "Dehradun",
    country: "India",
    experience: "1–2 yrs",
    exp_min: 1,
    exp_max: 2,
    salary: "2.4 - 3 LPA",
    vault: "India · Fresher",
    source_app: "WhatsApp",
    confidence: 0.93,
    status: "synced", // In sheet
    created_at: "2026-11-16 04:54:00",
    work_mode: "Onsite",
    apply_contact: "Call 72xxxx1180",
    sector: "Finance / Accounts",
    qualification: "B.Com / Tally",
    raw_text: "*Vacancy*\nAccounts Assistant\nDoon Valley Traders, Dehradun\nExp: 1-2 yrs (Tally)\nSalary 2.4 - 3 LPA\nCall 72xxxx1180",
    image: shotSvg("WhatsApp", DEMO_ITEMS[8].text),
    evidence: {
      title: "Accounts Assistant",
      company: "Doon Valley Traders",
      location: "Dehradun",
      exp: "Exp: 1-2 yrs",
      salary: "Salary 2.4 - 3 LPA",
      apply_contact: "Call 72xxxx1180",
    },
    flags: [],
  },
  {
    id: 1053,
    code: "C-151126-02",
    job_id: "C-151126-02",
    title: "Sales Manager - B2B",
    company: "Vantage Polymers",
    location: "Noida",
    country: "India",
    experience: "—",
    exp_min: null,
    exp_max: null,
    salary: "₹8-10 LPA + incentives",
    vault: "India · Fresher",
    source_app: "WhatsApp",
    confidence: 0.52,
    status: "review", // Needs review
    created_at: "2026-11-15 04:37:00",
    work_mode: "Onsite",
    apply_contact: "Call 99xxxx4471",
    sector: "Sales & Marketing",
    qualification: "Graduate",
    raw_text: "*Urgent hiring*\nSales Manager - B2B\nVantage Polymers, Noida\nExp: 5 yr / 3 yr (unclear)\nCTC ₹8-10 LPA + incentives\nCall 99xxxx4471",
    image: shotSvg("WhatsApp", DEMO_ITEMS[5].text),
    evidence: {
      title: "Sales Manager - B2B",
      company: "Vantage Polymers",
      location: "Noida",
      salary: "₹8-10 LPA + incentives",
      apply_contact: "Call 99xxxx4471",
    },
    flags: ["experience"],
  },
  {
    id: 1052,
    code: "G-141126-01",
    job_id: "G-141126-01",
    title: "Marketing Manager",
    company: "Sandline Retail",
    location: "Dubai, UAE",
    country: "UAE",
    experience: "7–10 yrs",
    exp_min: 7,
    exp_max: 10,
    salary: "AED 22,000 / month",
    vault: "Global",
    source_app: "LinkedIn",
    confidence: 0.95,
    status: "duplicate", // Duplicate
    created_at: "2026-11-14 04:20:00",
    work_mode: "Onsite",
    apply_contact: "sandline.ae/careers",
    sector: "Retail",
    qualification: "MBA",
    raw_text: "Sandline Retail is hiring\nMarketing Manager\nDubai, UAE\n7-10 years\nAED 22,000 / month\nsandline.ae/careers",
    image: shotSvg("LinkedIn", DEMO_ITEMS[3].text),
    evidence: {
      title: "Marketing Manager",
      company: "Sandline Retail",
      location: "Dubai, UAE",
      exp: "7-10 years",
      salary: "AED 22,000 / month",
      apply_contact: "sandline.ae/careers",
    },
    flags: [],
  },
  {
    id: 1051,
    code: "C-131126-01",
    job_id: "C-131126-01",
    title: "Content Writer",
    company: "—",
    location: "—",
    country: "India",
    experience: "Fresher",
    exp_min: 0,
    exp_max: null,
    salary: "—",
    vault: "India · Fresher",
    vaults: ["India · Fresher", "Remote"],
    source_app: "Instagram",
    confidence: 0.36,
    status: "review", // Needs review
    created_at: "2026-11-13 04:03:00",
    work_mode: "Remote",
    apply_contact: "link in bio",
    sector: "Media & Content",
    qualification: "English / Mass Comm",
    raw_text: "WE ARE HIRING\nContent Writer\nFreshers welcome!!\nSend CV - link in bio",
    image: shotSvg("Instagram", DEMO_ITEMS[4].text),
    evidence: {
      title: "Content Writer",
      exp: "Freshers welcome",
      apply_contact: "link in bio",
    },
    flags: ["company", "location", "salary"],
  },
  {
    id: 1050,
    code: "M-121126-01",
    job_id: "M-121126-01",
    title: "Machine Learning Engineer",
    company: "Aksha AI",
    location: "Hyderabad",
    country: "India",
    experience: "3–6 yrs",
    exp_min: 3,
    exp_max: 6,
    salary: "₹22-30 LPA",
    vault: "India · Junior",
    source_app: "Telegram",
    confidence: 0.95,
    status: "synced", // In sheet
    created_at: "2026-11-12 03:46:00",
    work_mode: "Hybrid",
    apply_contact: "aksha.ai/careers",
    sector: "Artificial Intelligence",
    qualification: "B.Tech / M.Tech in CS/AI",
    raw_text: "Aksha AI\nMachine Learning Engineer\nHyderabad · Hybrid\n3-6 yrs · ₹22-30 LPA\naksha.ai/careers",
    image: shotSvg("Telegram", DEMO_ITEMS[10].text),
    evidence: {
      title: "Machine Learning Engineer",
      company: "Aksha AI",
      location: "Hyderabad",
      exp: "3-6 yrs",
      salary: "₹22-30 LPA",
      work_mode: "Hybrid",
      apply_contact: "aksha.ai/careers",
    },
    flags: [],
  },
  {
    id: 1049,
    code: "C-111126-01",
    job_id: "C-111126-01",
    title: "Operations Executive",
    company: "Tarang Foods",
    location: "Haridwar",
    country: "India",
    experience: "1–3 yrs",
    exp_min: 1,
    exp_max: 3,
    salary: "—",
    vault: "India · Fresher",
    source_app: "WhatsApp",
    confidence: 0.60,
    status: "review", // Needs review
    created_at: "2026-11-11 03:29:00",
    work_mode: "Onsite",
    apply_contact: "jobs@tarangfoods.in",
    sector: "FMCG / Food Processing",
    qualification: "Any Graduate",
    raw_text: "*Hiring*\nOperations Executive\nTarang Foods, Haridwar\nExp: 1-3 yrs\nCTC: 3.5 (per month? year?)\njobs@tarangfoods.in",
    image: shotSvg("WhatsApp", DEMO_ITEMS[11].text),
    evidence: {
      title: "Operations Executive",
      company: "Tarang Foods",
      location: "Haridwar",
      exp: "Exp: 1-3 yrs",
      apply_contact: "jobs@tarangfoods.in",
    },
    flags: ["salary"],
  },
  {
    id: 1048,
    code: "M-101126-01",
    job_id: "M-101126-01",
    title: "Senior Data Analyst",
    company: "Northwind Analytics",
    location: "Bengaluru",
    country: "India",
    experience: "5–8 yrs",
    exp_min: 5,
    exp_max: 8,
    salary: "₹18–24 LPA",
    vault: "India · Mid-level",
    source_app: "LinkedIn",
    confidence: 0.96,
    status: "duplicate", // Duplicate
    duplicate_of: 1041,
    duplicate_of_code: "M-031126-01",
    original_name: "IMG-20261104-WA0177.jpg",
    created_at: "2026-11-10 04:33:00",
    work_mode: "Hybrid",
    apply_contact: "careers.northwind.in/da-114",
    sector: "—",
    qualification: "—",
    other_details: "—",
    raw_text: "Northwind Analytics is hiring!\nRole: Senior Data Analyst\nLocation: Bengaluru (Hybrid)\nExperience: 5-8 years\nCTC: ₹18–24 LPA\nApply: careers.northwind.in/da-114",
    image: shotSvg("LinkedIn", DEMO_ITEMS[0].text),
    evidence: {
      title: "Senior Data Analyst",
      company: "Northwind Analytics",
      location: "Bengaluru",
      exp: "5-8 years",
      salary: "₹18–24 LPA",
      work_mode: "Hybrid",
      apply_contact: "careers.northwind.in/da-114",
    },
    flags: [],
  },
  {
    id: 1047,
    code: "L-091126-01",
    job_id: "L-091126-01",
    title: "Head of Engineering",
    company: "Quickbasket",
    location: "Mumbai",
    country: "India",
    experience: "12–16 yrs",
    exp_min: 12,
    exp_max: 16,
    salary: "₹70-90 LPA",
    vault: "India · Senior",
    source_app: "LinkedIn",
    confidence: 0.95,
    status: "synced", // In sheet
    created_at: "2026-11-09 02:55:00",
    work_mode: "Onsite",
    apply_contact: "quickbasket.in/careers",
    sector: "E-Commerce / Tech",
    qualification: "B.Tech / M.Tech",
    raw_text: "Quickbasket - Head of Engineering\nMumbai\n12-16 years of experience\n₹70-90 LPA\nquickbasket.in/careers",
    image: shotSvg("LinkedIn", DEMO_ITEMS[6].text),
    evidence: {
      title: "Head of Engineering",
      company: "Quickbasket",
      location: "Mumbai",
      exp: "12-16 years",
      salary: "₹70-90 LPA",
      apply_contact: "quickbasket.in/careers",
    },
    flags: [],
  },
  {
    id: 1046,
    code: "G-081126-01",
    job_id: "G-081126-01",
    title: "Supply Chain Lead",
    company: "Harbourline Logistics",
    location: "Singapore",
    country: "Singapore",
    experience: "8–12 yrs",
    exp_min: 8,
    exp_max: 12,
    salary: "SGD 9,500 / month",
    vault: "Global",
    source_app: "LinkedIn",
    confidence: 0.94,
    status: "synced", // In sheet
    created_at: "2026-11-08 02:38:00",
    work_mode: "Onsite",
    apply_contact: "harbourline.sg/careers",
    sector: "Logistics & Shipping",
    qualification: "Supply Chain Degree",
    raw_text: "Harbourline Logistics\nSupply Chain Lead · Singapore\n8-12 years\nSGD 9,500 / month\nharbourline.sg/careers",
    image: shotSvg("LinkedIn", DEMO_ITEMS[9].text),
    evidence: {
      title: "Supply Chain Lead",
      company: "Harbourline Logistics",
      location: "Singapore",
      exp: "8-12 years",
      salary: "SGD 9,500 / month",
      apply_contact: "harbourline.sg/careers",
    },
    flags: [],
  },
  {
    id: 1045,
    code: "R-071126-01",
    job_id: "R-071126-01",
    title: "Frontend Developer (React)",
    company: "Lumen Stack",
    location: "Remote",
    country: "USA",
    experience: "2–4 yrs",
    exp_min: 2,
    exp_max: 4,
    salary: "$40-55k / yr",
    vault: "Remote",
    vaults: ["Remote", "India · Junior"],
    source_app: "Telegram",
    confidence: 0.93,
    status: "synced", // In sheet
    created_at: "2026-11-07 02:21:00",
    work_mode: "Remote",
    apply_contact: "lumenstack.io/jobs/fe",
    sector: "Software Development",
    qualification: "BCA / MCA / B.Tech",
    raw_text: "Frontend Developer (React)\nLumen Stack · Remote, work from anywhere\n2-4 yrs experience\n$40-55k / yr\nlumenstack.io/jobs/fe",
    image: shotSvg("Telegram", DEMO_ITEMS[2].text),
    evidence: {
      title: "Frontend Developer (React)",
      company: "Lumen Stack",
      location: "Remote",
      exp: "2-4 yrs experience",
      salary: "$40-55k / yr",
      work_mode: "Remote, work from anywhere",
      apply_contact: "lumenstack.io/jobs/fe",
    },
    flags: [],
  },
  {
    id: 1044,
    code: "M-061126-01",
    job_id: "M-061126-01",
    title: "Business Analyst",
    company: "Crestview Consulting",
    location: "Gurugram",
    country: "India",
    experience: "2–4 yrs",
    exp_min: 2,
    exp_max: 4,
    salary: "₹9-12 LPA",
    vault: "India · Junior",
    source_app: "Telegram",
    confidence: 0.94,
    status: "synced", // In sheet
    created_at: "2026-11-06 02:04:00",
    work_mode: "Hybrid",
    apply_contact: "crestview.co.in/ba",
    sector: "Consulting",
    qualification: "MBA / B.Tech",
    raw_text: "Crestview Consulting\nBusiness Analyst · Gurugram · Hybrid\n2-4 yrs\n₹9-12 LPA\ncrestview.co.in/ba",
    image: shotSvg("Telegram", DEMO_ITEMS[7].text),
    evidence: {
      title: "Business Analyst",
      company: "Crestview Consulting",
      location: "Gurugram",
      exp: "2-4 yrs",
      salary: "₹9-12 LPA",
      work_mode: "Hybrid",
      apply_contact: "crestview.co.in/ba",
    },
    flags: [],
  },
  {
    id: 1043,
    code: "C-051126-01",
    job_id: "C-051126-01",
    title: "Customer Support Executive",
    company: "Himal BPO Services",
    location: "Dehradun",
    country: "India",
    experience: "Fresher",
    exp_min: 0,
    exp_max: null,
    salary: "2.8 - 3.6 LPA",
    vault: "India · Fresher",
    source_app: "WhatsApp",
    confidence: 0.92,
    status: "synced", // In sheet
    created_at: "2026-11-05 01:47:00",
    work_mode: "Onsite",
    apply_contact: "Walk-in: Rajpur Road",
    sector: "BPO / Customer Support",
    qualification: "12th Pass / Any Graduate",
    raw_text: "*Job Opening*\nCustomer Support Executive\nHimal BPO Services, Dehradun\nFreshers can apply\nSalary 2.8 - 3.6 LPA\nWalk-in: Rajpur Road, 10 AM",
    image: shotSvg("WhatsApp", DEMO_ITEMS[1].text),
    evidence: {
      title: "Customer Support Executive",
      company: "Himal BPO Services",
      location: "Dehradun",
      exp: "Freshers can apply",
      salary: "Salary 2.8 - 3.6 LPA",
      work_mode: "Walk-in",
      apply_contact: "Walk-in: Rajpur Road",
    },
    flags: [],
  },
  {
    id: 1042,
    code: "G-041126-01",
    job_id: "G-041126-01",
    title: "Marketing Manager",
    company: "Sandline Retail",
    location: "Dubai, UAE",
    country: "UAE",
    experience: "7–10 yrs",
    exp_min: 7,
    exp_max: 10,
    salary: "AED 22,000 / month",
    vault: "Global",
    source_app: "LinkedIn",
    confidence: 0.95,
    status: "synced", // In sheet
    created_at: "2026-11-04 01:30:00",
    work_mode: "Onsite",
    apply_contact: "sandline.ae/careers",
    sector: "Retail",
    qualification: "MBA",
    raw_text: "Sandline Retail is hiring\nMarketing Manager\nDubai, UAE\n7-10 years\nAED 22,000 / month\nsandline.ae/careers",
    image: shotSvg("LinkedIn", DEMO_ITEMS[3].text),
    evidence: {
      title: "Marketing Manager",
      company: "Sandline Retail",
      location: "Dubai, UAE",
      exp: "7-10 years",
      salary: "AED 22,000 / month",
      apply_contact: "sandline.ae/careers",
    },
    flags: [],
  },
  {
    id: 1041,
    code: "M-031126-01",
    job_id: "M-031126-01",
    title: "Senior Data Analyst",
    company: "Northwind Analytics",
    location: "Bengaluru",
    country: "India",
    experience: "5–8 yrs",
    exp_min: 5,
    exp_max: 8,
    salary: "₹18–24 LPA",
    vault: "India · Mid-level",
    source_app: "LinkedIn",
    confidence: 0.96,
    status: "synced", // In sheet
    created_at: "2026-11-03 01:13:00",
    work_mode: "Hybrid",
    apply_contact: "careers.northwind.in/da-114",
    sector: "Analytics",
    qualification: "B.Tech / M.Sc Data Science",
    raw_text: "Northwind Analytics is hiring!\nRole: Senior Data Analyst\nLocation: Bengaluru (Hybrid)\nExperience: 5-8 years\nCTC: ₹18–24 LPA\nApply: careers.northwind.in/da-114",
    image: shotSvg("LinkedIn", DEMO_ITEMS[0].text),
    evidence: {
      title: "Senior Data Analyst",
      company: "Northwind Analytics",
      location: "Bengaluru",
      exp: "5-8 years",
      salary: "₹18–24 LPA",
      work_mode: "Hybrid",
      apply_contact: "careers.northwind.in/da-114",
    },
    flags: [],
  },
];

