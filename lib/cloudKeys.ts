export const CLOUD_STATE_KEYS = [
  "ibes:musique",
  "ibes:esport",
  "ibes:vie",
  "ibes:inbox",
  "ibes:custom-workspaces",
  "ibes:mode-rouge",
  "ibes:load-settings",
  "ibes:daily-capacity",
  "ibes:load-history",
  "ibes:load-insight-dismissed",
] as const;

export type CloudStateKey = (typeof CLOUD_STATE_KEYS)[number];
export type CloudState = Partial<Record<CloudStateKey, string>>;

export function isCloudState(value: unknown): value is CloudState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const entries = Object.entries(value);
  return (
    entries.length <= CLOUD_STATE_KEYS.length &&
    entries.every(
      ([key, item]) =>
        CLOUD_STATE_KEYS.includes(key as CloudStateKey) &&
        typeof item === "string" &&
        item.length <= 100_000,
    )
  );
}
