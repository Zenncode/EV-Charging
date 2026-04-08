const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env");
const envExamplePath = path.join(process.cwd(), ".env.example");

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log("Created .env from .env.example");
} else {
  console.log("No changes. .env already exists or .env.example missing.");
}