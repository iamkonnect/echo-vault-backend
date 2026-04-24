/**
 * EchoVault API - Pre-Request & Test Script Library
 * Include these snippets in your request scripts
 */

// ============================================
// AUTH SCRIPTS
// ============================================

// Auto-refresh token if expired
const refreshTokenIfNeeded = () => {
  const token = pm.environment.get("token");
  const tokenExpiry = pm.environment.get("tokenExpiry");
  
  if (!token || !tokenExpiry) return false;
  
  const now = new Date().getTime() / 1000;
  if (now > tokenExpiry - 300) { // Refresh 5 min before expiry
    console.log("Token expired, refreshing...");
    
    pm.sendRequest({
      url: pm.environment.get("baseUrl") + "/api/auth/refresh",
      method: "POST",
      header: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    }, (err, response) => {
      if (!err && response.code === 200) {
        const newToken = response.json().token;
        pm.environment.set("token", newToken);
        console.log("Token refreshed successfully");
      } else {
        console.error("Token refresh failed");
      }
    });
    return true;
  }
  return false;
};

// Set auth header with current token
const setAuthHeader = () => {
  const token = pm.environment.get("token");
  if (token) {
    pm.request.headers.upsert({
      key: "Authorization",
      value: "Bearer " + token
    });
  }
};

// ============================================
// REQUEST VALIDATION SCRIPTS
// ============================================

// Validate request body structure
const validateRequest = (required = []) => {
  const body = pm.request.body;
  if (!body || !body.raw) return false;
  
  try {
    const json = JSON.parse(body.raw);
    for (let field of required) {
      if (!json.hasOwnProperty(field)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    return true;
  } catch (e) {
    console.error("Request validation failed:", e.message);
    return false;
  }
};

// ============================================
// RESPONSE TEST SCRIPTS
// ============================================

// Standard success test
const testSuccess = (expectedStatus = 200) => {
  pm.test(`Status is ${expectedStatus}`, () => {
    pm.response.to.have.status(expectedStatus);
  });
  
  pm.test("Has valid JSON", () => {
    pm.response.to.be.json;
  });
};

// Test auth response
const testAuthResponse = () => {
  pm.test("Has token", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("token");
    pm.expect(json.token).to.be.a("string");
  });
  
  pm.test("Has user data", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("user");
    pm.expect(json.user).to.have.property("id");
    pm.expect(json.user).to.have.property("email");
    pm.expect(json.user).to.have.property("role");
  });
};

// Test data response
const testDataResponse = () => {
  pm.test("Has data field", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("data");
  });
  
  pm.test("Data is valid", () => {
    const json = pm.response.json();
    pm.expect(json.data).to.be.an("object");
  });
};

// Test array response
const testArrayResponse = (minLength = 1) => {
  pm.test(`Data is array with ${minLength}+ items`, () => {
    const json = pm.response.json();
    pm.expect(json.data).to.be.an("array");
    pm.expect(json.data.length).to.be.at.least(minLength);
  });
};

// Test error response
const testErrorResponse = (expectedStatus = 400) => {
  pm.test(`Status is ${expectedStatus}`, () => {
    pm.response.to.have.status(expectedStatus);
  });
  
  pm.test("Has error message", () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property("message");
  });
};

// Test response time
const testResponseTime = (maxMs = 1000) => {
  pm.test(`Response time < ${maxMs}ms`, () => {
    pm.expect(pm.response.responseTime).to.be.below(maxMs);
  });
};

// Test pagination
const testPagination = () => {
  pm.test("Has pagination data", () => {
    const json = pm.response.json().data;
    pm.expect(json).to.have.property("total");
    pm.expect(json).to.have.property("page");
    pm.expect(json).to.have.property("limit");
  });
};

// ============================================
// DATA EXTRACTION SCRIPTS
// ============================================

// Extract and save token
const saveToken = (envVar = "token") => {
  const json = pm.response.json();
  if (json.token) {
    pm.environment.set(envVar, json.token);
    console.log(`Saved ${envVar}:`, json.token.substring(0, 20) + "...");
  }
};

// Extract and save ID for chain testing
const saveId = (idField = "id", envVar = "lastId") => {
  const json = pm.response.json();
  let id;
  
  if (json.data && json.data[idField]) {
    id = json.data[idField];
  } else if (json[idField]) {
    id = json[idField];
  }
  
  if (id) {
    pm.environment.set(envVar, id);
    console.log(`Saved ${envVar}:`, id);
  }
};

// Extract and save nested data
const saveData = (path, envVar) => {
  const json = pm.response.json();
  let value = json;
  
  for (let key of path.split('.')) {
    value = value[key];
    if (!value) break;
  }
  
  if (value) {
    pm.environment.set(envVar, JSON.stringify(value));
    console.log(`Saved ${envVar}`);
  }
};

// ============================================
// UTILITY SCRIPTS
// ============================================

// Generate random ID
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Generate timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Validate email format
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Chain requests (call one request after another)
const chainRequest = (requestName, callback) => {
  pm.sendRequest(pm.collection.requests.find(r => r.name === requestName), 
    (err, response) => {
      if (!err) {
        callback(response);
      } else {
        console.error("Chain request failed:", err);
      }
    });
};

// ============================================
// EXAMPLE USAGE
// ============================================

/*

// In PRE-REQUEST tab:
refreshTokenIfNeeded();
setAuthHeader();

// In TESTS tab:
testSuccess(200);
testDataResponse();
saveId("id", "artistId");
testResponseTime(500);

// For auth endpoints:
testSuccess(200);
testAuthResponse();
saveToken("artistToken");

// For array endpoints:
testSuccess(200);
testArrayResponse(1);
testPagination();
testResponseTime(1000);

// For error cases:
testErrorResponse(401);

*/
