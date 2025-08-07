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

    it('should send a POST request with form-data and filter empty keys', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        text: vi.fn().mockResolvedValue('{"message": "success"}'),
      }

      ;(fetch as any).mockResolvedValue(mockResponse)

      const request: HttpRequest = {
        id: '1',
        name: 'Form Data Request',
        method: 'POST',
        url: 'https://api.example.com/upload',
        headers: [],
        body: 'name=John&age=25&=emptyKey&  =whitespaceKey&city=NYC',
        bodyType: 'form-data',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await HttpService.sendRequest(request)

      const call = (fetch as any).mock.calls[0]
      expect(call[0]).toBe('https://api.example.com/upload')
      expect(call[1].method).toBe('POST')
      expect(call[1].body).toBeInstanceOf(FormData)

      // 验证FormData只包含有效的键值对
      const formData = call[1].body as FormData
      const formDataEntries = Array.from(formData.entries())
      expect(formDataEntries).toEqual([
        ['name', 'John'],
        ['age', '25'],
        ['city', 'NYC'],
      ])
    })

    it('should send a POST request with x-www-form-urlencoded and filter empty keys', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        text: vi.fn().mockResolvedValue('{"message": "success"}'),
      }

      ;(fetch as any).mockResolvedValue(mockResponse)

      const request: HttpRequest = {
        id: '1',
        name: 'URL Encoded Request',
        method: 'POST',
        url: 'https://api.example.com/login',
        headers: [['Content-Type', 'application/x-www-form-urlencoded']],
        body: 'username=john&password=secret&=emptyKey&  =whitespaceKey&remember=true',
        bodyType: 'x-www-form-urlencoded',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await HttpService.sendRequest(request)

      expect(fetch).toHaveBeenCalledWith('https://api.example.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'username=john&password=secret&remember=true',
      })
    })

    it('should handle form-data with all empty keys', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        text: vi.fn().mockResolvedValue('{"message": "success"}'),
      }

      ;(fetch as any).mockResolvedValue(mockResponse)

      const request: HttpRequest = {
        id: '1',
        name: 'Empty Keys Request',
        method: 'POST',
        url: 'https://api.example.com/test',
        headers: [],
        body: '=value1&  =value2& =value3',
        bodyType: 'form-data',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await HttpService.sendRequest(request)

      const call = (fetch as any).mock.calls[0]
      const formData = call[1].body as FormData
      const formDataEntries = Array.from(formData.entries())
      expect(formDataEntries).toEqual([])
    })

    it('should handle x-www-form-urlencoded with all empty keys', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        text: vi.fn().mockResolvedValue('{"message": "success"}'),
      }

      ;(fetch as any).mockResolvedValue(mockResponse)

      const request: HttpRequest = {
        id: '1',
        name: 'Empty Keys URL Encoded Request',
        method: 'POST',
        url: 'https://api.example.com/test',
        headers: [['Content-Type', 'application/x-www-form-urlencoded']],
        body: '=value1&  =value2& =value3',
        bodyType: 'x-www-form-urlencoded',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await HttpService.sendRequest(request)

      expect(fetch).toHaveBeenCalledWith('https://api.example.com/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: '',
      })
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
