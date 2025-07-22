import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保 canvas 已安装
try {
  await import('canvas');
} catch (error) {
  console.error('❌ 需要安装 canvas 包: npm install canvas');
  process.exit(1);
}

async function svgToPng(svgPath, pngPath, size) {
  try {
    // 读取 SVG 文件
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // 创建 canvas
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // 创建图片对象
    const img = await loadImage('data:image/svg+xml;base64,' + Buffer.from(svgContent).toString('base64'));
    
    // 绘制到 canvas
    ctx.drawImage(img, 0, 0, size, size);
    
    // 保存为 PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(pngPath, buffer);
    
    console.log(`✅ 转换完成: ${path.basename(svgPath)} → ${path.basename(pngPath)}`);
  } catch (error) {
    console.error(`❌ 转换失败: ${svgPath}`, error.message);
  }
}

// 主函数
async function main() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  const sizes = [16, 32, 48, 128];
  
  console.log('🔄 开始转换 SVG 到 PNG...\n');
  
  for (const size of sizes) {
    const svgPath = path.join(iconsDir, `icon${size}.svg`);
    const pngPath = path.join(iconsDir, `icon${size}.png`);
    
    if (fs.existsSync(svgPath)) {
      await svgToPng(svgPath, pngPath, size);
    } else {
      console.log(`⚠️  SVG 文件不存在: ${svgPath}`);
    }
  }
  
  console.log('\n🎉 所有图标转换完成！');
  console.log('📁 图标位置:', iconsDir);
}

main().catch(console.error); 