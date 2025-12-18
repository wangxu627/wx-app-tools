#!/usr/bin/env node

// const fs = require('fs');
// const path = require('path');
// const { execSync } = require('child_process');

// class BuildScript {
//   constructor() {
//     this.args = this.parseArgs();
//     this.config = this.loadConfig();
//   }

//   parseArgs() {
//     const args = {
//       environment: 'development',
//       skipNginxReload: false,
//       dryRun: false,
//       customPath: null,
//       help: false
//     };

//     for (let i = 2; i < process.argv.length; i++) {
//       const arg = process.argv[i];
//       switch (arg) {
//         case '-e':
//         case '--environment':
//           args.environment = process.argv[++i];
//           break;
//         case '-p':
//         case '--path':
//           args.customPath = process.argv[++i];
//           break;
//         case '--skip-nginx-reload':
//           args.skipNginxReload = true;
//           break;
//         case '--dry-run':
//           args.dryRun = true;
//           break;
//         case '-h':
//         case '--help':
//           args.help = true;
//           break;
//       }
//     }

//     return args;
//   }

//   loadConfig() {
//     try {
//       const configPath = path.join(__dirname, 'build.config.json');
//       const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
//       return config[this.args.environment] || config.development;
//     } catch (error) {
//       this.log('❌ Failed to read build.config.json', 'red');
//       process.exit(1);
//     }
//   }

//   log(message, color = 'white') {
//     const colors = {
//       red: '\x1b[31m',
//       green: '\x1b[32m',
//       yellow: '\x1b[33m',
//       blue: '\x1b[34m',
//       cyan: '\x1b[36m',
//       white: '\x1b[37m',
//       reset: '\x1b[0m'
//     };
//     console.log(`${colors[color]}${message}${colors.reset}`);
//   }

//   async exec(command, options = {}) {
//     try {
//       const result = execSync(command, { 
//         encoding: 'utf8', 
//         stdio: options.silent ? 'pipe' : 'inherit',
//         ...options 
//       });
//       return result;
//     } catch (error) {
//       throw new Error(`Command failed: ${command}\n${error.message}`);
//     }
//   }

//   showHelp() {
//     this.log('🛠️  WX App Tools Build Script', 'cyan');
//     console.log('');
//     this.log('Usage:', 'white');
//     this.log('  node build.js [options]', 'white');
//     console.log('');
//     this.log('Options:', 'white');
//     this.log('  -e, --environment <env>    Target environment (development|staging|production)', 'white');
//     this.log('  -p, --path <path>          Custom nginx deployment path', 'white');
//     this.log('  --skip-nginx-reload        Skip nginx reload after deployment', 'white');
//     this.log('  --dry-run                  Show what would be done without making changes', 'white');
//     this.log('  -h, --help                 Show this help message', 'white');
//     console.log('');
//     this.log('Examples:', 'white');
//     this.log('  node build.js                                    # Build for development', 'white');
//     this.log('  node build.js -e production                     # Build for production', 'white');
//     this.log('  node build.js -p /var/www/custom-path           # Use custom path', 'white');
//     this.log('  node build.js --dry-run                         # Preview changes', 'white');
//   }

//   async build() {
//     if (this.args.help) {
//       this.showHelp();
//       return;
//     }

//     this.log(`🚀 Starting build for environment: ${this.args.environment}`, 'cyan');

//     // 使用自定义路径
//     if (this.args.customPath) {
//       this.config.nginxPath = this.args.customPath;
//       this.log(`📁 Using custom nginx path: ${this.args.customPath}`, 'yellow');
//     }

//     this.log('📋 Build Configuration:', 'green');
//     this.log(`   Nginx Path: ${this.config.nginxPath}`, 'white');
//     this.log(`   Base URL: ${this.config.baseUrl}`, 'white');
//     this.log(`   Nginx Reload: ${this.config.nginxReload}`, 'white');

