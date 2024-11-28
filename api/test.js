const fs = require("fs");
const path = require("path");

// Function to get all files and their relative paths
function getFilesInDirectory(dirPath, baseDir = "") {
  let results = [];

  // Read the contents of the directory
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.relative(baseDir, fullPath);

    // Check if the path is a directory or a file
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // If it's a directory, recursively get files in the directory
      results = results.concat(getFilesInDirectory(fullPath, baseDir));
    } else {
      // If it's a file, add its relative path to the results
      results.push(relativePath);
    }
  });

  return results;
}

// Usage example
const directoryPath = "./converted"; // Change this to your folder path
const files = getFilesInDirectory(directoryPath);

console.log(files);
