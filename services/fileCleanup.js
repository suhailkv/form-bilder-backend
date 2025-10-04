// src/services/fileCleanup.js
const fs = require('fs').promises;
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'temp');

/**
 * Deletes files older than maxAgeHours in the temp upload directory.
 * Safe to run from cron or as a scheduled job.
 * Returns { deleted: number, errors: [] }
 */
async function cleanupOldTempFiles(maxAgeHours = 24) {
  const now = Date.now();
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  const result = { deleted: 0, errors: [] };

  let entries;
  try {
    entries = await fs.readdir(UPLOAD_DIR, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Nothing to do if directory doesn't exist
      return result;
    }
    throw err;
  }

  const filePromises = entries.map(async (dirent) => {
    if (!dirent.isFile()) return;
    const filePath = path.join(UPLOAD_DIR, dirent.name);
    try {
      const stat = await fs.stat(filePath);
      if (now - stat.mtimeMs > maxAgeMs) {
        await fs.unlink(filePath);
        result.deleted += 1;
      }
    } catch (err) {
      result.errors.push({ file: dirent.name, error: err.message || err.code || String(err) });
    }
  });

  await Promise.all(filePromises);
  return result;
}

module.exports = {
  cleanupOldTempFiles,
};
