const ATTRIBUTION_STORAGE_KEY = "fdp_attribution_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function pickQueryParam(params, key) {
  const value = params.get(key);
  if (!value) {
    return null;
  }
  return value.trim() || null;
}

function parseLocation() {
  if (!isBrowser()) {
    return {};
  }

  const url = new URL(window.location.href);
  const params = url.searchParams;

  return {
    landing_page: url.href,
    referrer_url: document.referrer || null,
    utm_source: pickQueryParam(params, "utm_source"),
    utm_medium: pickQueryParam(params, "utm_medium"),
    utm_campaign: pickQueryParam(params, "utm_campaign"),
    utm_term: pickQueryParam(params, "utm_term"),
    utm_content: pickQueryParam(params, "utm_content"),
    gclid: pickQueryParam(params, "gclid"),
    msclkid: pickQueryParam(params, "msclkid"),
    fbclid: pickQueryParam(params, "fbclid"),
  };
}

function loadStoredAttribution() {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveAttribution(payload) {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(payload));
}

export function captureAttribution() {
  if (!isBrowser()) {
    return null;
  }

  const nowIso = new Date().toISOString();
  const current = parseLocation();
  const stored = loadStoredAttribution();

  const firstTouch = stored?.first_touch || {
    ...current,
    captured_at: nowIso,
  };

  const merged = {
    first_touch: firstTouch,
    last_touch: {
      ...current,
      captured_at: nowIso,
    },
  };

  saveAttribution(merged);
  return merged;
}

export function getAttributionSnapshot() {
  const stored = loadStoredAttribution();
  if (stored) {
    return stored;
  }
  return captureAttribution();
}

export function flattenAttributionForLead(snapshot) {
  if (!snapshot) {
    return {};
  }

  const lastTouch = snapshot.last_touch || {};
  const firstTouch = snapshot.first_touch || {};

  return {
    landing_page: lastTouch.landing_page || firstTouch.landing_page || null,
    referrer_url: lastTouch.referrer_url || firstTouch.referrer_url || null,
    utm_source: lastTouch.utm_source || firstTouch.utm_source || null,
    utm_medium: lastTouch.utm_medium || firstTouch.utm_medium || null,
    utm_campaign: lastTouch.utm_campaign || firstTouch.utm_campaign || null,
    utm_term: lastTouch.utm_term || firstTouch.utm_term || null,
    utm_content: lastTouch.utm_content || firstTouch.utm_content || null,
    gclid: lastTouch.gclid || firstTouch.gclid || null,
    msclkid: lastTouch.msclkid || firstTouch.msclkid || null,
    fbclid: lastTouch.fbclid || firstTouch.fbclid || null,
  };
}
