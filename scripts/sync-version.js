import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const packageJsonPath = path.join(__dirname, '../package.json')
const manifestJsonPath = path.join(__dirname, '../public/manifest.json')

function syncVersion() {
  try {
    // 读取 package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const packageVersion = packageJson.version

    // 读取 manifest.json
    const manifestJson = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'))
    const manifestVersion = manifestJson.version

    console.log(`📦 Package.json version: ${packageVersion}`)
    console.log(`🔧 Manifest.json version: ${manifestVersion}`)

    if (packageVersion !== manifestVersion) {
      // 更新 manifest.json 版本
      manifestJson.version = packageVersion
      fs.writeFileSync(manifestJsonPath, JSON.stringify(manifestJson, null, 2))
      console.log(`✅ 已同步 manifest.json 版本到 ${packageVersion}`)
    } else {
      console.log('✅ 版本号已同步')
    }
  } catch (error) {
    console.error('❌ 同步版本号失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  syncVersion()
}

export { syncVersion } 