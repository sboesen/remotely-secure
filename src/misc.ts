import { Vault, moment } from "obsidian";
import { base32, base64url } from "rfc4648";
import XRegExp from "xregexp";
import emojiRegex from "emoji-regex";

import type { I18n, LangType, LangTypeAndAuto, TransItemType } from "./i18n";

import { log } from "./moreOnLog";

/**
 * If any part of the file starts with '.' or '_' then it's a hidden file.
 * @param item
 * @param dot
 * @param underscore
 * @returns
 */
export const isHiddenPath = (
  item: string,
  dot: boolean = true,
  underscore: boolean = true
) => {
  if (!(dot || underscore)) {
    throw Error("parameter error for isHiddenPath");
  }
  const k = normalizePath(item); // TODO: only unix path now
  const k2 = k.split("/"); // TODO: only unix path now
  // log.info(k2)
  for (const singlePart of k2) {
    if (singlePart === "." || singlePart === ".." || singlePart === "") {
      continue;
    }
    if (dot && singlePart[0] === ".") {
      return true;
    }
    if (underscore && singlePart[0] === "_") {
      return true;
    }
  }
  return false;
};

/**
 * Normalizes a path
 * @param path
 */
export const normalizePath = (
  path: string
) => {
  if (!(path)) {
    throw Error("missing path for normalizePath")
  }
  // Replace backslashes with forward slashes
  path = path.replace(/\\/g, '/');

  // Remove duplicate slashes (e.g., '//' -> '/')
  path = path.replace(/\/\/+/g, '/');

  // Resolve '../' and './' in the path
  const parts = path.split('/');
  const result = [];
  for (const part of parts) {
    if (part === '..') {
      result.pop();
    } else if (part !== '.' && part !== '') {
      result.push(part);
    }
  }

  // Join parts back together with '/' as the separator
  return result.join('/');
}

export const dirname = (path: string) => {
  // Normalize the path to use forward slashes
  path = path.replace(/\\/g, '/');

  // Split the path into parts using forward slash as the separator
  const parts = path.split('/');

  // Remove the last part (file or directory name)
  parts.pop();

  // Join the remaining parts to get the dirname
  const dirname = parts.join('/');

  // Handle the case where the path was empty or only contained a root slash
  if (dirname === '' || dirname === '/' || dirname === '.') {
    return '/';
  }

  return dirname;
}

/**
 * Util func for mkdir -p based on the "path" of original file or folder
 * "a/b/c/" => ["a", "a/b", "a/b/c"]
 * "a/b/c/d/e.txt" => ["a", "a/b", "a/b/c", "a/b/c/d"]
 * @param x string
 * @returns string[] might be empty
 */
export const getFolderLevels = (x: string, addEndingSlash: boolean = false) => {
  const res: string[] = [];

  if (x === "" || x === "/") {
    return res;
  }

  const y1 = x.split("/");
  let i = 0;
  for (let index = 0; index + 1 < y1.length; index++) {
    let k = y1.slice(0, index + 1).join("/");
    if (k === "" || k === "/") {
      continue;
    }
    if (addEndingSlash) {
      k = `${k}/`;
    }
    res.push(k);
  }
  return res;
};

export const mkdirpInVault = async (thePath: string, vault: Vault) => {
  const foldersToBuild = getFolderLevels(thePath);
  for (const folder of foldersToBuild) {
    const r = await vault.adapter.exists(folder);
    if (!r) {
      await vault.adapter.mkdir(folder);
    }
  }
};

/**
 * https://stackoverflow.com/questions/8609289
 * @param b Buffer
 * @returns ArrayBuffer
 */
export const bufferToArrayBuffer = (
  b: Buffer | Uint8Array | ArrayBufferView
) => {
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
};

/**
 * Simple func.
 * @param b
 * @returns
 */
export const arrayBufferToBuffer = (b: ArrayBuffer) => {
  return Buffer.from(b);
};

export const arrayBufferToBase64 = (b: ArrayBuffer) => {
  return arrayBufferToBuffer(b).toString("base64");
};

export const arrayBufferToHex = (b: ArrayBuffer) => {
  return arrayBufferToBuffer(b).toString("hex");
};

export const base64ToArrayBuffer = (b64text: string) => {
  return bufferToArrayBuffer(Buffer.from(b64text, "base64"));
};

