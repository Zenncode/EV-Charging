export const SESSION_CHARGE_RATE_PERCENT_PER_SECOND = 0.35;
export const SESSION_TARGET_PERCENT = 80;
export const SESSION_BATTERY_CAPACITY_KWH = 60;

export interface SessionSnapshot {
  elapsedSec: number;
  progressPercent: number;
  targetEtaSec: number;
  energyAddedKwh: number;
  estimatedCost: number;
}

export function getElapsedSec(startedAt: string, nowMs = Date.now()) {
  const start = new Date(startedAt).getTime();
  if (!Number.isFinite(start)) return 0;
  return Math.max(0, Math.floor((nowMs - start) / 1000));
}

export function getSessionSnapshot(startedAt: string, pricePerKwh: number): SessionSnapshot {
  const elapsedSec = getElapsedSec(startedAt);
  const progressPercent = Math.min(100, 2 + elapsedSec * SESSION_CHARGE_RATE_PERCENT_PER_SECOND);
  const remainingToTarget = Math.max(0, SESSION_TARGET_PERCENT - progressPercent);
  const targetEtaSec = Math.ceil(remainingToTarget / SESSION_CHARGE_RATE_PERCENT_PER_SECOND);
  const energyAddedKwh = (progressPercent / 100) * SESSION_BATTERY_CAPACITY_KWH;
  const estimatedCost = energyAddedKwh * pricePerKwh;

  return {
    elapsedSec,
    progressPercent,
    targetEtaSec,
    energyAddedKwh,
    estimatedCost,
  };
}
