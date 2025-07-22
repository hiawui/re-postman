import type { StorageData, AppState } from '@/types'

const STORAGE_KEY = 're-postman-data'
const VERSION = '1.0.0'

export class StorageService {
  static async save(data: AppState): Promise<void> {
    const storageData: StorageData = {
      appState: data,
      version: VERSION,
    }

    try {
      // 检查是否在Chrome扩展环境中
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ [STORAGE_KEY]: storageData })
      } else {
        // 使用localStorage作为后备
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData))
      }
    } catch (error) {
      console.error('Failed to save data to storage:', error)
      throw error
    }
  }

  static async load(): Promise<AppState | null> {
    try {
      let storageData: StorageData | undefined

      // 检查是否在Chrome扩展环境中
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get([STORAGE_KEY])
        storageData = result[STORAGE_KEY] as StorageData | undefined
      } else {
        // 使用localStorage作为后备
        const stored = localStorage.getItem(STORAGE_KEY)
        storageData = stored ? (JSON.parse(stored) as StorageData) : undefined
      }

      if (!storageData) {
        return null
      }

      // 版本检查，未来可以用于数据迁移
      if (storageData.version !== VERSION) {
        console.warn(
          `Storage version mismatch: expected ${VERSION}, got ${storageData.version}`
        )
      }

      return storageData.appState
    } catch (error) {
      console.error('Failed to load data from storage:', error)
      return null
    }
  }

  static async clear(): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.remove([STORAGE_KEY])
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (error) {
      console.error('Failed to clear storage:', error)
      throw error
    }
  }

  static async getStorageInfo(): Promise<any> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        return await chrome.storage.local.getBytesInUse()
      } else {
        // 返回localStorage使用情况
        const data = localStorage.getItem(STORAGE_KEY)
        return data ? new Blob([data]).size : 0
      }
    } catch (error) {
      console.error('Failed to get storage info:', error)
      throw error
    }
  }
}
