// Platform brand colors and titles
export const SRC_COLORS = {
  WhatsApp: ["#075E54", "#E6DDD4", "#FFFFFF"],
  LinkedIn: ["#FFFFFF", "#F3F2EF", "#FFFFFF"],
  Telegram: ["#2A86C9", "#C9DDEB", "#FFFFFF"],
  Instagram: ["#C13584", "#1C1C1C", "#262626"],
  Other: ["#7A8696", "#EBEFF3", "#FFFFFF"],
};

export const TITLES = {
  WhatsApp: "Jobs Dehradun Group",
  LinkedIn: "LinkedIn",
  Telegram: "Remote Jobs Daily",
  Instagram: "@hiring.india",
  Other: "Job Board",
};

export const STAGES = ["received", "reading", "verifying", "sorting", "saved"];

export const STAGE_LABEL = {
  received: "Waiting in queue",
  reading: "AI is reading the image",
  verifying: "Checking every value against the text",
  sorting: "Skipping duplicates, sorting to vault",
  saved: "Done",
  failed: "Failed",
};

const xml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      }[c])
  );

/**
 * Generates an SVG Data URL resembling an authentic chat / post screenshot
 */
export function shotSvg(app = "WhatsApp", text = "Job Details") {
  const [bar, bg, bubble] = SRC_COLORS[app] || SRC_COLORS.WhatsApp;
  const dark = app === "Instagram";
  const lines = [];

  text.split("\n").forEach((l) => {
    let line = l;
    while (line.length > 30) {
      const i = line.lastIndexOf(" ", 30) > 10 ? line.lastIndexOf(" ", 30) : 30;
      lines.push(line.slice(0, i));
      line = line.slice(i).trim();
    }
    lines.push(line);
  });

  const h = Math.min(460, 40 + lines.length * 24);
  const barTxt = app === "LinkedIn" ? "#0A66C2" : "#FFFFFF";
  const t = lines
    .map(
      (l, i) =>
        `<text x="38" y="${132 + i * 24}" font-size="15" font-weight="${
          i === 0 || /^(role|\*)/i.test(l) ? 700 : 400
        }" fill="${dark ? "#FFFFFF" : "#111111"}">${xml(l)}</text>`
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640" font-family="Arial,Helvetica,sans-serif">
  <rect width="360" height="640" fill="${bg}"/>
  <rect width="360" height="64" fill="${bar}"/>
  ${app === "LinkedIn" ? '<rect y="63" width="360" height="1" fill="#DDDDDD"/>' : ""}
  <circle cx="34" cy="32" r="16" fill="${
    app === "LinkedIn" ? "#0A66C2" : "rgba(255,255,255,.35)"
  }"/>
  <text x="60" y="38" font-size="16" font-weight="700" fill="${barTxt}">${xml(
    TITLES[app] || "Chat"
  )}</text>
  <rect x="22" y="96" width="316" height="${h}" rx="12" fill="${bubble}"/>
  ${t}
  <text x="320" y="${96 + h - 10}" font-size="11" fill="#8696A0" text-anchor="end">16:41</text>
</svg>`;

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

// 12 Demo datasets from the reference
export const DEMO_ITEMS = [
  {
    app: "LinkedIn",
    text: "Northwind Analytics is hiring!\nRole: Senior Data Analyst\nLocation: Bengaluru (Hybrid)\nExperience: 5-8 years\nCTC: ₹18–24 LPA\nApply: careers.northwind.in/da-114",
    title: "Senior Data Analyst",
    company: "Northwind Analytics",
    location: "Bengaluru",
    status: "synced",
  },
  {
    app: "WhatsApp",
    text: "*Job Opening*\nCustomer Support Executive\nHimal BPO Services, Dehradun\nFreshers can apply\nSalary 2.8 - 3.6 LPA\nWalk-in: Rajpur Road, 10 AM",
    title: "Customer Support Executive",
    company: "Himal BPO Services",
    location: "Dehradun",
    status: "synced",
  },
  {
    app: "Telegram",
    text: "Frontend Developer (React)\nLumen Stack · Remote, work from anywhere\n2-4 yrs experience\n$40-55k / yr\nlumenstack.io/jobs/fe",
    title: "Frontend Developer (React)",
    company: "Lumen Stack",
    location: "Remote",
    status: "synced",
  },
  {
    app: "LinkedIn",
    text: "Sandline Retail is hiring\nMarketing Manager\nDubai, UAE\n7-10 years\nAED 22,000 / month\nsandline.ae/careers",
    title: "Marketing Manager",
    company: "Sandline Retail",
    location: "Dubai, UAE",
    status: "duplicate",
  },
  {
    app: "Instagram",
    text: "WE ARE HIRING\nContent Writer\nFreshers welcome!!\nSend CV - link in bio",
    title: "Content Writer",
    company: "Company unclear",
    location: "Location unclear",
    status: "review",
  },
  {
    app: "WhatsApp",
    text: "*Urgent hiring*\nSales Manager - B2B\nVantage Polymers, Noida\nExp: 5 yr / 3 yr (unclear)\nCTC ₹8-10 LPA + incentives\nCall 99xxxx4471",
    title: "Sales Manager - B2B",
    company: "Vantage Polymers",
    location: "Noida",
    status: "review",
  },
  {
    app: "LinkedIn",
    text: "Quickbasket - Head of Engineering\nMumbai\n12-16 years of experience\n₹70-90 LPA\nquickbasket.in/careers",
    title: "Head of Engineering",
    company: "Quickbasket",
    location: "Mumbai",
    status: "synced",
  },
  {
    app: "Telegram",
    text: "Crestview Consulting\nBusiness Analyst · Gurugram · Hybrid\n2-4 yrs\n₹9-12 LPA\ncrestview.co.in/ba",
    title: "Business Analyst",
    company: "Crestview Consulting",
    location: "Gurugram",
    status: "synced",
  },
  {
    app: "WhatsApp",
    text: "*Vacancy*\nAccounts Assistant\nDoon Valley Traders, Dehradun\nExp: 1-2 yrs (Tally)\nSalary 2.4 - 3 LPA\nCall 72xxxx1180",
    title: "Accounts Assistant",
    company: "Doon Valley Traders",
    location: "Dehradun",
    status: "synced",
  },
  {
    app: "LinkedIn",
    text: "Harbourline Logistics\nSupply Chain Lead · Singapore\n8-12 years\nSGD 9,500 / month\nharbourline.sg/careers",
    title: "Supply Chain Lead",
    company: "Harbourline Logistics",
    location: "Singapore",
    status: "synced",
  },
  {
    app: "Telegram",
    text: "Aksha AI\nMachine Learning Engineer\nHyderabad · Hybrid\n3-6 yrs · ₹22-30 LPA\naksha.ai/careers",
    title: "Machine Learning Engineer",
    company: "Aksha AI",
    location: "Hyderabad",
    status: "synced",
  },
  {
    app: "WhatsApp",
    text: "*Hiring*\nOperations Executive\nTarang Foods, Haridwar\nExp: 1-3 yrs\nCTC: 3.5 (per month? year?)\njobs@tarangfoods.in",
    title: "Operations Executive",
    company: "Tarang Foods",
    location: "Haridwar",
    status: "review",
  },
];

// Initial seed matching the exact 14 items shown in the reference image
export const INITIAL_SCREENSHOTS = [
  {
    id: 14,
    filename: "IMG-20261106-WA0191.jpg",
    originalName: "IMG-20261106-WA0191.jpg",
    dateFormatted: "16 Nov, 04:54 am",
    origin: "Uploaded",
    sourceApp: "WhatsApp",
    stage: "saved",
    stageText: "Done",
    image: shotSvg("WhatsApp", DEMO_ITEMS[8].text),
    jobs: [
      {
        id: 1054,
        code: "JV-1054",
        status: "synced",
        statusLabel: "In sheet",
      },
    ],
  },
  {
    id: 13,
    filename: "IMG-20261105-WA0184.jpg",
    originalName: "IMG-20261105-WA0184.jpg",
    dateFormatted: "15 Nov, 04:37 am",
    origin: "Uploaded",
    sourceApp: "WhatsApp",
    stage: "saved",
    stageText: "Done",
    image: shotSvg("WhatsApp", DEMO_ITEMS[5].text),
    jobs: [
      {
        id: 1053,
        code: "JV-1053",
        status: "review",
        statusLabel: "Needs review",
      },
    ],
  },
  {
    id: 12,
    filename: "IMG-20261104-WA0177.jpg",
    originalName: "IMG-20261104-WA0177.jpg",
    dateFormatted: "14 Nov, 04:20 am",
    origin: "Uploaded",
    sourceApp: "LinkedIn",
    stage: "saved",
    stageText: "Done",
    image: shotSvg("LinkedIn", DEMO_ITEMS[3].text),
    jobs: [
      {
        id: 1052,
        code: "JV-1052",
        status: "duplicate",
        statusLabel: "Duplicate",
      },
    ],
  },
  {
    id: 11,
    filename: "IMG-20261103-WA0170.jpg",
    originalName: "IMG-20261103-WA0170.jpg",
    dateFormatted: "13 Nov, 04:03 am",
    origin: "Uploaded",
    sourceApp: "Instagram",
    stage: "saved",
    stageText: "Done",
    image: shotSvg("Instagram", DEMO_ITEMS[4].text),
    jobs: [
      {
        id: 1051,
        code: "JV-1051",
        status: "review",
        statusLabel: "Needs review",
      },
    ],
  },
  {
    id: 10,
    filename: "IMG-20261102-WA0163.jpg",
    originalName: "IMG-20261102-WA0163.jpg",
    dateFormatted: "12 Nov, 03:46 am",
    origin: "Uploaded",
    sourceApp: "Telegram",
    stage: "saved",
    stageText: "Done",
    image: shotSvg("Telegram", DEMO_ITEMS[10].text),
    jobs: [
      {
        id: 1050,
        code: "JV-1050",
        status: "synced",
        statusLabel: "In sheet",
      },
    ],
  },
  {
    id: 9,
    filename: "IMG-20261101-WA0156.jpg",
    originalName: "IMG-20261101-WA0156.jpg",
    dateFormatted: "11 Nov, 03:29 am",
    origin: "Uploaded",
    sourceApp: "WhatsApp",
    stage: "saved",
    stageText: "Done",
    image: shotSvg("WhatsApp", DEMO_ITEMS[11].text),
    jobs: [
      {
        id: 1049,
        code: "JV-1049",
        status: "review",
        statusLabel: "Needs review",
      },
    ],
  },
  {
    id: 8,
    filename: "IMG-20261031-WA0149.jpg",
    originalName: "IMG-20261031-WA0149.jpg",
    dateFormatted: "10 Nov, 03:12 am",
    origin: "Uploaded",
    sourceApp: "LinkedIn",
    stage: "saved",
    stageText: "Done",
    image: shotSvg("LinkedIn", DEMO_ITEMS[0].text),
    jobs: [
      {
        id: 1048,
        code: "JV-1048",
        status: "synced",
        statusLabel: "In sheet",
      },
    ],
  },
  {
    id: 7,
    filename: "IMG-20261030-WA0142.jpg",
    originalName: "IMG-20261030-WA0142.jpg",
    dateFormatted: "09 Nov, 02:55 am",
    origin: "Uploaded",
    sourceApp: "LinkedIn",
    stage: "saved",
    stageText: "Done",
    image: shotSvg("LinkedIn", DEMO_ITEMS[6].text),
    jobs: [
      {
        id: 1047,
        code: "JV-1047",
        status: "synced",
        statusLabel: "In sheet",
      },
    ],
  },
  {
    id: 6,
    filename: "IMG-20261029-WA0135.jpg",
    originalName: "IMG-20261029-WA0135.jpg",
    dateFormatted: "08 Nov, 02:38 am",
    origin: "Uploaded",
    sourceApp: "LinkedIn",
    stage: "saved",
    stageText: "Done",
    image: shotSvg("LinkedIn", DEMO_ITEMS[9].text),
    jobs: [
      {
        id: 1046,
        code: "JV-1046",
        status: "synced",
        statusLabel: "In sheet",
      },
    ],
  },
  {
    id: 5,
    filename: "IMG-20261028-WA0128.jpg",
    originalName: "IMG-20261028-WA0128.jpg",
    dateFormatted: "07 Nov, 02:21 am",
    origin: "Uploaded",
    sourceApp: "Telegram",
    stage: "saved",
    stageText: "Done",
    image: shotSvg("Telegram", DEMO_ITEMS[2].text),
    jobs: [
      {
        id: 1045,
        code: "JV-1045",
        status: "synced",
        statusLabel: "In sheet",
      },
    ],
  },
  {
    id: 4,
    filename: "IMG-20261027-WA0121.jpg",
    originalName: "IMG-20261027-WA0121.jpg",
    dateFormatted: "06 Nov, 02:04 am",
    origin: "Uploaded",
    sourceApp: "Telegram",
    stage: "saved",
    stageText: "Done",
    image: shotSvg("Telegram", DEMO_ITEMS[7].text),
    jobs: [
      {
        id: 1044,
        code: "JV-1044",
        status: "synced",
        statusLabel: "In sheet",
      },
    ],
  },
  {
    id: 3,
    filename: "IMG-20261026-WA0114.jpg",
    originalName: "IMG-20261026-WA0114.jpg",
    dateFormatted: "05 Nov, 01:47 am",
    origin: "Uploaded",
    sourceApp: "WhatsApp",
    stage: "saved",
    stageText: "Done",
    image: shotSvg("WhatsApp", DEMO_ITEMS[1].text),
    jobs: [
      {
        id: 1043,
        code: "JV-1043",
        status: "synced",
        statusLabel: "In sheet",
      },
    ],
  },
  {
    id: 2,
    filename: "IMG-20261025-WA0107.jpg",
    originalName: "IMG-20261025-WA0107.jpg",
    dateFormatted: "04 Nov, 01:30 am",
    origin: "Uploaded",
    sourceApp: "LinkedIn",
    stage: "saved",
    stageText: "Done",
    image: shotSvg("LinkedIn", DEMO_ITEMS[3].text),
    jobs: [
      {
        id: 1042,
        code: "JV-1042",
        status: "synced",
        statusLabel: "In sheet",
      },
    ],
  },
  {
    id: 1,
    filename: "IMG-20261024-WA0100.jpg",
    originalName: "IMG-20261024-WA0100.jpg",
    dateFormatted: "03 Nov, 01:13 am",
    origin: "Uploaded",
    sourceApp: "LinkedIn",
    stage: "saved",
    stageText: "Done",
    image: shotSvg("LinkedIn", DEMO_ITEMS[0].text),
    jobs: [
      {
        id: 1041,
        code: "JV-1041",
        status: "synced",
        statusLabel: "In sheet",
      },
    ],
  },
];

