# RePostman - 现代化API测试工具

一个功能强大的API测试工具，提供类似Postman的完整功能，支持环境变量、请求集合、历史记录等高级特性。

> 🎉 **当前状态**: 核心功能已完成，Chrome插件版本可用！
> 
> 🚀 **在线体验**: 开发服务器运行在 http://localhost:3000

## 🚀 功能特性

### ✅ 核心功能
- **多标签页管理** - 支持同时打开多个API请求标签页，可添加/删除/切换
- **HTTP请求支持** - 支持GET、POST、PUT、DELETE、PATCH、HEAD、OPTIONS等HTTP方法
- **URL输入** - 完整的URL输入框，支持环境变量替换
- **查询参数编辑** - 动态添加/删除URL查询参数，支持环境变量
- **请求头管理** - 自定义请求头，支持动态添加/删除和环境变量
- **请求体编辑** - 支持JSON、Form Data、x-www-form-urlencoded格式
- **响应状态显示** - 清晰显示HTTP状态码、响应时间、响应大小
- **响应头查看** - 表格形式显示所有响应头
- **响应体查看** - 支持Raw和Preview两种查看模式，自动格式化
- **状态管理** - 完整的Zustand状态管理，数据持久化

### ✅ 高级功能
- **环境变量系统** - 支持多环境配置（开发、测试、生产）
- **变量替换** - 在URL、请求头、请求体中使用 `{{变量名}}` 格式
- **多环境支持** - 可同时激活多个环境，变量按优先级覆盖
- **请求历史记录** - 自动保存请求历史，支持删除和清空
- **请求集合管理** - 组织和管理相关API请求，支持拖拽排序
- **环境切换** - 快速切换不同环境配置
- **变量验证** - 检查未定义的变量并提示

### ✅ Chrome插件特性
- **独立标签页** - 在新标签页中打开，提供完整功能体验
- **响应式布局** - 左侧边栏可拖拽调整宽度
- **紧凑界面** - 参考Postman的界面设计，高效利用空间
- **本地存储** - 所有数据保存在本地，保护隐私

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 4.5.14
- **UI组件库**: Ant Design 5.12.0
- **状态管理**: Zustand 4.4.1
- **HTTP客户端**: Fetch API (原生)
- **拖拽排序**: @hello-pangea/dnd
- **图标**: Ant Design Icons
- **开发工具**: ESLint + Prettier
- **包管理**: npm

## 📁 项目结构

```
/
├── src/
│   ├── components/          # React组件
│   │   ├── RequestPanel/    # 请求面板组件
│   │   │   ├── RequestPanel.tsx    # 主请求面板
│   │   │   ├── UrlInput.tsx        # URL输入
│   │   │   ├── UrlDisplay.tsx      # URL显示
│   │   │   ├── MethodSelector.tsx  # HTTP方法选择
│   │   │   ├── HeadersEditor.tsx   # 请求头编辑
│   │   │   ├── BodyEditor.tsx      # 请求体编辑
│   │   │   └── ParamsEditor.tsx    # 参数编辑
│   │   ├── ResponsePanel/   # 响应面板组件
│   │   │   ├── ResponsePanel.tsx   # 主响应面板
│   │   │   ├── ResponseStatus.tsx  # 响应状态
│   │   │   ├── ResponseHeaders.tsx # 响应头显示
│   │   │   └── ResponseBody.tsx    # 响应体显示
│   │   ├── Tabs/           # 标签页组件
│   │   │   └── TabBar.tsx  # 标签页管理
│   │   ├── EnvironmentPanel/ # 环境变量管理
│   │   │   └── EnvironmentPanel.tsx
│   │   ├── HistoryPanel/   # 历史记录管理
│   │   │   └── HistoryPanel.tsx
│   │   └── CollectionPanel/ # 请求集合管理
│   │       └── CollectionPanel.tsx
│   ├── stores/             # 状态管理
│   │   └── appStore.ts     # 主应用状态
│   ├── types/              # TypeScript类型定义
│   │   └── index.ts        # 类型定义
│   ├── utils/              # 工具函数
│   │   ├── variableReplacer.ts # 变量替换工具
│   │   ├── urlParser.ts    # URL解析工具
│   │   └── httpHeaders.ts  # HTTP头工具
│   ├── services/           # API服务
│   │   ├── httpService.ts  # HTTP请求服务
│   │   ├── storage.ts      # Chrome存储服务
│   │   └── notificationService.ts # 通知服务
│   ├── styles/             # 样式文件
│   │   └── App.css         # 主样式
│   ├── App.tsx             # 主应用组件
│   └── main.tsx            # 入口文件
├── public/                 # 静态资源
│   ├── manifest.json       # Chrome插件清单
│   └── icons/              # 图标文件
├── package.json            # 项目配置
├── vite.config.ts          # Vite配置
├── tsconfig.json           # TypeScript配置
└── README.md               # 项目文档
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Chrome浏览器

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:3000 查看应用

### 构建生产版本
```bash
npm run build
```

### 加载插件到Chrome
1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist` 目录
6. 点击扩展图标，在新标签页中打开

