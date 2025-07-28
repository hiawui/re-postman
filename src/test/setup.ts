import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Chrome API
Object.defineProperty(window, 'chrome', {
  value: {
    runtime: {
      sendMessage: vi.fn(),
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
    storage: {
      local: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
      },
      sync: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
      },
    },
    tabs: {
      query: vi.fn(),
      sendMessage: vi.fn(),
    },
  },
  writable: true,
})

// Mock fetch
Object.defineProperty(window, 'fetch', {
  value: vi.fn(),
  writable: true,
})

// Mock ResizeObserver
Object.defineProperty(window, 'ResizeObserver', {
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
  writable: true,
})

// Mock IntersectionObserver
Object.defineProperty(window, 'IntersectionObserver', {
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
  writable: true,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}))
