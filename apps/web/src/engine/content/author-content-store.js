/**
 * Framework-free content tools shared by Author Mode screens.
 * Browser-local edits intentionally stay outside Git until exported and reviewed.
 */
export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function mergeDefaults(defaults, candidate) {
  if (Array.isArray(defaults)) {
    return Array.isArray(candidate)
      ? candidate.map((item, index) => mergeDefaults(defaults[index] ?? item, item))
      : clone(defaults);
  }

  if (defaults && typeof defaults === "object") {
    const result = {};
    const source = candidate && typeof candidate === "object" ? candidate : {};
    for (const key of Object.keys(defaults)) {
      result[key] = mergeDefaults(defaults[key], source[key]);
    }
    return result;
  }

  return typeof candidate === typeof defaults ? candidate : defaults;
}

export function getAtPath(source, path) {
  return path.split(".").reduce((current, key) => current?.[key], source);
}

export function setAtPath(source, path, value) {
  const keys = path.split(".");
  let target = source;
  keys.slice(0, -1).forEach((key) => {
    target = target[key];
  });
  target[keys.at(-1)] = value;
}

export function readLocalContent(storageKey, defaults) {
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? mergeDefaults(defaults, JSON.parse(saved)) : clone(defaults);
  } catch {
    return clone(defaults);
  }
}

export function writeLocalContent(storageKey, content) {
  window.localStorage.setItem(storageKey, JSON.stringify(content));
}

export function clearLocalContent(storageKey) {
  window.localStorage.removeItem(storageKey);
}

export function downloadContent(filename, content) {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

export async function readImportedContent(file, defaults) {
  const raw = await file.text();
  return mergeDefaults(defaults, JSON.parse(raw));
}