## 🎯 使用指南

### 环境变量使用

1. **创建环境**:
   - 点击顶部"Environment"按钮
   - 点击"添加环境"
   - 输入环境名称（如：开发环境）
   - 添加变量：
     - `base_url`: `https://api.example.com`
     - `api_key`: `your-api-key-here`

2. **使用变量**:
   - 在URL中使用: `{{base_url}}/users`
   - 在请求头中使用: `Authorization: Bearer {{api_key}}`
   - 在请求体中使用: `{"api_key": "{{api_key}}"}`

3. **多环境支持**:
   - 可同时激活多个环境
   - 后激活的环境变量会覆盖先激活的
   - 在请求面板顶部显示当前激活的环境

### 请求历史记录

1. **自动保存**:
   - 每次发送请求后自动保存到历史记录
   - 包含完整的请求信息（URL、方法、头部、参数、响应）

2. **历史管理**:
   - 在左侧"History"面板查看所有历史请求
   - 点击历史请求可恢复完整的请求参数
   - 支持删除单个历史记录或清空所有历史

3. **历史选择**:
   - 点击历史请求自动切换到当前标签页
   - 恢复请求的所有参数和响应信息

### 请求集合管理

1. **创建集合**:
   - 在左侧"Collections"面板点击"New"
   - 输入集合名称
   - 集合用于组织相关的API请求

2. **添加请求到集合**:
   - 在请求面板点击"Add to Collection"
   - 选择目标集合并输入请求名称
   - 请求会保存到集合中（不包含响应信息）

3. **管理集合请求**:
   - 支持编辑请求名称、方法、URL
   - 支持删除请求
   - 支持拖拽排序
   - 点击集合中的请求可加载到当前标签页

4. **保存更新**:
   - 当请求来自集合时，显示"Save"按钮
   - 点击"Save"可更新集合中的请求

### 界面操作

1. **标签页管理**:
   - 点击"+"添加新标签页
   - 点击"×"关闭标签页
   - 支持多个标签页同时工作

2. **侧边栏调整**:
   - 拖拽侧边栏右边缘可调整宽度
   - 支持History和Collections两个面板切换

3. **响应查看**:
   - Raw模式：显示原始响应内容
   - Preview模式：根据Content-Type自动格式化
   - 支持JSON、XML、HTML、Markdown等格式

## 🧪 测试指南

### 快速测试
1. 启动开发服务器: `npm run dev`
2. 访问: http://localhost:3000
3. 测试URL示例:
   - `https://jsonplaceholder.typicode.com/posts/1`
   - `https://httpbin.org/get`
   - `https://api.github.com/users/octocat`

### 环境变量测试
1. 创建测试环境：
   ```
   环境名称: 测试环境
   变量:
   - base_url: https://jsonplaceholder.typicode.com
   - user_id: 1
   ```
2. 测试URL：`{{base_url}}/users/{{user_id}}`

### 功能测试清单
- [x] 添加新标签页
- [x] 输入URL并发送GET请求
- [x] 修改HTTP方法
- [x] 添加查询参数
- [x] 编辑请求头
- [x] 编辑请求体 (POST请求)
- [x] 查看响应状态
- [x] 查看响应头
- [x] 查看响应体 (Raw/Preview)
- [x] 删除标签页
- [x] 环境变量管理
- [x] 变量替换功能
- [x] 多环境支持
- [x] 请求历史记录
- [x] 请求集合管理
- [x] 拖拽排序
- [x] Chrome插件支持

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 BSD 3-Clause 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 灵感来源于 [Postman](https://www.postman.com/)
- 感谢所有开源项目的贡献者

## 📞 联系方式

- 项目主页: [GitHub](https://github.com/hiawui/re-postman)
- 问题反馈: [Issues](https://github.com/hiawui/re-postman/issues)

---

**🎉 当前版本**: v1.0.0 - 核心功能已完成，Chrome插件版本可用！