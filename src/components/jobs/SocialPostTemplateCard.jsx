import { useState, useEffect } from "react";
import { FiImage } from "react-icons/fi";
import hiringGirlIllustration from "../../assets/hiring-girl-megaphone.jpg";

/* ------------------------------------------------------------------ */
/*  Design tokens (shared by the React preview and the PNG export)     */
/* ------------------------------------------------------------------ */
const C = {
  navy: "#1F392B",
  ink: "#385444",
  green: "#285B3B",
  greenMid: "#4C9A68",
  greenDeep: "#1F4D32",
  greenSoft: "#E4F1E7",
  gold: "#B7D9C0",
  line: "#DCE9DF",
};
const FONT = `"Arial","Helvetica Neue",Helvetica,sans-serif`;
const HIRING_FONT = `"Kaushan Script","Brush Script MT",cursive`;
const font = (w, s) => `${w} ${s}px ${FONT}`;

/* ------------------------------------------------------------------ */
/*  Parsing                                                            */
/* ------------------------------------------------------------------ */
function stripDecorations(text) {
  return String(text || "")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$2")
    .replace(/\*\*/g, "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\uFE0F]/gu, "")
    .replace(/^[•\-–—*>\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitLabelAndValue(cleanedLine) {
  // Split only on ":" or spaced " - " / " — " / " – " (never hyphenated words)
  const match = cleanedLine.match(/^([^:—–-]{2,36}?)(?::\s+|\s+[—–-]\s+)(.+)$/);
  if (match) return { title: match[1].trim(), subtitle: match[2].trim() };
  return { title: cleanedLine, subtitle: "" };
}

function extractHashtagsFromText(postText) {
  const matches = String(postText || "").match(/#[A-Za-z0-9_]+/g);
  if (!matches) return [];
  return Array.from(new Set(matches));
}

const BULLET_RE = /^(?:[•\-–—]\s|\*(?!\*)\s?)/;

function isHeadingLine(raw, cleaned) {
  const cleanRaw = String(raw || "").trim();
  const endsWithPunct = /[?:]$/.test(cleaned);
  if (!endsWithPunct && !/\*\*[^*]+[?:]?\*\*$/.test(cleanRaw)) return false;
  if (BULLET_RE.test(cleanRaw)) return false;
  if (cleaned.length > 65) return false;
  return (
    endsWithPunct ||
    /^(?:key opportunity details|why\b|what we offer|highlights|benefits|responsibilities|description)/i.test(
      cleaned
    )
  );
}

const usable = (v) =>
  v && !/^(—|-|–|not stated|not specified|unclear|n\/a)$/i.test(String(v).trim());

function parseGeneratedPostToTemplate(job, postText) {
  const rawLines = String(postText || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !/^[━─=]{3,}$/.test(l));

  let headlineFromPost = "";
  let sectionHeading = "";
  const introParagraphs = [];
  const closingParagraphs = [];
  let applyLine = "";
  const highlights = [];

  for (const raw of rawLines) {
    if (/^(?:#[A-Za-z0-9_]+\s*)+$/.test(raw)) continue;

    const cleaned = stripDecorations(raw);
    if (!cleaned) continue;

    // Apply / Contact CTA lines
    if (
      /^(?:📩|👉|🔗|📞|☎️|✉️)?\s*(?:how to apply|apply now|ready to take|interested candidates|send your resume|contact us|dm us)/i.test(
        raw
      ) ||
      /\bapply\s+(?:now|here|directly|via)\b/i.test(cleaned)
    ) {
      if (!/^how to apply:?$/i.test(cleaned)) {
        const qSplit = cleaned.match(/^([^?]+\?)\s+(.+)$/);
        if (qSplit) {
          closingParagraphs.push(qSplit[1].trim());
          const afterColon = qSplit[2].match(/^.*?:\s*(.+)$/);
          applyLine = afterColon?.[1]?.trim() || qSplit[2].trim();
        } else {
          const afterColon = cleaned.match(/^.*?:\s*(.+)$/);
          applyLine = afterColon?.[1]?.trim() || cleaned;
        }
      }
      continue;
    }

    // Opening hook line
    if (
      !headlineFromPost &&
      highlights.length === 0 &&
      introParagraphs.length === 0 &&
      (/^(?:we are hiring|new job alert|hiring now|job alert)/i.test(cleaned) ||
        (/opportunity!?$/i.test(cleaned) && cleaned.length <= 50))
    ) {
      const pipeSplit = cleaned.split("|");
      if (pipeSplit.length > 1) {
        headlineFromPost = pipeSplit.slice(1).join(" ").trim();
      } else {
        const colonSplit = cleaned.match(/^[^:]+:\s*(.+)$/);
        headlineFromPost = (colonSplit?.[1] || cleaned).replace(/!+$/, "").trim();
      }
      continue;
    }

    // Headings: the first one is the section title, later ones become group labels
    if (isHeadingLine(raw, cleaned)) {
      const text = cleaned.replace(/:$/, "");
      if (!/^(?:description|how to apply)$/i.test(text)) {
        if (!sectionHeading) sectionHeading = text;
        else highlights.push({ type: "heading", title: text, subtitle: "" });
      }
      continue;
    }

    const isBullet =
      BULLET_RE.test(raw) ||
      /^[\u{1F000}-\u{1FAFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u.test(raw);

    if (isBullet) {
      const item = splitLabelAndValue(cleaned);
      // A lone exclamation line before any real point is an intro, not a feature
      if (!item.subtitle && highlights.length === 0 && /!$/.test(item.title)) {
        introParagraphs.push(item.title);
      } else {
        highlights.push({ type: "item", ...item });
      }
      continue;
    }

    if (highlights.length === 0 && !sectionHeading) introParagraphs.push(cleaned);
    else closingParagraphs.push(cleaned);
  }

  const rawTitle =
    job?.title && job.title !== "Role unclear" ? job.title.trim() : "";
  const company =
    job?.company && job.company !== "Company unclear" ? job.company.trim() : "";
  const location =
    job?.location && job.location !== "Location unclear"
      ? job.location.trim()
      : "";
  const workMode =
    job?.work_mode && job.work_mode !== "Not stated" ? job.work_mode.trim() : "";

  const headline =
    rawTitle ||
    headlineFromPost ||
    (workMode.toLowerCase().includes("remote") ||
    /work from home|remote/i.test(postText || "")
      ? "Remote Job Opportunity"
      : "Career Opportunity");

  // Key facts strip (only real job data, never invented)
  const meta = [];
  if (location) meta.push({ label: "Location", value: location });
  if (workMode && !location.toLowerCase().includes(workMode.toLowerCase()))
    meta.push({ label: "Work mode", value: workMode });
  if (usable(job?.experience))
    meta.push({ label: "Experience", value: String(job.experience).trim() });
  if (usable(job?.salary))
    meta.push({ label: "Salary", value: String(job.salary).trim() });
  if (usable(job?.qualification))
    meta.push({ label: "Qualification", value: String(job.qualification).trim() });

  const footerNote =
    closingParagraphs.join(" ") ||
    (company ? `Hiring at ${company}` : "Join our growing team today");

  const applyValue =
    applyLine ||
    (usable(job?.apply_contact) ? job.apply_contact.trim() : "") ||
    "Message / Apply Directly";

  const formatHeadline = (str) =>
    String(str || "")
      .trim()
      .split(/\s+/)
      .map((w) => {
        if (!w) return "";
        const alphaOnly = w.replace(/[^a-zA-Z]/g, "");
        if (alphaOnly.length >= 2 && alphaOnly.length <= 4 && alphaOnly === alphaOnly.toUpperCase()) {
          return w;
        }
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(" ");

  return {
    headline: formatHeadline(headline),
    company,
    meta: meta.slice(0, 4),
    introParagraphs,
    sectionHeading,
    highlights,
    footerNote,
    applyValue,
    hashtags: extractHashtagsFromText(postText),
  };
}

/* ------------------------------------------------------------------ */
/*  Canvas helpers                                                     */
/* ------------------------------------------------------------------ */
function wrapCanvasText(ctx, text, maxWidth) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function rr(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

let cachedCleanGirlCanvas = null;
function getTransparentGirlCanvas(girlImg) {
  if (cachedCleanGirlCanvas) return cachedCleanGirlCanvas;
  const w = girlImg.naturalWidth || girlImg.width;
  const h = girlImg.naturalHeight || girlImg.height;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const cctx = c.getContext("2d");
  cctx.drawImage(girlImg, 0, 0);

  try {
    const imgData = cctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    const total = w * h;
    const visited = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    const isExteriorBg = (idx) => {
      const p = idx * 4;
      const r = d[p];
      const g = d[p + 1];
      const b = d[p + 2];
      const minC = Math.min(r, g, b);
      const maxC = Math.max(r, g, b);
      return minC > 228 && maxC - minC < 22;
    };

    const pushIfBg = (x, y) => {
      const idx = y * w + x;
      if (!visited[idx] && isExteriorBg(idx)) {
        visited[idx] = 1;
        queue[tail++] = idx;
      }
    };

    for (let x = 0; x < w; x++) {
      pushIfBg(x, 0);
      pushIfBg(x, h - 1);
    }
    for (let y = 1; y < h - 1; y++) {
      pushIfBg(0, y);
      pushIfBg(w - 1, y);
    }

    while (head < tail) {
      const idx = queue[head++];
      d[idx * 4 + 3] = 0;
      const x = idx % w;
      const y = (idx - x) / w;
      if (x > 0) pushIfBg(x - 1, y);
      if (x + 1 < w) pushIfBg(x + 1, y);
      if (y > 0) pushIfBg(x, y - 1);
      if (y + 1 < h) pushIfBg(x, y + 1);
    }

    // Soften 1px fringe around transparent boundary
    for (let idx = 0; idx < total; idx++) {
      if (visited[idx]) continue;
      const x = idx % w;
      const y = (idx - x) / w;
      const touchesTransparent =
        (x > 0 && visited[idx - 1]) ||
        (x + 1 < w && visited[idx + 1]) ||
        (y > 0 && visited[idx - w]) ||
        (y + 1 < h && visited[idx + w]);
      if (touchesTransparent) {
        const p = idx * 4;
        const lum = (d[p] + d[p + 1] + d[p + 2]) / 3;
        if (lum > 210) {
          d[p + 3] = Math.min(d[p + 3], 130);
        }
      }
    }

    cctx.putImageData(imgData, 0, 0);
  } catch {
    // fallback safely if canvas read fails
  }

  cachedCleanGirlCanvas = c;
  return c;
}

function panel(ctx, x, y, w, h, r, accent) {
  ctx.save();
  ctx.shadowColor = "rgba(19, 35, 58, 0.10)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1.5;
  rr(ctx, x, y, w, h, r);
  ctx.stroke();
  if (accent) {
    ctx.save();
    rr(ctx, x, y, w, h, r);
    ctx.clip();
    ctx.fillStyle = accent;
    ctx.fillRect(x, y, 7, h);
    ctx.restore();
  }
}

function sectionLabel(ctx, text, x, y, w, size, color) {
  ctx.font = font(800, size);
  const lines = wrapCanvasText(ctx, text, w);
  ctx.fillStyle = color;
  const lh = size + 10;
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  if (lines.length === 1) {
    const tw = ctx.measureText(lines[0]).width;
    if (w - tw > 80) {
      ctx.fillStyle = C.line;
      ctx.fillRect(x + tw + 22, y + size / 2, w - tw - 22, 2);
    }
  }
  return y + lines.length * lh + 16;
}

/* ------------------------------------------------------------------ */
/*  Canvas drawing                                                     */
/* ------------------------------------------------------------------ */
function drawBackground(ctx, W, H) {
  ctx.fillStyle = "#F8FAF7";
  ctx.fillRect(0, 0, W, H);

  // Soft green geometric accents inspired by the reference poster
  ctx.fillStyle = "#E4F1E7";
  ctx.beginPath();
  ctx.moveTo(W - 310, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, 360);
  ctx.lineTo(W - 160, 270);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#B8DCC3";
  ctx.beginPath();
  ctx.moveTo(W - 180, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, 210);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = C.greenDeep;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(W - 190, 0);
  ctx.lineTo(W - 190, 80);
  ctx.lineTo(W - 105, 35);
  ctx.lineTo(W - 30, 80);
  ctx.lineTo(W - 30, 170);
  ctx.lineTo(W - 105, 215);
  ctx.lineTo(W - 180, 170);
  ctx.stroke();
}

function drawContent(ctx, data, W, logoImg, girlImg, footerTopY = null) {
  const PAD = 82;
  const CW = W - PAD * 2;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  let y = 74;

  // Brand / logo centered cleanly inside the top-right hexagon frame
  if (logoImg) {
    const scale = Math.min(114 / logoImg.width, 90 / logoImg.height);
    const dw = logoImg.width * scale;
    const dh = logoImg.height * scale;
    const hexCx = W - 108;
    const hexCy = 125;
    ctx.drawImage(logoImg, hexCx - dw / 2, hexCy - dh / 2, dw, dh);
  } else if (data.company) {
    ctx.fillStyle = C.greenDeep;
    ctx.font = font(800, 18);
    ctx.textAlign = "right";
    ctx.fillText(data.company.toUpperCase(), W - PAD, 72, 250);
    ctx.textAlign = "left";
  }

  // Eyebrow and responsive headline. Fit longest word first so titles
  // such as "TECHNO-FUNCTIONAL" never overlap CTA/artwork.
  ctx.fillStyle = C.green;
  ctx.font = font(800, 22);
  ctx.fillText("JOB OPPORTUNITY", PAD, y);
  y += 46;

  const headline = data.headline || "Hiring";
  const headlineMaxWidth = 665;
  let headlineFontSize = 64;
  ctx.fillStyle = C.greenDeep;
  ctx.strokeStyle = C.greenDeep;
  ctx.textAlign = "left";
  while (headlineFontSize > 42) {
    ctx.font = `500 ${headlineFontSize}px ${HIRING_FONT}`;
    const longestWord = headline.split(/\s+/).reduce((a, b) =>
      ctx.measureText(a).width >= ctx.measureText(b).width ? a : b, "");
    if (ctx.measureText(longestWord).width <= headlineMaxWidth) break;
    headlineFontSize -= 2;
  }
  ctx.font = `500 ${headlineFontSize}px ${HIRING_FONT}`;
  ctx.lineWidth = Math.max(1.2, headlineFontSize * 0.025);
  ctx.lineJoin = "round";
  const headlineLines = wrapCanvasText(ctx, headline, headlineMaxWidth).slice(0, 3);
  const headlineLineHeight = Math.round(headlineFontSize * 1.2);
  headlineLines.forEach((line, i) => {
    const lineY = y + i * headlineLineHeight;
    // Subtle same-color stroke simulates clean 500 weight on single-weight brush script
    ctx.strokeText(line, PAD, lineY, headlineMaxWidth);
    ctx.fillText(line, PAD, lineY, headlineMaxWidth);
  });
  y += headlineLines.length * headlineLineHeight + 18;

  // Small decorative dots
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < 3 ? "#B8DCC3" : "#DCE9DF";
    ctx.beginPath();
    ctx.arc(PAD + i * 27 + 5, y + 7, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Apply circle
  ctx.fillStyle = C.greenMid;
  ctx.beginPath();
  ctx.arc(W - PAD - 100, 245, 82, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.font = font(900, 24);
  ctx.fillText("APPLY", W - PAD - 100, 220);
  ctx.fillText("NOW!", W - PAD - 100, 251);
  ctx.textAlign = "left";

  y += 48;

  // Content column (wraps tightly near annY band so tilted "WE ARE Hiring" never touches text)
  const leftW = 415;
  const colWAtY = (curY) => (curY >= 495 && curY <= 645 ? 345 : leftW);

  if (data.company) {
    ctx.fillStyle = C.green;
    ctx.font = font(800, 25);
    ctx.fillText(data.company.toUpperCase(), PAD, y, colWAtY(y));
    y += 44;
  }

  if (data.meta.length) {
    ctx.fillStyle = C.green;
    ctx.font = font(800, 21);
    ctx.fillText("JOB DETAILS", PAD, y, colWAtY(y));
    y += 34;
    data.meta.slice(0, 4).forEach((m) => {
      const avail = colWAtY(y) - 32;
      ctx.fillStyle = C.greenDeep;
      ctx.beginPath();
      ctx.arc(PAD + 8, y + 12, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.ink;
      ctx.font = font(700, 19);
      const mLines = wrapCanvasText(ctx, `${m.label}: ${m.value}`, avail);
      mLines.forEach((line) => {
        ctx.fillText(line, PAD + 28, y, avail);
        y += 27;
      });
      y += 12;
    });
    y += 12;
  }

  if (data.introParagraphs.length) {
    ctx.fillStyle = C.green;
    ctx.font = font(800, 21);
    ctx.fillText("ABOUT THE ROLE", PAD, y, colWAtY(y));
    y += 34;
    ctx.fillStyle = C.ink;
    ctx.font = font(500, 19);
    data.introParagraphs.forEach((p) => {
      const avail = colWAtY(y);
      const lines = wrapCanvasText(ctx, p, avail);
      lines.forEach((line) => {
        ctx.fillText(line, PAD, y, avail);
        y += 27;
      });
      y += 8;
    });
  }

  if (data.sectionHeading) {
    y += 8;
    const avail = colWAtY(y);
    ctx.fillStyle = C.green;
    ctx.font = font(800, 21);
    const shLines = wrapCanvasText(ctx, data.sectionHeading.toUpperCase(), avail);
    shLines.forEach((line) => {
      ctx.fillText(line, PAD, y, avail);
      y += 28;
    });
    y += 10;
  }

  if (data.highlights.length) {
    data.highlights.forEach((item) => {
      if (item.type === "heading") {
        y += 10;
        const avail = colWAtY(y);
        ctx.fillStyle = C.green;
        ctx.font = font(800, 19);
        const hLines = wrapCanvasText(ctx, item.title, avail);
        hLines.forEach((line) => {
          ctx.fillText(line, PAD, y, avail);
          y += 26;
        });
        y += 6;
      } else {
        const avail = colWAtY(y) - 34;
        ctx.fillStyle = C.green;
        ctx.beginPath();
        ctx.arc(PAD + 8, y + 11, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = C.ink;
        ctx.font = font(700, 18);
        const titleLines = wrapCanvasText(ctx, item.title, avail);
        titleLines.forEach((line) => {
          ctx.fillText(line, PAD + 28, y, avail);
          y += 25;
        });
        if (item.subtitle) {
          ctx.font = font(500, 16);
          const subLines = wrapCanvasText(ctx, item.subtitle, avail);
          subLines.forEach((line) => {
            ctx.fillText(line, PAD + 28, y, avail);
            y += 22;
          });
        }
        y += 8;
      }
    });
  }

  if (data.hashtags.length) {
    y += 8;
    ctx.fillStyle = C.green;
    ctx.font = font(600, 17);
    wrapCanvasText(ctx, data.hashtags.join("   "), leftW).forEach((line) => {
      ctx.fillText(line, PAD, y, leftW);
      y += 24;
    });
  }

  // Right-side girl with loudspeaker aligned up to the upper right area (below APPLY NOW!)
  const gw = 730;
  const gh = 730;
  const gx = 380;
  const gy = 370;
  const panelBottom = footerTopY || Math.max(y, gy + gh + 40);

  if (girlImg) {
    const cleanGirl = getTransparentGirlCanvas(girlImg);
    ctx.save();
    ctx.beginPath();
    ctx.rect(520, 355, W - 520, panelBottom - 355);
    ctx.clip();

    ctx.drawImage(cleanGirl, gx, gy, gw, gh);

    // Smooth organic curved wave along bottom-right to tuck blazer cut cleanly into footer
    const seamY = gy + gh - 24;
    if (panelBottom > seamY) {
      // Soft sage outer curve
      ctx.fillStyle = "#DCE9DF";
      ctx.beginPath();
      ctx.moveTo(570, panelBottom);
      ctx.quadraticCurveTo(790, seamY - 10, W, seamY - 22);
      ctx.lineTo(W, panelBottom);
      ctx.closePath();
      ctx.fill();

      // Thin sunny-gold accent swoop echoing the yellow circle
      ctx.fillStyle = "#F5B700";
      ctx.beginPath();
      ctx.moveTo(640, panelBottom);
      ctx.quadraticCurveTo(845, seamY - 4, W, seamY - 6);
      ctx.lineTo(W, seamY + 14);
      ctx.quadraticCurveTo(855, seamY + 14, 675, panelBottom);
      ctx.closePath();
      ctx.fill();

      // Main deep forest-green wave melting seamlessly into footer bar
      const waveGrad = ctx.createLinearGradient(700, seamY, W, panelBottom);
      waveGrad.addColorStop(0, C.greenMid);
      waveGrad.addColorStop(1, C.greenDeep);
      ctx.fillStyle = waveGrad;
      ctx.beginPath();
      ctx.moveTo(665, panelBottom);
      ctx.quadraticCurveTo(860, seamY + 6, W, seamY + 8);
      ctx.lineTo(W, panelBottom);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  // "WE ARE Hiring" moved forward & tilted along megaphone projection axis (matching reference arc)
  const annX = 448;
  const annY = gy + 152;
  ctx.save();
  ctx.translate(annX, annY);
  ctx.rotate(0.21);
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(248, 250, 247, 0.95)";
  ctx.shadowBlur = 12;

  ctx.fillStyle = C.navy;
  ctx.font = font(900, 24);
  ctx.fillText("WE ARE", 0, 0);

  ctx.fillStyle = C.green;
  ctx.font = `400 52px ${HIRING_FONT}`;
  ctx.fillText("Hiring", -2, 25);

  ctx.shadowBlur = 0;
  ctx.fillStyle = C.greenMid;
  rr(ctx, 0, 92, 92, 5, 2.5);
  ctx.fill();
  ctx.restore();

  return Math.max(y, gy + gh + 35);
}

function measureFooter(ctx, data) {
  ctx.font = font(600, 20);
  const note = wrapCanvasText(ctx, data.footerNote, 500);
  ctx.font = font(700, 21);
  const apply = wrapCanvasText(ctx, data.applyValue, 360);
  return { note, apply, h: 112 };
}

function drawFooter(ctx, W, H, fo) {
  const top = H - fo.h;
  ctx.fillStyle = C.greenDeep;
  ctx.fillRect(0, top, W, fo.h);
  ctx.fillStyle = "#B8DCC3";
  ctx.fillRect(0, top, W, 7);

  ctx.textBaseline = "top";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = font(600, 19);
  let ny = top + 25;
  fo.note.slice(0, 2).forEach((line) => {
    ctx.fillText(line, 55, ny, 470);
    ny += 25;
  });

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(555, top + 22, 2, 68);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = font(800, 17);
  ctx.fillText("HOW TO APPLY", 590, top + 20);
  ctx.font = font(700, 20);
  let ay = top + 48;
  fo.apply.slice(0, 2).forEach((line) => {
    ctx.fillText(line, 590, ay, 420);
    ay += 24;
  });
}

async function renderSocialTemplateCanvas({
  job,
  logoUrl = "",
  postText = "",
}) {
  const data = parseGeneratedPostToTemplate(job, postText);
  const W = 1080;

  try {
    await document.fonts?.load(`500 64px ${HIRING_FONT}`);
    await document.fonts?.load(`400 64px ${HIRING_FONT}`);
    await document.fonts?.load(`400 54px ${HIRING_FONT}`);
    await document.fonts?.load(font(800, 58));
    await document.fonts?.load(font(600, 26));
    await document.fonts?.ready;
  } catch {
    /* fall back to system fonts */
  }

  let logoImg = null;
  let girlImg = null;
  await Promise.all([
    logoUrl
      ? loadImage(logoUrl)
          .then((img) => {
            logoImg = img;
          })
          .catch(() => {})
      : Promise.resolve(),
    loadImage(hiringGirlIllustration)
      .then((img) => {
        girlImg = img;
      })
      .catch(() => {}),
  ]);

  // Pass 1: dry run on a tall scratch canvas to learn the exact height
  const scratch = document.createElement("canvas");
  scratch.width = W;
  scratch.height = 4000;
  const sctx = scratch.getContext("2d");
  const contentBottom = drawContent(sctx, data, W, logoImg, girlImg);
  const fo = measureFooter(sctx, data);
  const H = Math.max(1350, Math.round(contentBottom + 45 + fo.h));

  // Pass 2: real render with girl illustration anchored cleanly above footer
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  drawBackground(ctx, W, H);
  drawContent(ctx, data, W, logoImg, girlImg, H - fo.h);
  drawFooter(ctx, W, H, fo);

  return { canvas, headline: data.headline };
}

export async function renderSocialTemplateDataUrl({
  job,
  logoUrl = "",
  postText = "",
}) {
  const { canvas } = await renderSocialTemplateCanvas({
    job,
    logoUrl,
    postText,
  });
  return canvas.toDataURL("image/png");
}

export async function downloadSocialTemplatePng({
  job,
  platform = "linkedin",
  logoUrl = "",
  postText = "",
}) {
  const { canvas, headline } = await renderSocialTemplateCanvas({
    job,
    logoUrl,
    postText,
  });

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return false;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const slug = String(job?.code || headline)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  link.href = url;
  link.download = `${slug || "job"}-${platform}-template.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

/* ------------------------------------------------------------------ */
/*  React preview card (exact live mirror of the actual PNG poster)    */
/* ------------------------------------------------------------------ */
export default function SocialPostTemplateCard({
  job,
  logoUrl = "",
  postText = "",
  onUploadLogoClick,
  onPreviewClick,
  interactive = false,
}) {
  const [previewSrc, setPreviewSrc] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      renderSocialTemplateDataUrl({ job, logoUrl, postText })
        .then((url) => {
          if (!cancelled) setPreviewSrc(url);
        })
        .catch(() => {
          if (!cancelled) setPreviewSrc("");
        });
    }, 60);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [job, logoUrl, postText]);

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? () => onPreviewClick?.() : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPreviewClick?.();
              }
            }
          : undefined
      }
      className={`group relative w-full overflow-hidden rounded-none border border-[#DCE9DF] bg-[#F8FAF7] shadow-[0_8px_28px_rgba(31,57,43,0.12)] select-none outline-none focus:outline-none transition-shadow ${
        interactive ? "cursor-pointer" : ""
      }`}
    >
      {!logoUrl && onUploadLogoClick && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUploadLogoClick?.();
          }}
          title="Upload brand logo"
          className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 px-2 py-1 rounded-[5px] border border-dashed border-[#4C9A68] bg-white/95 hover:bg-white text-[0.62rem] font-bold text-[#285B3B] shadow-2xs cursor-pointer transition-colors"
        >
          <FiImage className="w-3 h-3" />
          <span>Logo</span>
        </button>
      )}

      {previewSrc ? (
        <img
          src={previewSrc}
          alt="Generated job post template preview"
          className="w-full h-auto block"
        />
      ) : (
        <div className="aspect-[1080/1350] w-full flex items-center justify-center text-[0.8rem] font-medium text-[#5A6777] bg-[#F8FAF7]">
          Generating template preview...
        </div>
      )}
    </div>
  );
}
