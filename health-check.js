const http = require('http');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: body,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function checkDependencies(packagePath) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const nodeModulesPath = path.join(path.dirname(packagePath), 'node_modules');
    return {
      hasPackageJson: true,
      hasNodeModules: fs.existsSync(nodeModulesPath),
      dependencies: Object.keys(packageJson.dependencies || {}),
      devDependencies: Object.keys(packageJson.devDependencies || {}),
      name: packageJson.name
    };
  } catch (error) {
    return {
      hasPackageJson: false,
      hasNodeModules: false,
      dependencies: [],
      devDependencies: [],
      name: 'unknown'
    };
  }
}

// Health check functions
async function checkBackendHealth() {
  log('\n🔍 Checking Backend Health...', 'blue');

  const checks = {
    fileStructure: false,
    dependencies: false,
    serverResponse: false,
    apiEndpoints: false
  };

  // Check file structure
  const backendFiles = [
    'backend/package.json',
    'backend/server.js'
  ];

  let allFilesExist = true;
  backendFiles.forEach(file => {
    if (checkFileExists(file)) {
      log(`  ✅ ${file} exists`, 'green');
    } else {
      log(`  ❌ ${file} missing`, 'red');
      allFilesExist = false;
    }
  });
  checks.fileStructure = allFilesExist;

  // Check dependencies
  const backendDeps = checkDependencies('backend/package.json');
  if (backendDeps.hasPackageJson && backendDeps.hasNodeModules) {
    log(`  ✅ Dependencies installed (${backendDeps.dependencies.length} deps)`, 'green');
    checks.dependencies = true;
  } else {
    log(`  ❌ Dependencies not installed`, 'red');
  }

  // Check server response
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/',
      method: 'GET'
    });

    if (response.success) {
      log(`  ✅ Server responding (${response.status})`, 'green');
      checks.serverResponse = true;
    } else {
      log(`  ❌ Server error (${response.status})`, 'red');
    }
  } catch (error) {
    log(`  ❌ Server not reachable: ${error.message}`, 'red');
  }

  // Check API endpoints
  if (checks.serverResponse) {
    try {
      const apiResponse = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/notes',
        method: 'GET'
      });

      if (apiResponse.success) {
        const notes = JSON.parse(apiResponse.data);
        log(`  ✅ API responding (${notes.length} notes)`, 'green');
        checks.apiEndpoints = true;
      } else {
        log(`  ❌ API error (${apiResponse.status})`, 'red');
      }
    } catch (error) {
      log(`  ❌ API not reachable: ${error.message}`, 'red');
    }
  }

  return checks;
}

async function checkFrontendHealth() {
  log('\n🔍 Checking Frontend Health...', 'blue');

  const checks = {
    fileStructure: false,
    dependencies: false,
    buildFiles: false,
    serverResponse: false
  };

  // Check file structure
  const frontendFiles = [
    'frontend/package.json',
    'frontend/vite.config.ts',
    'frontend/tsconfig.json',
    'frontend/index.html',
    'frontend/src/main.tsx',
    'frontend/src/App.tsx',
    'frontend/src/api.ts',
    'frontend/src/types.ts',
    'frontend/src/index.css'
  ];

  let allFilesExist = true;
  frontendFiles.forEach(file => {
    if (checkFileExists(file)) {
      log(`  ✅ ${file} exists`, 'green');
    } else {
      log(`  ❌ ${file} missing`, 'red');
      allFilesExist = false;
    }
  });
  checks.fileStructure = allFilesExist;

  // Check dependencies
  const frontendDeps = checkDependencies('frontend/package.json');
  if (frontendDeps.hasPackageJson && frontendDeps.hasNodeModules) {
    log(`  ✅ Dependencies installed (${frontendDeps.dependencies.length} deps)`, 'green');
    checks.dependencies = true;
  } else {
    log(`  ❌ Dependencies not installed`, 'red');
  }

  // Check if frontend server is running
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    });

    if (response.success) {
      log(`  ✅ Frontend server responding (${response.status})`, 'green');
      checks.serverResponse = true;
    } else {
      log(`  ❌ Frontend server error (${response.status})`, 'red');
    }
  } catch (error) {
    log(`  ⚠️  Frontend server not running (this is OK if not started)`, 'yellow');
  }

  return checks;
}

