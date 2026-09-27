import fs from "node:fs";

if (!fs.existsSync(".next/app-build-manifest.json")) {
  console.log("No build manifest found (run after next build). Skipping bundle check.");
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(".next/app-build-manifest.json", "utf8"));
const pages = manifest.pages || {};
const initialChunks = new Set([
  ...(pages["/layout"] ?? []),
  ...(pages["/page"] ?? []),
  ...(pages["/"] ?? [])
].filter((f) => typeof f === "string" && f.endsWith(".js")));

const leaks = [...initialChunks].filter((file) => {
  const fullPath = `.next/${file}`;
  if (!fs.existsSync(fullPath)) return false;
  const content = fs.readFileSync(fullPath, "utf8");
  return content.includes("WebGLRenderer") || content.includes("PMREMGenerator");
});

if (leaks.length > 0) {
  console.error("FAIL: three.js leaked into initial DOM bundle chunks:", leaks);
  process.exit(1);
}

console.log(`PASS: Initial bundle verified (${initialChunks.size} initial chunks, zero Three.js/WebGLRenderer).`);