/**
 * https://stackoverflow.com/questions/43131242
 * @param hex
 * @returns
 */
export const hexStringToTypedArray = (hex: string) => {
  return new Uint8Array(
    hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16);
    })
  );
};

export const base64ToBase32 = (a: string) => {
  return base32.stringify(Buffer.from(a, "base64"));
};

export const base64ToBase64url = (a: string, pad: boolean = false) => {
  let b = a.replace(/\+/g, "-").replace(/\//g, "_");
  if (!pad) {
    b = b.replace(/=/g, "");
  }
  return b;
};

/**
 * Use regex to detect a text contains emoji or not.
 * @param a
 * @returns
 */
export const hasEmojiInText = (a: string) => {
  const regex = emojiRegex();
  return regex.test(a);
};

/**
 * Convert the headers to a normal object.
 * @param h
 * @param toLower
 * @returns
 */
export const headersToRecord = (h: Headers, toLower: boolean = true) => {
  const res: Record<string, string> = {};
  h.forEach((v, k) => {
    if (toLower) {
      res[k.toLowerCase()] = v;
    } else {
      res[k] = v;
    }
  });
  return res;
};

/**
 * If input is already a folder, returns it as is;
 * And if input is a file, returns its direname.
 * @param a
 * @returns
 */
export const getPathFolder = (a: string) => {
  if (a.endsWith("/")) {
    return a;
  }
  const b = dirname(a);
  return b.endsWith("/") ? b : `${b}/`;
};

/**
 * If input is already a folder, returns its folder;
 * And if input is a file, returns its direname.
 * @param a
 * @returns
 */
export const getParentFolder = (a: string) => {
  const b = dirname(a);
  if (b === "." || b === "/") {
    // the root
    return "/";
  }
  if (b.endsWith("/")) {
    return b;
  }
  return `${b}/`;
};

/**
 * https://stackoverflow.com/questions/54511144
 * @param a
 * @param delimiter
 * @returns
 */
export const setToString = (a: Set<string>, delimiter: string = ",") => {
  return [...a].join(delimiter);
};

export const extractSvgSub = (x: string, subEl: string = "rect") => {
  const parser = new window.DOMParser();
  const dom = parser.parseFromString(x, "image/svg+xml");
  const svg = dom.querySelector("svg");
  svg.setAttribute("viewbox", "0 0 10 10");
  return svg.innerHTML;
};

/**
 * https://stackoverflow.com/questions/18230217
 * @param min
 * @param max
 * @returns
 */
export const getRandomIntInclusive = (min: number, max: number) => {
  const randomBuffer = new Uint32Array(1);
  window.crypto.getRandomValues(randomBuffer);
  let randomNumber = randomBuffer[0] / (0xffffffff + 1);
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(randomNumber * (max - min + 1)) + min;
};

/**
 * Random buffer
 * @param byteLength
 * @returns
 */
export const getRandomArrayBuffer = (byteLength: number) => {
  const k = window.crypto.getRandomValues(new Uint8Array(byteLength));
  return bufferToArrayBuffer(k);
};

/**
 * https://stackoverflow.com/questions/958908
 * @param x
 * @returns
 */
export const reverseString = (x: string) => {
  return [...x].reverse().join("");
};

export interface SplitRange {
  partNum: number; // startting from 1
  start: number;
  end: number; // exclusive
}
export const getSplitRanges = (bytesTotal: number, bytesEachPart: number) => {
  const res: SplitRange[] = [];
  if (bytesEachPart >= bytesTotal) {
    res.push({
      partNum: 1,
      start: 0,
      end: bytesTotal,
    });
    return res;
  }
  const remainder = bytesTotal % bytesEachPart;
  const howMany =
    Math.floor(bytesTotal / bytesEachPart) + (remainder === 0 ? 0 : 1);
  for (let i = 0; i < howMany; ++i) {
    res.push({
      partNum: i + 1,
      start: bytesEachPart * i,
      end: Math.min(bytesEachPart * (i + 1), bytesTotal),
    });
  }
  return res;
};

/**
 * https://stackoverflow.com/questions/332422
 * @param obj anything
 * @returns string of the name of the object
 */
export const getTypeName = (obj: any) => {
  return Object.prototype.toString.call(obj).slice(8, -1);
};

/**
 * Startting from 1
 * @param x
 * @returns
 */
export const atWhichLevel = (x: string) => {
  if (
    x === undefined ||
    x === "" ||
    x === "." ||
    x === ".." ||
    x.startsWith("/")
  ) {
    log.debug(`do not know which level for ${x}`);
  }
  let y = x;
  if (x.endsWith("/")) {
    y = x.slice(0, -1);
  }
  return y.split("/").length;
};

export const checkHasSpecialCharForDir = (x: string) => {
  return /[?/\\]/.test(x);
};

export const unixTimeToStr = (x: number | undefined | null) => {
  if (x === undefined || x === null || Number.isNaN(x)) {
    return undefined;
  }
  return (moment as any)(x).format() as string;
};

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value#examples
 * @returns
 */
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key: any, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

/**
 * Convert "any" value to string.
 * @param x
 * @returns
 */
export const toText = (x: any) => {
  if (x === undefined || x === null) {
    return `${x}`;
  }
  if (typeof x === "string") {
    return x;
  }
  if (
    x instanceof String ||
    x instanceof Date ||
    typeof x === "number" ||
    typeof x === "bigint" ||
    typeof x === "boolean"
  ) {
    return `${x}`;
  }

  if (
    x instanceof Error ||
    (x &&
      x.stack &&
      x.message &&
      typeof x.stack === "string" &&
      typeof x.message === "string")
  ) {
    return `ERROR! MESSAGE: ${x.message}, STACK: ${x.stack}`;
  }

  try {
    const y = JSON.stringify(x, getCircularReplacer(), 2);
    if (y !== undefined) {
      return y;
    }
    throw new Error("not jsonable");
  } catch {
    return `${x}`;
  }
};

/**
 * On Android the stat has bugs for folders. So we need a fixed version.
 * @param vault
 * @param path
 */
export const statFix = async (vault: Vault, path: string) => {
  const s = await vault.adapter.stat(path);
  if (s == undefined) {
    return;
  }
  if (s.ctime === undefined || s.ctime === null || Number.isNaN(s.ctime)) {
    s.ctime = undefined;
  }
  if (s.mtime === undefined || s.mtime === null || Number.isNaN(s.mtime)) {
    s.mtime = undefined;
  }
  if (
    (s.size === undefined || s.size === null || Number.isNaN(s.size)) &&
    s.type === "folder"
  ) {
    s.size = 0;
  }
  return s;
};

export function getLastSynced(i18n: I18n, lastSuccessSyncMillis?: number): {lastSyncMsg: string, lastSyncLabelMsg: string} {
  const t = (x: TransItemType, vars?: any) => {
    return i18n.t(x, vars);
  };

  let lastSynced = {
    lastSyncMsg: t("statusbar_lastsync_never"),
    lastSyncLabelMsg: t("statusbar_lastsync_never_label")
  };

  if (lastSuccessSyncMillis !== undefined && lastSuccessSyncMillis > 0) {
    const deltaTime = Date.now() - lastSuccessSyncMillis;

    // create human readable time
    const years = Math.floor(deltaTime / 31556952000);
    const months = Math.floor(deltaTime / 2629746000);
    const weeks = Math.floor(deltaTime / 604800000);
    const days = Math.floor(deltaTime / 86400000);
    const hours = Math.floor(deltaTime / 3600000);
    const minutes = Math.floor(deltaTime / 60000);
    let timeText = "";

    if (years > 0) {
      timeText = t("statusbar_time_years", { time: years });
    } else if (months > 0) {
      timeText = t("statusbar_time_months", { time: months });
    } else if (weeks > 0) {
      timeText = t("statusbar_time_weeks", { time: weeks });
    } else if (days > 0) {
      timeText = t("statusbar_time_days", { time: days });
    } else if (hours > 0) {
      timeText = t("statusbar_time_hours", { time: hours });
    } else if (minutes > 0) {
      timeText = t("statusbar_time_minutes", { time: minutes });
    } else {
      timeText = t("statusbar_time_lessminute");
    }

    let dateText = new Date(lastSuccessSyncMillis)
      .toLocaleTimeString(navigator.language, {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      });

    lastSynced.lastSyncMsg = t("statusbar_lastsync", { time: timeText });
    lastSynced.lastSyncLabelMsg = t("statusbar_lastsync_label", { date: dateText });
  }

  return lastSynced;
}
