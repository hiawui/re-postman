# 测试指南

本项目使用 Vitest 和 React Testing Library 进行自动化测试。

## 测试框架

- **Vitest**: 快速、现代的测试运行器
- **React Testing Library**: React 组件测试库
- **jsdom**: 浏览器环境模拟
- **@testing-library/jest-dom**: 额外的 DOM 匹配器

## 运行测试

### 基本命令

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试（一次性）
npm run test:run

# 监听模式运行测试
npm run test:watch

# 使用 UI 界面运行测试
npm run test:ui
```

### 运行特定测试

```bash
# 运行特定文件的测试
npm test src/utils/__tests__/urlParser.test.ts

# 运行特定目录的测试
npm test src/utils/

# 运行匹配特定模式的测试
npm test -- --grep "urlParser"
```

## 测试文件结构

```
src/
├── test/
│   ├── setup.ts              # 测试设置文件
│   └── test-utils.tsx        # 测试工具函数
├── components/
│   └── ComponentName/
│       ├── ComponentName.tsx
│       └── __tests__/
│           └── ComponentName.test.tsx
├── utils/
│   ├── utility.ts
│   └── __tests__/
│       └── utility.test.ts
└── services/
    ├── service.ts
    └── __tests__/
        └── service.test.ts
```

## 编写测试

### 组件测试

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../test/test-utils'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles user interaction', () => {
    render(<MyComponent />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('Clicked!')).toBeInTheDocument()
  })
})
```

### 工具函数测试

```tsx
import { describe, it, expect } from 'vitest'
import { myUtility } from '../myUtility'

describe('myUtility', () => {
  it('should process input correctly', () => {
    const result = myUtility('test')
    expect(result).toBe('processed test')
  })

  it('should handle edge cases', () => {
    const result = myUtility('')
    expect(result).toBe('')
  })
})
```

### 服务测试

```tsx
import { describe, it, expect, vi } from 'vitest'
import { MyService } from '../MyService'

// Mock 外部依赖
vi.mock('../externalDependency')

describe('MyService', () => {
  it('should make API call successfully', async () => {
    const mockResponse = { data: 'success' }
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse)
    })

    const result = await MyService.fetchData()
    expect(result).toEqual(mockResponse)
  })
})
```

## 测试最佳实践

### 1. 测试命名

- 使用描述性的测试名称
- 遵循 "should" 模式：`it('should do something when condition')`

### 2. 测试结构

- 使用 `describe` 块组织相关测试
- 每个测试只测试一个功能点
- 使用 `beforeEach` 和 `afterEach` 进行设置和清理

### 3. 断言

- 使用具体的断言，避免过于宽泛的检查
- 优先使用 Testing Library 的查询方法
- 使用 `@testing-library/jest-dom` 的匹配器

### 4. Mock 和 Stub

- 只 mock 外部依赖，不 mock 被测试的代码
- 使用 `vi.fn()` 创建 mock 函数
- 使用 `vi.mock()` mock 模块

### 5. 覆盖率

- 目标覆盖率：80% 以上
- 关注业务逻辑的覆盖率，而不是简单的代码行数
- 定期检查覆盖率报告

## 常见问题

### 1. Chrome API Mock

在测试中，Chrome 扩展 API 已经被 mock：

```tsx
// 在 setup.ts 中已经配置
Object.defineProperty(window, 'chrome', {
  value: {
    runtime: { sendMessage: vi.fn() },
    storage: { local: { get: vi.fn(), set: vi.fn() } },
    // ...
  }
})
```

### 2. i18n 测试

国际化功能在测试中已经被 mock：

```tsx
// 在 setup.ts 中已经配置
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn(), language: 'en' }
  })
}))
```

### 3. Ant Design 组件测试

Ant Design 组件可以直接测试，但需要注意：

- 使用 `getByRole` 查询按钮、输入框等
- 使用 `getByText` 查询文本内容
- 使用 `getByTestId` 查询自定义测试 ID

## 持续集成

测试已集成到 CI/CD 流程中：

- 每次提交都会运行测试
- 测试失败会阻止部署
- 覆盖率报告会自动生成

## 调试测试

### 使用 UI 界面

```bash
npm run test:ui
```

### 调试特定测试

```bash
# 在测试中添加 debugger 语句
npm test -- --reporter=verbose
```

### 查看详细输出

```bash
npm test -- --reporter=verbose --no-coverage
``` 