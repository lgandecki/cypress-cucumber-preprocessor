import path from "path";

export function ensureIsAbsolute(root: string, maybeRelativePath: string, override:boolean = true, fileSuffix: string = '') {

  if (!override) {
    maybeRelativePath += '-' + getEpochTime() + fileSuffix;
  }
  if (path.isAbsolute(maybeRelativePath)) {
    return maybeRelativePath;
  } else {
    return path.join(root, maybeRelativePath);
  }
}

export function ensureIsRelative(root: string, maybeRelativePath: string) {
  if (path.isAbsolute(maybeRelativePath)) {
    return path.relative(root, maybeRelativePath);
  } else {
    return maybeRelativePath;
  }
}

const getEpochTime = (): string => {
  return new Date().getTime().toString();
};