#!/usr/bin/env node
/**
 * EchoVault Postman Collection Enhancer
 * Adds test scripts, examples, and validation to all request files
 * Uses pure Node.js (no external dependencies)
 */

const fs = require('fs');
const path = require('path');

// Simple YAML parser (very basic, for our use case)
function parseYAML(content) {
  const lines = content.split('\n');
  const result = {};
  let current = result;
  let stack = [{ obj: result, indent: 0 }];
  let inMultiline = false;
  let multilineKey = '';
  let multilineIndent = 0;
  let multilineContent = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Handle multiline content (preserve as-is)
    if (inMultiline) {
      const indent = line.search(/\S/);
      if (line.trim() === '') {
        multilineContent.push('');
      } else if (indent > multilineIndent || line.trim().startsWith('- ') || line.trim().startsWith('{')) {
        multilineContent.push(line.slice(multilineIndent));
      } else {
        // End of multiline
        inMultiline = false;
        current[multilineKey] = multilineContent.join('\n');
        i--;
        continue;
      }
    } else if (line.trim().endsWith('|-')) {
      // Start of multiline literal
      const [key] = line.split(':');
      multilineKey = key.trim();
      multilineIndent = line.search(/\S/) + 2;
      multilineContent = [];
      inMultiline = true;
      continue;
    }

    if (!inMultiline) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const indent = line.search(/\S/);
      
      // Adjust stack based on indent
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }
      current = stack[stack.length - 1].obj;

      if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        
        if (!value || value === '[]' || value === '{}') {
          // Complex value
          const newObj = value === '{}' ? {} : [];
          current[key.trim()] = newObj;
          stack.push({ obj: newObj, indent });
        } else if (value.startsWith('[') && value.endsWith(']')) {
          current[key.trim()] = JSON.parse(value);
        } else if (value === 'true' || value === 'false') {
          current[key.trim()] = value === 'true';
        } else if (!isNaN(value)) {
          current[key.trim()] = parseFloat(value);
        } else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          current[key.trim()] = value.slice(1, -1);
        } else {
          current[key.trim()] = value;
        }
      } else if (trimmed.startsWith('- ')) {
        if (Array.isArray(current)) {
          const val = trimmed.slice(2).trim();
          current.push(val);
        }
      }
    }
  }

  if (inMultiline) {
    current[multilineKey] = multilineContent.join('\n');
  }

  return result;
}

// Simple YAML stringifier
function stringifyYAML(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  let result = '';

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'string') {
      if (value.includes('\n')) {
        result += `${spaces}${key}: |-\n`;
        result += value.split('\n').map(line => `${spaces}  ${line}`).join('\n') + '\n';
      } else if (value.includes(':') || value.includes('{') || value.startsWith("'")) {
        result += `${spaces}${key}: '${value}'\n`;
      } else {
        result += `${spaces}${key}: ${value}\n`;
      }
    } else if (typeof value === 'boolean') {
      result += `${spaces}${key}: ${value}\n`;
    } else if (typeof value === 'number') {
      result += `${spaces}${key}: ${value}\n`;
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        result += `${spaces}${key}: []\n`;
      } else if (typeof value[0] === 'object') {
        result += `${spaces}${key}:\n`;
        value.forEach(item => {
          result += `${spaces}  - ${stringifyYAML(item, indent + 2).slice(spaces.length + 2)}`;
        });
      } else {
        result += `${spaces}${key}:\n`;
        value.forEach(item => {
          result += `${spaces}  - ${item}\n`;
        });
      }
    } else if (typeof value === 'object') {
      result += `${spaces}${key}:\n`;
      result += stringifyYAML(value, indent + 1);
    }
  }

  return result;
}

// Test scripts
const getTestScript = (folder, filename) => {
  const name = filename.replace('.request.yaml', '');
  
  if (folder === 'Auth') {
    if (name === 'Login') {
      return `pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("token");
  pm.expect(json.token).to.be.a("string");
  pm.environment.set("token", json.token);
  pm.environment.set("artistToken", json.token);
});

pm.test("Response has user details", function () {
  const json = pm.response.json();
  pm.expect(json.user).to.have.property("id");
  pm.expect(json.user).to.have.property("email");
  pm.expect(json.user).to.have.property("role");
});`;
    } else if (name === 'Register' || name === 'Register Dashboard') {
      return `pm.test("Status code is 200 or 201", function () {
  pm.response.to.have.status([200, 201]);
});

pm.test("Response has token", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("token");
  pm.expect(json.token).to.be.a("string");
  if (json.token) pm.environment.set("token", json.token);
});

pm.test("Response has user data", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("user");
  pm.expect(json.user).to.have.property("id");
  pm.expect(json.user).to.have.property("email");
});`;
    }
  }

  // Default test script based on method
  if (name.startsWith('Get')) {
    return `pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response is valid JSON", function () {
  const json = pm.response.json();
  pm.expect(json).to.be.an("object");
});

pm.test("Response has data", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("data");
});`;
  } else {
    return `pm.test("Status code is 200 or 201", function () {
  pm.response.to.have.status([200, 201]);
});

pm.test("Response has success property", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("success");
});`;
  }
};

function enhanceRequestFile(filepath) {
  try {
    let content = fs.readFileSync(filepath, 'utf8');
    const folder = path.basename(path.dirname(filepath));
    const filename = path.basename(filepath);

    const testCode = getTestScript(folder, filename);

    // Update the test script section
    const scriptPattern = /scripts:\s*\n([\s\S]*?)(?=\n[^\s]|\Z)/;
    const newScriptYAML = `scripts:
  - type: afterResponse
    language: text/javascript
    code: |-
${testCode.split('\n').map(line => `      ${line}`).join('\n')}`;

    if (scriptPattern.test(content)) {
      content = content.replace(scriptPattern, newScriptYAML + '\n');
    } else {
      // Append scripts if not present
      content += '\n' + newScriptYAML + '\n';
    }

    fs.writeFileSync(filepath, content, 'utf8');
    return { success: true, message: "Enhanced" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

function getAllRequestFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files = files.concat(getAllRequestFiles(fullPath));
    } else if (item.endsWith('.request.yaml')) {
      files.push(fullPath);
    }
  });

  return files;
}

function main() {
  const basePath = path.join(__dirname, 'collections', 'EchoVault API');

  if (!fs.existsSync(basePath)) {
    console.log(`Collection path not found: ${basePath}`);
    return;
  }

  const requestFiles = getAllRequestFiles(basePath);

  console.log(`Found ${requestFiles.length} request files\n`);

  let successCount = 0;
  requestFiles.sort().forEach(filepath => {
    const folder = path.basename(path.dirname(filepath));
    const filename = path.basename(filepath);

    const result = enhanceRequestFile(filepath);

    const status = result.success ? "✓" : "✗";
    console.log(`${status} ${folder.padEnd(20)} | ${filename.padEnd(40)} | ${result.message}`);

    if (result.success) {
      successCount++;
    }
  });

  console.log(`\n${'='.repeat(80)}`);
  console.log(`✓ Enhanced ${successCount}/${requestFiles.length} request files`);
  console.log(`✓ Added/updated test scripts on all endpoints`);
}

main();
