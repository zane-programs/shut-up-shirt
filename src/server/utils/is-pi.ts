/* Adapted from https://npmjs.com/package/detect-rpi */

import fs from "node:fs";

const PI_MODEL_NO = [
  // https://www.raspberrypi.com/documentation/computers/processors.html
  "BCM2708",
  "BCM2709",
  "BCM2710",
  "BCM2835", // Raspberry Pi 1 and Zero
  "BCM2836", // Raspberry Pi 2
  "BCM2837", // Raspberry Pi 3 (and later Raspberry Pi 2)
  "BCM2837B0", // Raspberry Pi 3B+ and 3A+
  "BCM2711", // Raspberry Pi 4B
  "BCM2712", // Raspberry Pi 5
];

function _isPi(model: string) {
  return PI_MODEL_NO.includes(model);
}

export const isPi = (() => {
  var cpuInfo;
  try {
    cpuInfo = fs.readFileSync("/proc/cpuinfo", { encoding: "utf8" });
  } catch (e) {
    // if this fails, this is probably not a pi
    return false;
  }

  var model = cpuInfo
    .split("\n")
    .map((line) => line.replace(/\t/g, ""))
    .filter((line) => line.length > 0)
    .map((line) => line.split(":"))
    .map((pair) => pair.map((entry) => entry.trim()))
    .filter((pair) => pair[0] === "Hardware");

  if (!model || model.length == 0) {
    return false;
  }

  var number = model[0][1];
  return _isPi(number);
})();
