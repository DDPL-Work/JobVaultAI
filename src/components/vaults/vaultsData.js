export const INITIAL_VAULT_CONFIGS = [
  {
    id: "v-fresher",
    name: "India · Fresher",
    desc: "India · under 2 yrs",
    min_exp: 0,
    max_exp: 2,
    is_active: true,
  },
  {
    id: "v-junior",
    name: "India · Junior",
    desc: "India · 2–5 yrs",
    min_exp: 2,
    max_exp: 5,
    is_active: true,
  },
  {
    id: "v-mid",
    name: "India · Mid-level",
    desc: "India · 5–10 yrs",
    min_exp: 5,
    max_exp: 10,
    is_active: true,
  },
  {
    id: "v-senior",
    name: "India · Senior",
    desc: "India · 10+ yrs",
    min_exp: 10,
    max_exp: null,
    is_active: true,
  },
  {
    id: "v-global",
    name: "Global",
    desc: "Outside India, not remote",
    min_exp: null,
    max_exp: null,
    is_active: true,
  },
  {
    id: "v-remote",
    name: "Remote",
    desc: "Remote / work from anywhere",
    min_exp: null,
    max_exp: null,
    is_active: true,
  },
];

export const VAULT_STORAGE_KEY = "jobvault_vault_configs";

/**
 * Loads vault configurations from localStorage or returns defaults
 */
export function loadVaultConfigs() {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return INITIAL_VAULT_CONFIGS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error("Error loading vault configs:", err);
  }
  return INITIAL_VAULT_CONFIGS;
}

/**
 * Persists vault configurations to localStorage
 */
export function saveVaultConfigs(configs) {
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(configs));
  } catch (err) {
    console.error("Error saving vault configs:", err);
  }
}

export const VAULT_CONFIGS = INITIAL_VAULT_CONFIGS;
