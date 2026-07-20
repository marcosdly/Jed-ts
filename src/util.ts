// Source - https://stackoverflow.com/a/34749873
// Posted by Salakar, modified by community. See post 'Timeline' for change history
// Retrieved 2026-07-19, License - CC BY-SA 3.0

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: any): item is Object {
  return (
    typeof item === "object" &&
    item !== null &&
    item !== undefined &&
    !Array.isArray(item)
  );
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep<T extends Object>(target: T, ...sources: T[]) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key] as any, source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}
