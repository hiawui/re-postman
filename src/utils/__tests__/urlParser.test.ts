import { describe, it, expect } from 'vitest'
import {
  parseUrlParams,
  extractBaseUrl,
  buildFullUrl,
  processUrlForDisplay,
  buildFullUrlForDisplay,
  buildFullUrlWithEnvironment,
} from '../urlParser'
import type { Environment } from '@/types'

describe('urlParser', () => {
  describe('parseUrlParams', () => {
    it('should parse URL parameters correctly', () => {
      const url = 'https://api.example.com/users?id=123&name=john'
      const params = parseUrlParams(url)

      expect(params).toEqual([
        ['id', '123'],
        ['name', 'john'],
      ])
    })

    it('should return empty array for URL without parameters', () => {
      const url = 'https://api.example.com/users'
      const params = parseUrlParams(url)

      expect(params).toEqual([])
    })

    it('should handle invalid URLs gracefully', () => {
      const url = 'invalid-url'
      const params = parseUrlParams(url)

      expect(params).toEqual([])
    })
  })

  describe('extractBaseUrl', () => {
    it('should extract base URL without parameters', () => {
      const url = 'https://api.example.com/users?id=123&name=john'
      const baseUrl = extractBaseUrl(url)

      expect(baseUrl).toBe('https://api.example.com/users')
    })

    it('should return original URL if no parameters', () => {
      const url = 'https://api.example.com/users'
      const baseUrl = extractBaseUrl(url)

      expect(baseUrl).toBe('https://api.example.com/users')
    })

    it('should handle invalid URLs gracefully', () => {
      const url = 'invalid-url'
      const baseUrl = extractBaseUrl(url)

      expect(baseUrl).toBe('invalid-url')
    })
  })

  describe('buildFullUrl', () => {
    it('should build URL with parameters', () => {
      const baseUrl = 'https://api.example.com/users'
      const params: [string, string][] = [
        ['id', '123'],
        ['name', 'john'],
      ]
      const fullUrl = buildFullUrl(baseUrl, params)

      expect(fullUrl).toBe('https://api.example.com/users?id=123&name=john')
    })

    it('should handle empty parameters', () => {
      const baseUrl = 'https://api.example.com/users'
      const params: [string, string][] = []
      const fullUrl = buildFullUrl(baseUrl, params)

      expect(fullUrl).toBe('https://api.example.com/users')
    })

    it('should handle invalid base URL gracefully', () => {
      const baseUrl = 'invalid-url'
      const params: [string, string][] = [['id', '123']]
      const fullUrl = buildFullUrl(baseUrl, params)

      expect(fullUrl).toBe('invalid-url')
    })
  })

  describe('processUrlForDisplay', () => {
    it('should decode URL-encoded variables for display', () => {
      const url = 'https://api.example.com/users/%7B%7BuserId%7D%7D'
      const processed = processUrlForDisplay(url)

      expect(processed).toBe('https://api.example.com/users/{{userId}}')
    })

    it('should handle URLs without encoded variables', () => {
      const url = 'https://api.example.com/users/123'
      const processed = processUrlForDisplay(url)

      expect(processed).toBe('https://api.example.com/users/123')
    })
  })

  describe('buildFullUrlForDisplay', () => {
    it('should build URL for display with decoded variables', () => {
      const baseUrl = 'https://api.example.com/users/%7B%7BuserId%7D%7D'
      const params: [string, string][] = [['name', 'john']]
      const fullUrl = buildFullUrlForDisplay(baseUrl, params)

      expect(fullUrl).toBe('https://api.example.com/users/{{userId}}?name=john')
    })
  })

  describe('buildFullUrlWithEnvironment', () => {
    it('should build URL with environment variable replacement', () => {
      const baseUrl = 'https://{{host}}/users/{{userId}}'
      const params: [string, string][] = [['token', '{{apiToken}}']]
      const environments: Environment[] = [
        {
          id: '1',
          name: 'Development',
          variables: {
            host: 'api.dev.example.com',
            userId: '123',
            apiToken: 'dev-token',
          },
          isActive: true,
        },
      ]

      const fullUrl = buildFullUrlWithEnvironment(baseUrl, params, environments)

      expect(fullUrl).toBe(
        'https://api.dev.example.com/users/123?token=dev-token'
      )
    })

    it('should handle empty environments', () => {
      const baseUrl = 'https://api.example.com/users'
      const params: [string, string][] = [['id', '123']]
      const fullUrl = buildFullUrlWithEnvironment(baseUrl, params, [])

      expect(fullUrl).toBe('https://api.example.com/users?id=123')
    })
  })
})
