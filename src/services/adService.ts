const STORAGE_KEY = 'kheladekh_pre_roll_last_shown';

/**
 * Checks if the pre-roll interstitial ad should be displayed.
 * Frequency default is 12 hours.
 */
export function shouldDisplayAd(frequencyHours = 12): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;

    const lastShown = parseInt(raw, 10);
    if (isNaN(lastShown)) return true;

    const cooldownMs = frequencyHours * 60 * 60 * 1000;
    const elapsed = Date.now() - lastShown;

    return elapsed >= cooldownMs;
  } catch {
    return true;
  }
}

/**
 * Records that the ad has just been shown, locking the next 12 hours.
 */
export function recordAdImpression(): void {
  try {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  } catch (err) {
    console.warn('Failed to save ad timestamp in localStorage:', err);
  }
}

/**
 * Gets formatted remaining cooldown time (e.g. "11h 45m" or "0")
 */
export function getRemainingCooldownMinutes(frequencyHours = 12): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const lastShown = parseInt(raw, 10);
    if (isNaN(lastShown)) return 0;

    const cooldownMs = frequencyHours * 60 * 60 * 1000;
    const elapsed = Date.now() - lastShown;
    const remainingMs = cooldownMs - elapsed;

    if (remainingMs <= 0) return 0;
    return Math.ceil(remainingMs / (1000 * 60));
  } catch {
    return 0;
  }
}

/**
 * Clears the 12-hour cooldown so the user/admin can test the ad again immediately.
 */
export function resetAdCooldown(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to reset ad cooldown:', err);
  }
}
