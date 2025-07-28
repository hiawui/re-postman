import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// 自定义渲染器
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// 重新导出所有内容
export * from '@testing-library/react'
export { customRender as render }
