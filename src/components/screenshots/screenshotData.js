// Screenshot pipeline stages and labels
export const SRC_COLORS = {
  WhatsApp: ["#075E54", "#E6DDD4", "#FFFFFF"],
  LinkedIn: ["#FFFFFF", "#F3F2EF", "#FFFFFF"],
  Telegram: ["#2A86C9", "#C9DDEB", "#FFFFFF"],
  Instagram: ["#C13584", "#1C1C1C", "#262626"],
  PDF: ["#DC2626", "#F8FAFC", "#FFFFFF"],
  Other: ["#7A8696", "#EBEFF3", "#FFFFFF"],
};

export const TITLES = {
  WhatsApp: "Jobs Dehradun Group",
  LinkedIn: "LinkedIn",
  Telegram: "Remote Jobs Daily",
  Instagram: "@hiring.india",
  PDF: "PDF Document",
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
 * Generates an SVG Data URL (retained for legacy components still transitioning to API)
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

export const DEMO_ITEMS = [
  { app: "LinkedIn", text: "Senior Data Analyst" },
  { app: "WhatsApp", text: "Customer Support Executive" },
  { app: "Telegram", text: "Frontend Developer (React)" },
  { app: "LinkedIn", text: "Marketing Manager" },
  { app: "Instagram", text: "Content Writer" },
  { app: "WhatsApp", text: "Sales Manager - B2B" },
  { app: "LinkedIn", text: "Head of Engineering" },
  { app: "Telegram", text: "Business Analyst" },
  { app: "WhatsApp", text: "Accounts Assistant" },
  { app: "LinkedIn", text: "Supply Chain Lead" },
  { app: "Telegram", text: "Machine Learning Engineer" },
  { app: "WhatsApp", text: "Operations Executive" },
];
