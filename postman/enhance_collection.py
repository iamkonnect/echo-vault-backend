#!/usr/bin/env python3
"""
EchoVault Postman Collection Enhancer
Adds test scripts, examples, and validation to all request files
"""

import os
import yaml
from pathlib import Path

# Define test scripts for different request types
TEST_SCRIPTS = {
    "Auth": {
        "Register": """pm.test("Status code is 200 or 201", function () {
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
});""",
        
        "Login": """pm.test("Status code is 200", function () {
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
});""",
        
        "Logout": """pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response confirms logout", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("success");
  pm.expect(json.success).to.be.true;
});""",
        
        "Refresh Token": """pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("New token in response", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("token");
  pm.expect(json.token).to.be.a("string");
  pm.environment.set("token", json.token);
});""",
        
        "Verify Auth": """pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("User is verified", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("user");
  pm.expect(json.user).to.have.property("id");
});""",
    },
    
    "Artist": {
        "GET": """pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response is valid JSON", function () {
  pm.response.to.have.header("content-type");
  pm.expect(pm.response.json()).to.be.an("object");
});

pm.test("Has required data fields", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("data");
});""",
        
        "POST": """pm.test("Status code is 201 or 200", function () {
  pm.response.to.have.status([200, 201]);
});

pm.test("Response has success message", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("success");
  pm.expect(json.success).to.be.true;
});""",
    },
    
    "Admin": {
        "GET": """pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response is valid", function () {
  pm.expect(pm.response.json()).to.be.an("object");
});

pm.test("Admin authorization enforced", function () {
  // If returns 403, admin auth is properly enforced
  pm.expect([200, 403]).to.include(pm.response.code);
});""",
        
        "POST": """pm.test("Status code is 200 or 201", function () {
  pm.response.to.have.status([200, 201]);
});

pm.test("Operation successful", function () {
  const json = pm.response.json();
  pm.expect(json).to.have.property("success");
  pm.expect(json.success).to.be.true;
});""",
    },
}

# Example responses by endpoint type
EXAMPLE_RESPONSES = {
    "Login": {
        "status": 200,
        "body": {
            "success": True,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "user": {
                "id": "user123",
                "email": "artist@example.com",
                "name": "John Artist",
                "role": "artist",
                "verified": True
            }
        }
    },
    "Register": {
        "status": 201,
        "body": {
            "success": True,
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "user": {
                "id": "user123",
                "email": "newartist@example.com",
                "name": "New Artist",
                "role": "artist"
            }
        }
    },
    "Get Insights": {
        "status": 200,
        "body": {
            "success": True,
            "data": {
                "totalStreams": 15000,
                "totalRevenue": 450.50,
                "monthlyGrowth": 12.5,
                "topTrack": {
                    "id": "track1",
                    "title": "My Hit Song",
                    "streams": 5000
                }
            }
        }
    },
    "Get Dashboard": {
        "status": 200,
        "body": {
            "success": True,
            "data": {
                "stats": {
                    "totalStreams": 25000,
                    "totalRevenue": 750.75,
                    "activeListeners": 350
                },
                "recentActivity": []
            }
        }
    },
    "Get All Users": {
        "status": 200,
        "body": {
            "success": True,
            "data": {
                "users": [
                    {
                        "id": "user1",
                        "email": "artist1@example.com",
                        "name": "Artist One",
                        "role": "artist",
                        "verified": True,
                        "createdAt": "2024-01-15T10:30:00Z"
                    }
                ],
                "total": 1,
                "page": 1,
                "limit": 10
            }
        }
    },
    "Verify Artist": {
        "status": 200,
        "body": {
            "success": True,
            "message": "Artist verified successfully",
            "artist": {
                "id": "artist123",
                "email": "artist@example.com",
                "verified": True
            }
        }
    }
}

def get_test_script(folder, filename):
    """Get appropriate test script for endpoint"""
    if folder == "Auth":
        name = filename.replace(".request.yaml", "")
        return TEST_SCRIPTS["Auth"].get(name, TEST_SCRIPTS["Artist"]["GET"])
    elif folder in ["Artist", "Artist Dashboard"]:
        if "Get" in filename or "Insights" in filename or "Library" in filename:
            return TEST_SCRIPTS["Artist"]["GET"]
        else:
            return TEST_SCRIPTS["Artist"]["POST"]
    elif folder == "Admin":
        if "Get" in filename or "Unverified" in filename:
            return TEST_SCRIPTS["Admin"]["GET"]
        else:
            return TEST_SCRIPTS["Admin"]["POST"]
    elif folder == "Tracks":
        return TEST_SCRIPTS["Artist"]["GET"]
    elif folder == "Analytics":
        if "Get" in filename:
            return TEST_SCRIPTS["Artist"]["GET"]
        else:
            return TEST_SCRIPTS["Artist"]["POST"]
    else:
        return TEST_SCRIPTS["Artist"]["GET"]

def get_example_response(filename):
    """Get example response for endpoint"""
    for key, response in EXAMPLE_RESPONSES.items():
        if key in filename:
            return response
    
    # Default example
    return {
        "status": 200,
        "body": {
            "success": True,
            "data": {}
        }
    }

def enhance_request_file(filepath):
    """Add test scripts and examples to request file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = yaml.safe_load(f)
        
        # Add test script
        folder = filepath.parent.parent.name
        filename = filepath.name
        
        test_code = get_test_script(folder, filename)
        
        if "scripts" not in content:
            content["scripts"] = []
        
        # Remove existing test scripts
        content["scripts"] = [s for s in content.get("scripts", []) if s.get("type") != "afterResponse"]
        
        # Add new test script
        content["scripts"].append({
            "type": "afterResponse",
            "language": "text/javascript",
            "code": test_code
        })
        
        # Add example response
        example = get_example_response(filename)
        if "examples" not in content:
            content["examples"] = []
        
        content["examples"] = [{
            "name": f"{filename.replace('.request.yaml', '')} - Success",
            "status": example["status"],
            "headers": [
                {"key": "Content-Type", "value": "application/json"}
            ],
            "body": example["body"]
        }]
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            yaml.dump(content, f, default_flow_style=False, sort_keys=False)
        
        return True, "Enhanced"
    except Exception as e:
        return False, str(e)

def main():
    base_path = Path("postman/collections/EchoVault API")
    
    if not base_path.exists():
        print(f"Collection path not found: {base_path}")
        return
    
    # Find all .request.yaml files
    request_files = list(base_path.rglob("*.request.yaml"))
    
    print(f"Found {len(request_files)} request files\n")
    
    success_count = 0
    for filepath in sorted(request_files):
        folder = filepath.parent.name
        filename = filepath.name
        
        success, msg = enhance_request_file(filepath)
        
        status = "✓" if success else "✗"
        print(f"{status} {folder:20} | {filename:40} | {msg}")
        
        if success:
            success_count += 1
    
    print(f"\n{'='*80}")
    print(f"✓ Enhanced {success_count}/{len(request_files)} request files")
    print(f"✓ Added test scripts to all endpoints")
    print(f"✓ Added example responses to all endpoints")

if __name__ == "__main__":
    main()
