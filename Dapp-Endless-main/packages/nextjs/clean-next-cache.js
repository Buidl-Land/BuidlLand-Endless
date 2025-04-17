const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Path to the Next.js cache
const nextDir = path.join(__dirname, ".next");

// Function to check if Next.js is running
function isNextRunning() {
  try {
    const result = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH', { encoding: "utf8" });
    return result.trim().length > 0;
  } catch (error) {
    console.error("Error checking if Next.js is running:", error.message);
    return false;
  }
}

// If Next.js is running, exit
if (isNextRunning()) {
  console.error("Next.js is currently running. Please stop it before cleaning the cache.");
  console.error("You can stop it by closing the terminal window where it's running.");
  process.exit(1);
}

// Function to safely delete a file
function safelyDeleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Successfully deleted: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting ${filePath}:`, error.message);
  }
}

// Function to safely delete a directory
function safelyDeleteDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        safelyDeleteDir(curPath);
      } else {
        safelyDeleteFile(curPath);
      }
    }
    fs.rmdirSync(dirPath);
    console.log(`Successfully deleted directory: ${dirPath}`);
  } catch (error) {
    console.error(`Error deleting directory ${dirPath}:`, error.message);
  }
}

// Delete problematic files first
if (fs.existsSync(nextDir)) {
  safelyDeleteFile(path.join(nextDir, "trace"));
  safelyDeleteFile(path.join(nextDir, "server", "middleware-manifest.json"));
  safelyDeleteFile(path.join(nextDir, "server", "middleware-build-manifest.js"));

  // Delete specific directories
  safelyDeleteDir(path.join(nextDir, "cache"));
  safelyDeleteDir(path.join(nextDir, "server"));
}

console.log('Finished cleaning Next.js cache. You can now run "yarn dev" to start the development server.');
