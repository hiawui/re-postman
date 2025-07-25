import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import archiver from 'archiver'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')

// 配置
const config = {
  buildDir: 'dist',
  extensionDir: 'extension',
  zipName: 're-postman-extension.zip',
  version: process.env.npm_package_version || '1.0.0'
}

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m', // cyan
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m', // red
    reset: '\x1b[0m'
  }
  console.log(`${colors[type]}${message}${colors.reset}`)
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest))
  fs.copyFileSync(src, dest)
  log(`✅ 复制: ${path.relative(projectRoot, src)} → ${path.relative(projectRoot, dest)}`)
}

function copyDir(src, dest) {
  ensureDir(dest)
  const files = fs.readdirSync(src)
  
  files.forEach(file => {
    const srcPath = path.join(src, file)
    const destPath = path.join(dest, file)
    const stat = fs.statSync(srcPath)
    
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFile(srcPath, destPath)
    }
  })
}

function updateManifestVersion() {
  const manifestPath = path.join(projectRoot, 'public', 'manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  
  manifest.version = config.version
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  log(`✅ 更新 manifest.json 版本到 ${config.version}`)
}

function createZipArchive(sourceDir, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath)
    const archive = archiver('zip', {
      zlib: { level: 9 } // 最高压缩级别
    })

    output.on('close', () => {
      log(`✅ ZIP 文件创建完成: ${path.basename(outputPath)} (${(archive.pointer() / 1024 / 1024).toFixed(2)} MB)`)
      resolve()
    })

    archive.on('error', (err) => {
      reject(err)
    })

    archive.pipe(output)
    archive.directory(sourceDir, false)
    archive.finalize()
  })
}

async function packageExtension() {
  log('🚀 开始打包 Chrome 扩展...')
  
  // 1. 更新版本号
  updateManifestVersion()
  
  // 2. 构建项目
  log('📦 构建项目...')
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: projectRoot })
    log('✅ 项目构建完成')
  } catch (error) {
    log('❌ 项目构建失败', 'error')
    process.exit(1)
  }
  
  // 3. 创建扩展目录
  const extensionPath = path.join(projectRoot, config.extensionDir)
  if (fs.existsSync(extensionPath)) {
    fs.rmSync(extensionPath, { recursive: true })
  }
  ensureDir(extensionPath)
  
  // 4. 复制构建文件
  log('📋 复制构建文件...')
  const buildPath = path.join(projectRoot, config.buildDir)
  copyDir(buildPath, extensionPath)
  
  // 5. 复制 manifest.json
  copyFile(
    path.join(projectRoot, 'public', 'manifest.json'),
    path.join(extensionPath, 'manifest.json')
  )
  
  // 6. 复制 background.js
  copyFile(
    path.join(projectRoot, 'public', 'background.js'),
    path.join(extensionPath, 'background.js')
  )
  
  // 7. 复制图标
  const iconsSrc = path.join(projectRoot, 'public', 'icons')
  const iconsDest = path.join(extensionPath, 'icons')
  copyDir(iconsSrc, iconsDest)
  
  log('✅ 扩展文件准备完成')
  
  // 8. 创建 ZIP 文件
  log('🗜️ 创建 ZIP 文件...')
  try {
    const zipPath = path.join(projectRoot, config.zipName)
    await createZipArchive(extensionPath, zipPath)
  } catch (error) {
    log('❌ ZIP 文件创建失败', 'error')
    log(error.message, 'error')
    process.exit(1)
  }
  
  // 9. 输出信息
  log('\n🎉 Chrome 扩展打包完成!', 'success')
  log(`📁 扩展目录: ${config.extensionDir}/`)
  log(`📦 ZIP 文件: ${config.zipName}`)
  log(`📋 版本: ${config.version}`)
  log('\n📤 上传到 Chrome Web Store:')
  log('1. 访问 https://chrome.google.com/webstore/devconsole/')
  log('2. 点击"添加新项目"')
  log('3. 上传 ZIP 文件')
  log('4. 填写扩展信息')
  log('5. 提交审核')
}

// 运行打包
if (import.meta.url === `file://${process.argv[1]}`) {
  packageExtension().catch(error => {
    log('❌ 打包失败', 'error')
    console.error(error)
    process.exit(1)
  })
}

export { packageExtension } 