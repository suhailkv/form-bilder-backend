// src/services/validationService.js
const fs = require('fs');
const path = require('path');
const util = require('util');

const rename = util.promisify(fs.rename);
const access = util.promisify(fs.access);
const mkdir = util.promisify(fs.mkdir);

const TEMP_DIR = path.join(__dirname, '..', 'uploads', 'temp');
const FINAL_DIR = path.join(__dirname, '..', 'uploads', 'final');

// Helper validators
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePhone(phone) {
  return /^\+?[0-9\s\-()]{7,20}$/.test(phone);
}
function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
function isValidDate(d) {
  return !isNaN(new Date(d).getTime());
}

// Ensure final upload directory exists
async function ensureFinalDir() {
  try {
    await mkdir(FINAL_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

/**
 * Validate form data and move uploaded files if valid.
 */
exports.validateSubmissionData = async (data, schema) => {
  const errors = [];

  // If no schema provided, consider valid
  if (!schema || !schema.fields || !Array.isArray(schema.fields)) {
    return { isValid: true, errors: [] };
  }

  const validFiles = []; // to track successfully validated files

  for (const field of schema.fields) {
    const fieldName = field.name || field.id;
    const fieldValue = data[fieldName];
    const fieldType = field.type;
    const isRequired = field.required === true;

    // Check required fields
    if (isRequired && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
      errors.push(`${field.label || fieldName} is required`);
      continue;
    }

    // Skip validation if field is not required and empty
    if (!isRequired && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
      continue;
    }

    switch (fieldType) {
      case 'email':
        if (!validateEmail(fieldValue)) {
          errors.push(`${field.label || fieldName} must be a valid email address`);
        }
        break;

      case 'number':
        if (isNaN(fieldValue)) {
          errors.push(`${field.label || fieldName} must be a number`);
        } else {
          const numValue = Number(fieldValue);
          if (!['',undefined,null].includes(field.min) && numValue < field.min) {
            errors.push(`${field.label || fieldName} must be at least ${field.min}`);
          }
          if (!['',undefined,null].includes(field.max) && numValue > field.max) {
            errors.push(`${field.label || fieldName} must be at most ${field.max}`);
          }
        }
        break;

      case 'text':
      case 'textarea':
        if (typeof fieldValue !== 'string') {
          errors.push(`${field.label || fieldName} must be text`);
        } else {
          if (field.minLength && fieldValue.length < field.minLength) {
            errors.push(`${field.label || fieldName} must be at least ${field.minLength} characters`);
          }
          if (field.maxLength && fieldValue.length > field.maxLength) {
            errors.push(`${field.label || fieldName} must be at most ${field.maxLength} characters`);
          }
        }
        break;

      case 'select':
      case 'radio':
        if (field.options && Array.isArray(field.options)) {
          const validOptions = field.options.map(opt => opt.value || opt);
          if (!validOptions.includes(fieldValue)) {
            errors.push(`${field.label || fieldName} has an invalid option`);
          }
        }
        break;

      case 'checkbox':
        if (field.multiple) {
          if (!Array.isArray(fieldValue)) {
            errors.push(`${field.label || fieldName} must be an array`);
          } else if (field.options) {
            const validOptions = field.options.map(opt => opt.value || opt);
            const invalidValues = fieldValue.filter(val => !validOptions.includes(val));
            if (invalidValues.length > 0) {
              errors.push(`${field.label || fieldName} contains invalid options`);
            }
          }
        }
        break;

      case 'date':
        if (!isValidDate(fieldValue)) {
          errors.push(`${field.label || fieldName} must be a valid date`);
        }
        break;

      case 'url':
        if (!validateURL(fieldValue)) {
          errors.push(`${field.label || fieldName} must be a valid URL`);
        }
        break;

      case 'phone':
        if (!validatePhone(fieldValue)) {
          errors.push(`${field.label || fieldName} must be a valid phone number`);
        }
        break;

      case 'file': {
        // File validation + movement from temp → final
        try {
          await ensureFinalDir();

          const fileName = path.basename(fieldValue || '');
          const tempPath = path.join(TEMP_DIR, fileName);
          const finalPath = path.join(FINAL_DIR, fileName);

          await access(tempPath, fs.constants.F_OK);

          validFiles.push({ fieldName, tempPath, finalPath });
        } catch (err) {
          errors.push(`${field.label || fieldName}: file missing, please upload again.`);
        }
        break;
      }

      default:
        // other field types ignored
        break;
    }

    // Pattern validation (regex)
    if (field.pattern && typeof fieldValue === 'string') {
      try {
        const regex = new RegExp(field.pattern);
        if (!regex.test(fieldValue)) {
          errors.push(`${field.label || fieldName} format is invalid`);
        }
      } catch (e) {
        console.error('Invalid regex pattern:', field.pattern);
      }
    }
  }

  const isValid = errors.length === 0;

  // If all validations passed, move valid files to final dir
  if (isValid && validFiles.length > 0) {
    for (const { tempPath, finalPath } of validFiles) {
      try {
        await rename(tempPath, finalPath);
      } catch (err) {
        console.error('File move error:', err);
        errors.push(`Error saving uploaded file: ${path.basename(finalPath)}`);
      }
    }
  }

  return { isValid: errors.length === 0, errors };
};
