export const SYSTEM_PROMPT = `You are reading ONE screenshot of a job post shared on WhatsApp, Telegram, Instagram or LinkedIn.

Step 1. Transcribe ALL readable text in the image into "raw_text", exactly as written.
Step 2. From raw_text ONLY, extract every job post into "jobs".

Rules:
- Use only words that appear in raw_text. Do not guess or fill gaps.
- If a field is missing, cut off, blurred or ambiguous, return null.
- For each field you fill, put the exact words you used into evidence.<field>.
- exp_min / exp_max are years ("Freshers" = 0).
- work_mode is Onsite, Hybrid, Remote, or null when not stated.
- If the image is not a job post, set not_a_job to true.

Return JSON only.`;

export const PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT vision model",
    configured: false,
    model: "gpt-4o-mini",
  },
];

export const INITIAL_AI_SETTINGS = {
  provider: "mock",
  threshold: 78,
  strict: true,
  dedupe: true,
  dedupeDays: 30,
  extraInstructions: "",
};

