const fs = require("fs");
const path = require("path");

const targets = [".expo", "dist", "build", ".turbo"];

for (const target of targets) {
  const resolved = path.join(process.cwd(), target);
  if (fs.existsSync(resolved)) {
    fs.rmSync(resolved, { recursive: true, force: true });
    console.log(`Removed ${target}`);
  }
}