//     if (this.args.dryRun) {
//       this.log('🔍 DRY RUN MODE - No actual changes will be made', 'yellow');
//       return;
//     }

//     try {
//       // 设置环境变量
//       process.env.BUILD_ENV = this.args.environment;
//       process.env.NODE_ENV = this.args.environment === 'production' ? 'production' : 'development';

//       // 清理旧构建
//       this.log('🧹 Cleaning previous build...', 'yellow');
//       if (fs.existsSync('dist')) {
//         fs.rmSync('dist', { recursive: true, force: true });
//       }

//       // 构建项目
//       this.log('🔨 Building project...', 'yellow');
//       await this.exec('npm run build');

//       // 创建目标目录
//       const nginxDir = path.dirname(this.config.nginxPath);
//       if (!fs.existsSync(nginxDir)) {
//         this.log(`📁 Creating nginx directory: ${nginxDir}`, 'yellow');
//         fs.mkdirSync(nginxDir, { recursive: true });
//       }

//       // 备份现有文件
//       if (fs.existsSync(this.config.nginxPath)) {
//         const backupPath = `${this.config.nginxPath}.backup.${new Date().toISOString().replace(/:/g, '-')}`;
//         this.log(`💾 Backing up existing files to: ${backupPath}`, 'yellow');
//         fs.renameSync(this.config.nginxPath, backupPath);
//       }

//       // 部署新文件
//       this.log('🚀 Deploying to nginx path...', 'yellow');
//       fs.cpSync('dist', this.config.nginxPath, { recursive: true });

//       // 重新加载 nginx
//       if (this.config.nginxReload && !this.args.skipNginxReload) {
//         this.log('🔄 Reloading nginx...', 'yellow');
//         try {
//           if (process.platform === 'win32') {
//             await this.exec('nginx -s reload', { silent: true });
//           } else {
//             try {
//               await this.exec('sudo systemctl reload nginx', { silent: true });
//             } catch {
//               await this.exec('sudo nginx -s reload', { silent: true });
//             }
//           }
//         } catch (error) {
//           this.log('⚠️ Failed to reload nginx. You may need to restart manually.', 'yellow');
//         }
//       }

//       this.log('✅ Build and deployment completed successfully!', 'green');
//       this.log(`🌐 Application deployed to: ${this.config.nginxPath}`, 'green');
//       this.log(`🔗 Base URL: ${this.config.baseUrl}`, 'green');

//     } catch (error) {
//       this.log(`❌ Build failed: ${error.message}`, 'red');
//       process.exit(1);
//     }
//   }
// }

// // 执行构建
// const buildScript = new BuildScript();
// buildScript.build();




