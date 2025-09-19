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

function createRePostmanLogo(width, height) {
  // 创建 canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // 设置背景为亮蓝色
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1890ff');
  gradient.addColorStop(1, '#096dd9');
  
  // 填充背景
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // 设置文字样式
  const fontSize = Math.floor(width * 0.15); // 根据宽度调整字体大小
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 添加文字阴影效果（模拟发光效果）
  ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // 绘制 "RePostman" 文字
  const text = 'RePostman';
  const x = width / 2;
  const y = height / 2;
  
  ctx.fillText(text, x, y);
  
  // 重置阴影
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  return canvas;
}

async function generateLogo() {
  const width = 440;
  const height = 280;
  
  console.log(`🔄 正在生成 ${width}x${height} 的 RePostman 标志...`);
  
  try {
    // 创建标志
    const canvas = createRePostmanLogo(width, height);
    
    // 确保输出目录存在
    const outputDir = path.join(__dirname, '..', 'public', 'assets');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 保存为 PNG
    const outputPath = path.join(outputDir, 'logo-440x280.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ 标志生成完成: ${outputPath}`);
    console.log(`📏 尺寸: ${width}x${height} 像素`);
    console.log(`📁 文件位置: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
  }
}

// 运行生成函数
generateLogo().catch(console.error);
