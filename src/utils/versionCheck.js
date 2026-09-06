export const APP_VERSION = "1.0.88";
export const APP_BUILD_TIME = new Date().toISOString();

export async function checkForAppUpdate() {
  try {
    const origin = (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') 
      ? window.location.origin 
      : '';
    const url = origin ? `${origin}/version.json?t=${Date.now()}` : `/version.json?t=${Date.now()}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const currentVersion = localStorage.getItem('catalyze_installed_version') || localStorage.getItem('aspiranto_installed_version') || APP_VERSION;
    if (data.version && data.version !== currentVersion) {
      return data;
    }
    return null;
  } catch (err) {
    console.warn("Update check error:", err);
    return null;
  }
}

export function applyInstantUpdate(newVersion) {
  if (newVersion) {
    localStorage.setItem('catalyze_installed_version', newVersion);
  }
  // Clear cache if supported and reload
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
  window.location.reload();
}
