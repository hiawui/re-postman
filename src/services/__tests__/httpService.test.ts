import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpService } from '../httpService'
import type { HttpRequest, Environment } from '@/types'

// Mock fetch
Object.defineProperty(window, 'fetch', {
  value: vi.fn(),
  writable: true,
})

describe('HttpService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendRequest', () => {
    it('should send a GET request successfully', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        text: vi.fn().mockResolvedValue('{"message": "success"}'),
      }

      ;(fetch as any).mockResolvedValue(mockResponse)

      const request: HttpRequest = {
        id: '1',
        name: 'Test Request',
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const response = await HttpService.sendRequest(request)

      expect(fetch).toHaveBeenCalledWith('https://api.example.com/users', {
        method: 'GET',
        headers: {},
      })
      expect(response.status).toBe(200)
      expect(response.body).toBe('{"message": "success"}')
    })

    it('should send a POST request with JSON body', async () => {
      const mockResponse = {
        status: 201,
        statusText: 'Created',
        headers: new Map([['content-type', 'application/json']]),
        text: vi.fn().mockResolvedValue('{"id": 1}'),
      }

      ;(fetch as any).mockResolvedValue(mockResponse)

      const request: HttpRequest = {
        id: '1',
        name: 'Create User',
        method: 'POST',
        url: 'https://api.example.com/users',
        headers: [['Content-Type', 'application/json']],
        body: '{"name": "John"}',
        bodyType: 'json',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const response = await HttpService.sendRequest(request)

      expect(fetch).toHaveBeenCalledWith('https://api.example.com/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{"name": "John"}',
      })
      expect(response.status).toBe(201)
    })

    it('should handle network errors gracefully', async () => {
      ;(fetch as any).mockRejectedValue(new Error('Network error'))

      const request: HttpRequest = {
        id: '1',
        name: 'Test Request',
        method: 'GET',
        url: 'https://api.example.com/users',
        headers: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const response = await HttpService.sendRequest(request)

      expect(response.status).toBe(0)
      expect(response.statusText).toBe('Network Error')
      expect(response.body).toBe('Network error')
    })
  })

  describe('parseUrl', () => {
    it('should parse URL with query parameters', () => {
      const url = 'https://api.example.com/users?id=123&name=john'
      const result = HttpService.parseUrl(url)

      expect(result.baseUrl).toBe('https://api.example.com/users')
      expect(result.params).toEqual({
        id: '123',
        name: 'john',
      })
    })

    it('should handle URL without parameters', () => {
      const url = 'https://api.example.com/users'
      const result = HttpService.parseUrl(url)

      expect(result.baseUrl).toBe('https://api.example.com/users')
      expect(result.params).toEqual({})
    })

    it('should handle invalid URLs gracefully', () => {
      const url = 'invalid-url'
      const result = HttpService.parseUrl(url)

      expect(result.baseUrl).toBe('invalid-url')
      expect(result.params).toEqual({})
    })
  })

  describe('buildUrl', () => {
    it('should build URL with parameters', () => {
      const baseUrl = 'https://api.example.com/users'
      const params = { id: '123', name: 'john' }
      const result = HttpService.buildUrl(baseUrl, params)

      expect(result).toBe('https://api.example.com/users?id=123&name=john')
    })

    it('should handle empty parameters', () => {
      const baseUrl = 'https://api.example.com/users'
      const params = {}
      const result = HttpService.buildUrl(baseUrl, params)

      expect(result).toBe('https://api.example.com/users')
    })

    it('should handle invalid base URL gracefully', () => {
      const baseUrl = 'invalid-url'
      const params = { id: '123' }
      const result = HttpService.buildUrl(baseUrl, params)

      expect(result).toBe('invalid-url')
    })
  })

  describe('environment variable replacement', () => {
    it('should replace environment variables in request', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        text: vi.fn().mockResolvedValue('{"message": "success"}'),
      }

      ;(fetch as any).mockResolvedValue(mockResponse)

      const request: HttpRequest = {
        id: '1',
        name: 'Test Request',
        method: 'GET',
        url: 'https://{{host}}/users/{{userId}}',
        headers: [['Authorization', 'Bearer {{token}}']],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      const environments: Environment[] = [
        {
          id: '1',
          name: 'Development',
          variables: {
            host: 'api.dev.example.com',
            userId: '123',
            token: 'dev-token',
          },
          isActive: true,
        },
      ]

      await HttpService.sendRequest(request, environments)

      expect(fetch).toHaveBeenCalledWith(
        'https://api.dev.example.com/users/123',
        {
          method: 'GET',
          headers: {
            Authorization: 'Bearer dev-token',
          },
        }
      )
    })
  })
})
