const fs = require("fs");
const path = require("path");

// Path to the Next.js cache
const nextDir = path.join(__dirname, ".next");
const manifestPath = path.join(nextDir, "server", "middleware-manifest.json");
const buildManifestPath = path.join(nextDir, "server", "middleware-build-manifest.js");
const tracePath = path.join(nextDir, "trace");

console.log("Attempting to remove problematic Next.js cache files...");

// Function to safely delete a file
function safelyDeleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Successfully deleted: ${filePath}`);
    } else {
      console.log(`File does not exist: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting ${filePath}:`, error.message);
  }
}

// Try to delete the specific problematic files
safelyDeleteFile(manifestPath);
safelyDeleteFile(buildManifestPath);
safelyDeleteFile(tracePath);

console.log('Done. You can now try to start the development server with "yarn dev".');
