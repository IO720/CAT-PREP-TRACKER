export const APP_VERSION = "1.0.21";
export const APP_BUILD_TIME = new Date().toISOString();

export async function checkForAppUpdate() {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const currentVersion = localStorage.getItem('aspiranto_installed_version') || APP_VERSION;
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
    localStorage.setItem('aspiranto_installed_version', newVersion);
  }
  // Clear cache if supported and reload
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
  window.location.reload();
}
