const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const GOOGLE_FORMS = {
  CONTACT: "https://docs.google.com/forms/d/e/1FAIpQLSf_jOBiF8PRpu3lGbrYLXCHauRCUlOQ6FX-GNoH54sj0rsysw/formResponse"
};

export const API = {
  CV: `${API_BASE_URL}/cv`,
  CONTACT: `${API_BASE_URL}/cv/contact`,
  LANGUAGES: `${API_BASE_URL}/cv/languages`,
  EDUCATION: `${API_BASE_URL}/cv/education`,
  EXPERIENCE: `${API_BASE_URL}/cv/experience`,
  PROJECTS: `${API_BASE_URL}/cv/projects`,
  SKILLS: `${API_BASE_URL}/cv/skills`,
  FINANCE: `${API_BASE_URL}/finance`,
  EXCHANGE_RATES: `${API_BASE_URL}/exchange-rates`,
  PROFILE: `${API_BASE_URL}/cv/profile`,
  VISITORS: `${API_BASE_URL}/visitors`,
  VISITOR_STATS: `${API_BASE_URL}/visitors/stats`,
  RECURRING_EXPENSES: `${API_BASE_URL}/api/recurring-expenses`
};