function checkProjectStructure() {
  log('\n🔍 Checking Project Structure...', 'blue');

  const requiredFiles = [
    'package.json',
    'README.md',
    'QUICKSTART.md',
    'start-dev.sh',
    '.gitignore'
  ];

  const requiredDirs = [
    'backend',
    'frontend'
  ];

  let allOk = true;

  requiredFiles.forEach(file => {
    if (checkFileExists(file)) {
      log(`  ✅ ${file} exists`, 'green');
    } else {
      log(`  ❌ ${file} missing`, 'red');
      allOk = false;
    }
  });

  requiredDirs.forEach(dir => {
    if (checkFileExists(dir)) {
      log(`  ✅ ${dir}/ directory exists`, 'green');
    } else {
      log(`  ❌ ${dir}/ directory missing`, 'red');
      allOk = false;
    }
  });

  return allOk;
}

function generateReport(backendHealth, frontendHealth, projectStructure) {
  log('\n📊 Health Check Report', 'cyan');
  log('='.repeat(50), 'cyan');

  // Project Structure
  log(`Project Structure: ${projectStructure ? '✅ GOOD' : '❌ ISSUES'}`,
       projectStructure ? 'green' : 'red');

  // Backend
  const backendScore = Object.values(backendHealth).filter(Boolean).length;
  const backendTotal = Object.keys(backendHealth).length;
  log(`Backend Health: ${backendScore}/${backendTotal} checks passed`,
       backendScore === backendTotal ? 'green' : 'yellow');

  Object.entries(backendHealth).forEach(([check, passed]) => {
    log(`  - ${check}: ${passed ? '✅' : '❌'}`, passed ? 'green' : 'red');
  });

  // Frontend
  const frontendScore = Object.values(frontendHealth).filter(Boolean).length;
  const frontendTotal = Object.keys(frontendHealth).length;
  log(`Frontend Health: ${frontendScore}/${frontendTotal} checks passed`,
       frontendScore === frontendTotal ? 'green' : 'yellow');

  Object.entries(frontendHealth).forEach(([check, passed]) => {
    log(`  - ${check}: ${passed ? '✅' : '❌'}`, passed ? 'green' : 'red');
  });

  // Overall status
  const overallHealth = projectStructure &&
                       backendScore >= 3 &&
                       frontendScore >= 2;

  log(`\n🎯 Overall Status: ${overallHealth ? '🟢 HEALTHY' : '🟡 NEEDS ATTENTION'}`,
      overallHealth ? 'green' : 'yellow');

  // Recommendations
  log('\n💡 Recommendations:', 'magenta');

  if (!projectStructure) {
    log('  - Fix missing project files', 'yellow');
  }

  if (backendScore < 4) {
    log('  - Install backend dependencies: cd backend && npm install', 'yellow');
    log('  - Start backend server: cd backend && npm run dev', 'yellow');
  }

  if (frontendScore < 3) {
    log('  - Install frontend dependencies: cd frontend && npm install', 'yellow');
    log('  - Start frontend server: cd frontend && npm run dev', 'yellow');
  }

  if (overallHealth) {
    log('  - Everything looks good! 🎉', 'green');
    log('  - Visit http://localhost:3000 to use the app', 'green');
    log('  - API available at http://localhost:3001/api/notes', 'green');
  }
}

// Main health check function
async function runHealthCheck() {
  log('🏥 Shiori Notes App - Health Check', 'cyan');
  log('='.repeat(50), 'cyan');

  try {
    const projectStructure = checkProjectStructure();
    const backendHealth = await checkBackendHealth();
    const frontendHealth = await checkFrontendHealth();

    generateReport(backendHealth, frontendHealth, projectStructure);

    log('\n📝 Next Steps:', 'blue');
    log('1. If servers are not running:', 'blue');
    log('   npm run dev (or ./start-dev.sh)', 'blue');
    log('2. Test API endpoints:', 'blue');
    log('   npm run test:api', 'blue');
    log('3. Visit the app:', 'blue');
    log('   http://localhost:3000', 'blue');

  } catch (error) {
    log(`\n❌ Health check failed: ${error.message}`, 'red');
  }
}

// Run if called directly
if (require.main === module) {
  runHealthCheck();
}

module.exports = {
  runHealthCheck,
  checkBackendHealth,
  checkFrontendHealth,
  checkProjectStructure
};
