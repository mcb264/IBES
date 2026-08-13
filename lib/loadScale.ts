import { LoadSettings, loadLoadSettings, saveLoadSettings } from "@/lib/storage";

export const CURRENT_LOAD_DEFAULTS: LoadSettings = {
  lowCapacity: 6,
  normalCapacity: 10,
  highCapacity: 14,
  lightActionPoints: 1.2,
  normalActionPoints: 2,
  heavyActionPoints: 3,
};

export function loadCurrentLoadSettings(): LoadSettings {
  const settings = loadLoadSettings();
  const legacy = settings.normalCapacity > 20 || settings.normalActionPoints > 5;
  if (!legacy) return settings;
  const normalized: LoadSettings = {
    lowCapacity: Math.round(settings.lowCapacity) / 10,
    normalCapacity: Math.round(settings.normalCapacity) / 10,
    highCapacity: Math.round(settings.highCapacity) / 10,
    lightActionPoints: Math.round(settings.lightActionPoints) / 10,
    normalActionPoints: Math.round(settings.normalActionPoints) / 10,
    heavyActionPoints: Math.round(settings.heavyActionPoints) / 10,
  };
  saveLoadSettings(normalized);
  return normalized;
}

export function saveCurrentLoadSettings(settings: LoadSettings) {
  saveLoadSettings(settings);
}