import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// ES 模块中获取 __dirname 的方法
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BuildScript {
  constructor() {
    this.args = this.parseArgs();
    this.config = this.loadConfig();
  }

  parseArgs() {
    const args = {
      environment: 'development',
      skipNginxReload: false,
      dryRun: false,
      customPath: null,
      help: false
    };

    for (let i = 2; i < process.argv.length; i++) {
      const arg = process.argv[i];
      switch (arg) {
        case '-e':
        case '--environment':
          args.environment = process.argv[++i];
          break;
        case '-p':
        case '--path':
          args.customPath = process.argv[++i];
          break;
        case '--skip-nginx-reload':
          args.skipNginxReload = true;
          break;
        case '--dry-run':
          args.dryRun = true;
          break;
        case '-h':
        case '--help':
          args.help = true;
          break;
      }
    }

    return args;
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, 'build.config.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      return config[this.args.environment] || config.development;
    } catch (error) {
      this.log('❌ Failed to read build.config.json', 'red');
      process.exit(1);
    }
  }

  log(message, color = 'white') {
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  exec(command, options = {}) {
    try {
      const result = execSync(command, { 
        encoding: 'utf8', 
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options 
      });
      return result;
    } catch (error) {
      throw new Error(`Command failed: ${command}\n${error.message}`);
    }
  }

  showHelp() {
    this.log('🛠️  WX App Tools Build Script', 'cyan');
    console.log('');
    this.log('Usage:', 'white');
    this.log('  node build.js [options]', 'white');
    console.log('');
    this.log('Options:', 'white');
    this.log('  -e, --environment <env>    Target environment (development|staging|production)', 'white');
    this.log('  -p, --path <path>          Custom nginx deployment path', 'white');
    this.log('  --skip-nginx-reload        Skip nginx reload after deployment', 'white');
    this.log('  --dry-run                  Show what would be done without making changes', 'white');
    this.log('  -h, --help                 Show this help message', 'white');
    console.log('');
    this.log('Examples:', 'white');
    this.log('  node build.js                                    # Build for development', 'white');
    this.log('  node build.js -e production                     # Build for production', 'white');
    this.log('  node build.js -p /var/www/custom-path           # Use custom path', 'white');
    this.log('  node build.js --dry-run                         # Preview changes', 'white');
  }

  async build() {
    if (this.args.help) {
      this.showHelp();
      return;
    }

    this.log(`🚀 Starting build for environment: ${this.args.environment}`, 'cyan');

    // 使用自定义路径
    if (this.args.customPath) {
      this.config.nginxPath = this.args.customPath;
      this.log(`📁 Using custom nginx path: ${this.args.customPath}`, 'yellow');
    }

    this.log('📋 Build Configuration:', 'green');
    this.log(`   Nginx Path: ${this.config.nginxPath}`, 'white');
    this.log(`   Base URL: ${this.config.baseUrl}`, 'white');
    this.log(`   Nginx Reload: ${this.config.nginxReload}`, 'white');

    if (this.args.dryRun) {
      this.log('🔍 DRY RUN MODE - No actual changes will be made', 'yellow');
      return;
    }

    try {
      // 设置环境变量
      process.env.BUILD_ENV = this.args.environment;
      process.env.NODE_ENV = this.args.environment === 'production' ? 'production' : 'development';

      // 清理旧构建
      this.log('🧹 Cleaning previous build...', 'yellow');
      if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true, force: true });
      }

      // 构建项目
      this.log('🔨 Building project...', 'yellow');
      this.exec('npm run build');

      // 创建目标目录
      const nginxDir = path.dirname(this.config.nginxPath);
      if (!fs.existsSync(nginxDir)) {
        this.log(`📁 Creating nginx directory: ${nginxDir}`, 'yellow');
        fs.mkdirSync(nginxDir, { recursive: true });
      }

      // 备份现有文件
      if (fs.existsSync(this.config.nginxPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -1);
        const backupPath = `${this.config.nginxPath}.backup.${timestamp}`;
        this.log(`💾 Backing up existing files to: ${backupPath}`, 'yellow');
        fs.renameSync(this.config.nginxPath, backupPath);
      }

      // 部署新文件
      this.log('🚀 Deploying to nginx path...', 'yellow');
      fs.cpSync('dist', this.config.nginxPath, { recursive: true });

      // 重新加载 nginx
      if (this.config.nginxReload && !this.args.skipNginxReload) {
        this.log('🔄 Reloading nginx...', 'yellow');
        try {
          if (process.platform === 'win32') {
            this.exec('nginx -s reload', { silent: true });
          } else {
            try {
              this.exec('sudo systemctl reload nginx', { silent: true });
            } catch {
              this.exec('sudo nginx -s reload', { silent: true });
            }
          }
        } catch (error) {
          this.log('⚠️ Failed to reload nginx. You may need to restart manually.', 'yellow');
        }
      }

      this.log('✅ Build and deployment completed successfully!', 'green');
      this.log(`🌐 Application deployed to: ${this.config.nginxPath}`, 'green');
      this.log(`🔗 Base URL: ${this.config.baseUrl}`, 'green');

    } catch (error) {
      this.log(`❌ Build failed: ${error.message}`, 'red');
      process.exit(1);
    }
  }
}

// 执行构建
const buildScript = new BuildScript();
buildScript.build();