import type { Environment } from '@/types'

export class VariableReplacer {
  /**
   * 合并多个环境的变量，后面的环境会覆盖前面的环境
   */
  static mergeEnvironmentVariables(
    environments: Environment[]
  ): Record<string, string> {
    const mergedVariables: Record<string, string> = {}

    // 按顺序合并环境变量，后面的会覆盖前面的
    environments.forEach(environment => {
      Object.assign(mergedVariables, environment.variables)
    })

    return mergedVariables
  }

  /**
   * 替换字符串中的变量
   * 变量格式: {{variable_name}}
   */
  static replaceVariables(
    text: string,
    environment: Environment | null
  ): string {
    if (!environment || !text) return text

    return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const trimmedName = variableName.trim()
      return environment.variables[trimmedName] || match
    })
  }

  /**
   * 替换字符串中的变量（支持多个环境）
   * 变量格式: {{variable_name}}
   */
  static replaceVariablesWithMultipleEnvironments(
    text: string,
    environments: Environment[]
  ): string {
    if (!environments.length || !text) return text

    const mergedVariables = this.mergeEnvironmentVariables(environments)

    return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const trimmedName = variableName.trim()
      return mergedVariables[trimmedName] || match
    })
  }

  /**
   * 替换对象中的所有字符串值中的变量
   */
  static replaceVariablesInObject(
    obj: Record<string, string>,
    environment: Environment | null
  ): Record<string, string> {
    if (!environment) return obj

    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = this.replaceVariables(value, environment)
    }
    return result
  }

  /**
   * 替换对象中的所有字符串值中的变量（支持多个环境）
   */
  static replaceVariablesInObjectWithMultipleEnvironments(
    obj: Record<string, string>,
    environments: Environment[]
  ): Record<string, string> {
    if (!environments.length) return obj

    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = this.replaceVariablesWithMultipleEnvironments(
        value,
        environments
      )
    }
    return result
  }

  /**
   * 检查字符串中是否包含变量
   */
  static hasVariables(text: string): boolean {
    return /\{\{[^}]+\}\}/.test(text)
  }

  /**
   * 提取字符串中的所有变量名
   */
  static extractVariables(text: string): string[] {
    const matches = text.match(/\{\{([^}]+)\}\}/g)
    if (!matches) return []

    return matches.map(match => match.slice(2, -2).trim())
  }

  /**
   * 验证变量是否都已定义
   */
  static validateVariables(
    text: string,
    environment: Environment | null
  ): { isValid: boolean; missing: string[] } {
    if (!environment) {
      return { isValid: true, missing: [] }
    }

    const variables = this.extractVariables(text)
    const missing = variables.filter(
      variable => !environment.variables[variable]
    )

    return {
      isValid: missing.length === 0,
      missing,
    }
  }

  /**
   * 获取变量的预览值（用于显示）
   */
  static getVariablePreview(
    text: string,
    environment: Environment | null
  ): string {
    if (!environment) return text

    return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const trimmedName = variableName.trim()
      const value = environment.variables[trimmedName]
      return value
        ? `<span style="color: #1890ff; background: #f0f8ff; padding: 2px 4px; border-radius: 3px;">${value}</span>`
        : match
    })
  }
}
