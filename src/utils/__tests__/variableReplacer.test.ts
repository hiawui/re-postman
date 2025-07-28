import { describe, it, expect } from 'vitest'
import { VariableReplacer } from '../variableReplacer'
import type { Environment } from '@/types'

describe('VariableReplacer', () => {
  describe('replaceVariables', () => {
    it('should replace single variable', () => {
      const text = 'Hello {{name}}!'
      const environment: Environment = {
        id: '1',
        name: 'Test',
        variables: { name: 'World' },
        isActive: true,
      }
      const result = VariableReplacer.replaceVariables(text, environment)

      expect(result).toBe('Hello World!')
    })

    it('should replace multiple variables', () => {
      const text = '{{greeting}} {{name}}!'
      const environment: Environment = {
        id: '1',
        name: 'Test',
        variables: { greeting: 'Hello', name: 'World' },
        isActive: true,
      }
      const result = VariableReplacer.replaceVariables(text, environment)

      expect(result).toBe('Hello World!')
    })

    it('should handle null environment', () => {
      const text = 'Hello {{name}}!'
      const result = VariableReplacer.replaceVariables(text, null)

      expect(result).toBe('Hello {{name}}!')
    })

    it('should handle empty text', () => {
      const text = ''
      const environment: Environment = {
        id: '1',
        name: 'Test',
        variables: { name: 'World' },
        isActive: true,
      }
      const result = VariableReplacer.replaceVariables(text, environment)

      expect(result).toBe('')
    })
  })

  describe('replaceVariablesWithMultipleEnvironments', () => {
    it('should replace variables from multiple environments', () => {
      const text = '{{base_url}}/users/{{user_id}}'
      const environments: Environment[] = [
        {
          id: '1',
          name: 'Development',
          variables: { base_url: 'https://api.dev.com' },
          isActive: true,
        },
        {
          id: '2',
          name: 'User',
          variables: { user_id: '123' },
          isActive: true,
        },
      ]

      const result = VariableReplacer.replaceVariablesWithMultipleEnvironments(
        text,
        environments
      )

      expect(result).toBe('https://api.dev.com/users/123')
    })

    it('should handle overlapping variables (later environment wins)', () => {
      const text = '{{base_url}}/users'
      const environments: Environment[] = [
        {
          id: '1',
          name: 'Development',
          variables: { base_url: 'https://api.dev.com' },
          isActive: true,
        },
        {
          id: '2',
          name: 'Production',
          variables: { base_url: 'https://api.prod.com' },
          isActive: true,
        },
      ]

      const result = VariableReplacer.replaceVariablesWithMultipleEnvironments(
        text,
        environments
      )

      expect(result).toBe('https://api.prod.com/users')
    })

    it('should handle empty environments', () => {
      const text = '{{base_url}}/users'
      const environments: Environment[] = []

      const result = VariableReplacer.replaceVariablesWithMultipleEnvironments(
        text,
        environments
      )

      expect(result).toBe('{{base_url}}/users')
    })
  })

  describe('replaceVariablesInObject', () => {
    it('should replace variables in object values', () => {
      const obj: Record<string, string> = {
        url: '{{base_url}}/users',
        authorization: 'Bearer {{token}}',
        contentType: 'application/json',
      }
      const environment: Environment = {
        id: '1',
        name: 'Test',
        variables: {
          base_url: 'https://api.example.com',
          token: 'abc123',
        },
        isActive: true,
      }

      const result = VariableReplacer.replaceVariablesInObject(obj, environment)

      expect(result).toEqual({
        url: 'https://api.example.com/users',
        authorization: 'Bearer abc123',
        contentType: 'application/json',
      })
    })

    it('should handle null environment', () => {
      const obj: Record<string, string> = {
        url: '{{base_url}}/users',
      }

      const result = VariableReplacer.replaceVariablesInObject(obj, null)

      expect(result).toEqual(obj)
    })
  })

  describe('hasVariables', () => {
    it('should detect variables in text', () => {
      expect(VariableReplacer.hasVariables('Hello {{name}}!')).toBe(true)
      expect(VariableReplacer.hasVariables('Hello World!')).toBe(false)
      expect(VariableReplacer.hasVariables('')).toBe(false)
    })
  })

  describe('extractVariables', () => {
    it('should extract variable names', () => {
      const text = '{{base_url}}/users/{{user_id}}'
      const variables = VariableReplacer.extractVariables(text)

      expect(variables).toEqual(['base_url', 'user_id'])
    })

    it('should handle text without variables', () => {
      const text = 'Hello World!'
      const variables = VariableReplacer.extractVariables(text)

      expect(variables).toEqual([])
    })
  })
})
