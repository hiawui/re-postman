import { useCallback, useMemo } from 'react'
import { useAppStore } from '@/stores/appStore'
import type { HttpRequest, Collection, Environment } from '@/types'

/**
 * 优化的应用状态Hook，使用useCallback和useMemo来避免不必要的重渲染
 */
export const useAppOptimized = () => {
  const store = useAppStore()

  // 使用useMemo优化计算值
  const activeTab = useMemo(() => {
    return store.tabs.find(tab => tab.id === store.activeTabId)
  }, [store.tabs, store.activeTabId])

  const activeEnvironments = useMemo(() => {
    return (store.activeEnvironmentIds || [])
      .map(id => store.environments.find(e => e.id === id))
      .filter(Boolean) as Environment[]
  }, [store.activeEnvironmentIds, store.environments])

  const mergedEnvironmentVariables = useMemo(() => {
    const merged: Record<string, string> = {}
    activeEnvironments.forEach(env => {
      Object.assign(merged, env.variables)
    })
    return merged
  }, [activeEnvironments])

  // 使用useCallback优化函数
  const handleSelectRequest = useCallback(
    (request: HttpRequest, collectionId?: string) => {
      const restoredRequest = {
        ...request,
        headers: request.headers || [],
        params: request.params || [],
        body: request.body || '',
        bodyType: request.bodyType || 'json',
        response: request.response,
      }

      if (store.activeTabId) {
        store.updateRequest(store.activeTabId, restoredRequest)
        if (collectionId) {
          store.setTabSource(store.activeTabId, collectionId, request.id)
        }
      }
    },
    [store.activeTabId, store.updateRequest, store.setTabSource]
  )

  const handleSendRequest = useCallback(
    (tabId: string) => {
      store.sendRequest(tabId)
    },
    [store.sendRequest]
  )

  const handleAddTab = useCallback(
    (request?: Partial<HttpRequest>) => {
      store.addTab(request)
    },
    [store.addTab]
  )

  const handleRemoveTab = useCallback(
    (tabId: string) => {
      store.removeTab(tabId)
    },
    [store.removeTab]
  )

  const handleSetActiveTab = useCallback(
    (tabId: string) => {
      store.setActiveTab(tabId)
    },
    [store.setActiveTab]
  )

  const handleUpdateRequest = useCallback(
    (tabId: string, request: Partial<HttpRequest>) => {
      store.updateRequest(tabId, request)
    },
    [store.updateRequest]
  )

  const handleAddCollection = useCallback(
    (collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => {
      store.addCollection(collection)
    },
    [store.addCollection]
  )

  const handleRemoveCollection = useCallback(
    (collectionId: string) => {
      store.removeCollection(collectionId)
    },
    [store.removeCollection]
  )

  const handleAddEnvironment = useCallback(
    (environment: Omit<Environment, 'id'>) => {
      store.addEnvironment(environment)
    },
    [store.addEnvironment]
  )

  const handleRemoveEnvironment = useCallback(
    (environmentId: string) => {
      store.removeEnvironment(environmentId)
    },
    [store.removeEnvironment]
  )

  const handleActivateEnvironment = useCallback(
    (environmentId: string) => {
      store.activateEnvironment(environmentId)
    },
    [store.activateEnvironment]
  )

  const handleDeactivateEnvironment = useCallback(
    (environmentId: string) => {
      store.deactivateEnvironment(environmentId)
    },
    [store.deactivateEnvironment]
  )

  return {
    // 状态
    tabs: store.tabs,
    activeTabId: store.activeTabId,
    activeTab,
    collections: store.collections,
    environments: store.environments,
    activeEnvironmentIds: store.activeEnvironmentIds || [],
    activeEnvironments,
    mergedEnvironmentVariables,
    history: store.history,
    settings: store.settings,

    // 优化的操作函数
    handleSelectRequest,
    handleSendRequest,
    handleAddTab,
    handleRemoveTab,
    handleSetActiveTab,
    handleUpdateRequest,
    handleAddCollection,
    handleRemoveCollection,
    handleAddEnvironment,
    handleRemoveEnvironment,
    handleActivateEnvironment,
    handleDeactivateEnvironment,

    // 原始store方法（用于复杂操作）
    store,
  }
}
