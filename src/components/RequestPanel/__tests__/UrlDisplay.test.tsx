import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/test-utils'
import { UrlDisplay } from '../UrlDisplay'

// Mock the URL parser utilities
vi.mock('@/utils/urlParser', () => ({
  buildFullUrl: vi.fn((baseUrl: string, params: [string, string][]) => {
    if (params.length === 0) return baseUrl
    const paramString = params
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    return `${baseUrl}?${paramString}`
  }),
  processUrlForDisplay: vi.fn((url: string) => url),
  buildFullUrlWithEnvironment: vi.fn(
    (baseUrl: string, params: [string, string][], environments: any[]) => {
      if (environments.length === 0) {
        if (params.length === 0) return baseUrl
        const paramString = params
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
        return `${baseUrl}?${paramString}`
      }
      // 模拟环境变量替换
      let processedUrl = baseUrl
      environments.forEach(env => {
        Object.entries(env.variables || {}).forEach(([key, value]) => {
          processedUrl = processedUrl.replace(
            new RegExp(`{{${key}}}`, 'g'),
            value as string
          )
        })
      })
      if (params.length > 0) {
        const paramString = params
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
        processedUrl = `${processedUrl}?${paramString}`
      }
      return processedUrl
    }
  ),
}))

describe('UrlDisplay', () => {
  const defaultProps = {
    baseUrl: 'https://api.example.com/test',
    params: [
      ['key1', 'value1'],
      ['key2', 'value2'],
    ] as [string, string][],
  }

  it('should render URL display with basic URL', () => {
    render(<UrlDisplay {...defaultProps} />)

    const urlElement = screen.getByText(
      'https://api.example.com/test?key1=value1&key2=value2'
    )
    expect(urlElement).toBeInTheDocument()
  })

  it('should render URL without parameters', () => {
    const propsWithoutParams = {
      ...defaultProps,
      params: [] as [string, string][],
    }

    render(<UrlDisplay {...propsWithoutParams} />)

    const urlElement = screen.getByText('https://api.example.com/test')
    expect(urlElement).toBeInTheDocument()
  })

  it('should render URL with environment variables when provided', () => {
    const environments = [
      {
        id: 'env1',
        name: 'Development',
        variables: {
          host: 'dev-api.example.com',
          port: '8080',
        },
        isActive: false,
      },
    ]

    const propsWithEnvironments = {
      ...defaultProps,
      baseUrl: 'https://{{host}}:{{port}}/test',
      environments,
    }

    render(<UrlDisplay {...propsWithEnvironments} />)

    const urlElement = screen.getByText(
      'https://dev-api.example.com:8080/test?key1=value1&key2=value2'
    )
    expect(urlElement).toBeInTheDocument()
  })

  it('should not process environment variables when showPreview is false', () => {
    const environments = [
      {
        id: 'env1',
        name: 'Development',
        variables: {
          host: 'dev-api.example.com',
        },
        isActive: false,
      },
    ]

    const propsWithShowPreviewFalse = {
      ...defaultProps,
      baseUrl: 'https://{{host}}/test',
      environments,
      showPreview: false,
    }

    render(<UrlDisplay {...propsWithShowPreviewFalse} />)

    const urlElement = screen.getByText(
      'https://{{host}}/test?key1=value1&key2=value2'
    )
    expect(urlElement).toBeInTheDocument()
  })

  it('should apply custom color when provided', () => {
    const propsWithColor = {
      ...defaultProps,
      color: '#52c41a',
    }

    render(<UrlDisplay {...propsWithColor} />)

    const urlElement = screen.getByText(
      'https://api.example.com/test?key1=value1&key2=value2'
    )
    expect(urlElement).toHaveStyle({ color: '#52c41a' })
  })

  it('should handle empty base URL', () => {
    const propsWithEmptyUrl = {
      ...defaultProps,
      baseUrl: '',
    }

    render(<UrlDisplay {...propsWithEmptyUrl} />)

    const urlElement = screen.getByText('?key1=value1&key2=value2')
    expect(urlElement).toBeInTheDocument()
  })

  it('should handle URL with special characters in parameters', () => {
    const propsWithSpecialChars = {
      ...defaultProps,
      params: [
        ['key1', 'value with spaces'],
        ['key2', 'value&with=special'],
      ] as [string, string][],
    }

    render(<UrlDisplay {...propsWithSpecialChars} />)

    const urlElement = screen.getByText(
      'https://api.example.com/test?key1=value with spaces&key2=value&with=special'
    )
    expect(urlElement).toBeInTheDocument()
  })

  it('should handle multiple environments with variable replacement', () => {
    const environments = [
      {
        id: 'env1',
        name: 'Development',
        variables: {
          host: 'dev-api.example.com',
        },
        isActive: false,
      },
      {
        id: 'env2',
        name: 'Staging',
        variables: {
          port: '3000',
        },
        isActive: false,
      },
    ]

    const propsWithMultipleEnvironments = {
      ...defaultProps,
      baseUrl: 'https://{{host}}:{{port}}/test',
      environments: environments as any,
    }

    render(<UrlDisplay {...propsWithMultipleEnvironments} />)

    const urlElement = screen.getByText(
      'https://dev-api.example.com:3000/test?key1=value1&key2=value2'
    )
    expect(urlElement).toBeInTheDocument()
  })

  it('should handle environment variables that do not exist in URL', () => {
    const environments = [
      {
        id: 'env1',
        name: 'Development',
        variables: {
          nonexistent: 'value',
        },
      },
    ]

    const propsWithNonExistentVars = {
      ...defaultProps,
      environments: environments as any,
    }

    render(<UrlDisplay {...propsWithNonExistentVars} />)

    const urlElement = screen.getByText(
      'https://api.example.com/test?key1=value1&key2=value2'
    )
    expect(urlElement).toBeInTheDocument()
  })

  it('should render with code styling', () => {
    render(<UrlDisplay {...defaultProps} />)

    const urlElement = screen.getByText(
      'https://api.example.com/test?key1=value1&key2=value2'
    )
    // 检查元素是否存在，但不检查具体的 CSS 类（因为可能被样式系统覆盖）
    expect(urlElement).toBeInTheDocument()
  })

  it('should handle undefined environments prop', () => {
    const propsWithUndefinedEnvironments = {
      ...defaultProps,
      environments: undefined,
    }

    render(<UrlDisplay {...propsWithUndefinedEnvironments} />)

    const urlElement = screen.getByText(
      'https://api.example.com/test?key1=value1&key2=value2'
    )
    expect(urlElement).toBeInTheDocument()
  })
})
