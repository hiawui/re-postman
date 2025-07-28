import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { HttpService } from '@/services/httpService'
import { NotificationService } from '@/services/notificationService'
import { buildFullUrlWithEnvironment } from '@/utils/urlParser'
import i18n from '@/i18n'
import type {
  AppState,
  Tab,
  HttpRequest,
  Collection,
  Environment,
} from '@/types'

interface AppStore extends AppState {
  // 标签页管理
  addTab: (request?: Partial<HttpRequest>) => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTab: (tabId: string, updates: Partial<Tab>) => void
  setTabSource: (tabId: string, collectionId: string, requestId: string) => void

  // 请求管理
  updateRequest: (tabId: string, request: Partial<HttpRequest>) => void
  sendRequest: (tabId: string) => Promise<void>

  // 历史记录管理
  removeHistoryItem: (index: number) => void
  clearHistory: () => void

  // 集合管理
  addCollection: (
    collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>
  ) => void
  removeCollection: (collectionId: string) => void
  updateCollection: (collectionId: string, updates: Partial<Collection>) => void
  addRequestToCollection: (
    collectionId: string,
    request: HttpRequest
  ) => HttpRequest
  updateRequestInCollection: (
    collectionId: string,
    requestId: string,
    updates: Partial<HttpRequest>
  ) => void
  removeRequestFromCollection: (collectionId: string, requestId: string) => void
  reorderRequestsInCollection: (
    collectionId: string,
    requestIds: string[]
  ) => void

  // 环境管理
  addEnvironment: (environment: Omit<Environment, 'id'>) => void
  removeEnvironment: (environmentId: string) => void
  activateEnvironment: (environmentId: string) => void
  deactivateEnvironment: (environmentId: string) => void
  updateEnvironment: (
    environmentId: string,
    updates: Partial<Environment>
  ) => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

const createDefaultRequest = (): HttpRequest => ({
  id: generateId(),
  name: i18n.t('store.newRequest'),
  method: 'GET',
  url: '',
  headers: [], // 移除默认的 Content-Type header
  bodyType: 'json',
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

const createDefaultTab = (request?: Partial<HttpRequest>): Tab => ({
  id: generateId(),
  title: request?.name || i18n.t('store.newRequest'),
  request: { ...createDefaultRequest(), ...request },
  isActive: false,
  isLoading: false,
})

const initialState: AppState = {
  tabs: [],
  activeTabId: null,
  collections: [],
  environments: [],
  activeEnvironmentIds: [],
  history: [],
  settings: {
    maxHistoryItems: 1000,
  },
}

export const useAppStore = create<AppStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        // 标签页管理
        addTab: request => {
          const newTab = createDefaultTab(request)
          set(state => ({
            tabs: [
              ...state.tabs.map(tab => ({ ...tab, isActive: false })),
              newTab,
            ],
            activeTabId: newTab.id,
          }))
        },

        removeTab: tabId => {
          set(state => {
            const tabs = state.tabs.filter(tab => tab.id !== tabId)
            const activeTabId =
              state.activeTabId === tabId
                ? tabs.length > 0
                  ? tabs[0].id
                  : null
                : state.activeTabId

            return { tabs, activeTabId }
          })
        },

        setActiveTab: tabId => {
          set(state => ({
            tabs: state.tabs.map(tab => ({
              ...tab,
              isActive: tab.id === tabId,
            })),
            activeTabId: tabId,
          }))
        },

        updateTab: (tabId, updates) => {
          set(state => ({
            tabs: state.tabs.map(tab =>
              tab.id === tabId ? { ...tab, ...updates } : tab
            ),
          }))
        },

        setTabSource: (tabId, collectionId, requestId) => {
          set(state => ({
            tabs: state.tabs.map(tab =>
              tab.id === tabId
                ? {
                    ...tab,
                    sourceCollectionId: collectionId,
                    sourceRequestId: requestId,
                  }
                : tab
            ),
          }))
        },

        // 请求管理
        updateRequest: (tabId, request) => {
          set(state => ({
            tabs: state.tabs.map(tab =>
              tab.id === tabId
                ? {
                    ...tab,
                    request: {
                      ...tab.request,
                      ...request,
                      updatedAt: Date.now(),
                    },
                    response: request.response, // 更新响应信息
                    title: request.name || tab.title,
                  }
                : tab
            ),
          }))
        },

        sendRequest: async tabId => {
          const state = get()
          const tab = state.tabs.find(t => t.id === tabId)
          if (!tab) return

          // 获取启用的环境（按启用顺序，后面的会覆盖前面的）
          const activeEnvironments = state.activeEnvironmentIds
            .map(id => state.environments.find(e => e.id === id))
            .filter(Boolean) as Environment[]

          // 为请求生成新的 ID
          const newRequestId = generateId()

          // 设置加载状态并更新请求 ID
          set(state => ({
            tabs: state.tabs.map(t =>
              t.id === tabId
                ? {
                    ...t,
                    isLoading: true,
                    request: {
                      ...t.request,
                      id: newRequestId,
                      updatedAt: Date.now(),
                    },
                  }
                : t
            ),
          }))

          try {
            // 构建完整的请求URL（包含查询参数和环境变量替换）
            const fullUrl = buildFullUrlWithEnvironment(
              tab.request.url,
              tab.request.params || [],
              activeEnvironments
            )

            // 发送HTTP请求（包含环境变量处理）
            const response = await HttpService.sendRequest(
              {
                ...tab.request,
                id: newRequestId, // 使用新的请求 ID
                url: fullUrl,
              },
              activeEnvironments
            )

            // 添加到历史记录（不去重），保存完整的请求信息和响应
            const historyRequest = {
              ...tab.request,
              id: newRequestId, // 使用新的请求 ID
              url: tab.request.url, // 保存基础 URL，不包含参数
              headers: [...tab.request.headers],
              params: tab.request.params ? [...tab.request.params] : undefined,
              body: tab.request.body,
              bodyType: tab.request.bodyType,
              response: response, // 保存响应信息
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }

            set(state => {
              // 限制历史记录数量
              const maxHistoryItems = state.settings.maxHistoryItems
              const newHistory = [historyRequest, ...state.history]
              const limitedHistory = newHistory.slice(0, maxHistoryItems)

              return {
                tabs: state.tabs.map(t =>
                  t.id === tabId ? { ...t, response, isLoading: false } : t
                ),
                history: limitedHistory,
              }
            })
          } catch (error) {
            // 请求失败时不保存到历史记录
            set(state => ({
              tabs: state.tabs.map(t =>
                t.id === tabId ? { ...t, isLoading: false } : t
              ),
            }))
          }
        },

        // 集合管理
        addCollection: collection => {
          const newCollection: Collection = {
            ...collection,
            id: generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          set(state => ({
            collections: [...state.collections, newCollection],
          }))
        },

        removeCollection: collectionId => {
          set(state => ({
            collections: state.collections.filter(c => c.id !== collectionId),
          }))
        },

        updateCollection: (collectionId, updates) => {
          set(state => ({
            collections: state.collections.map(c =>
              c.id === collectionId
                ? { ...c, ...updates, updatedAt: Date.now() }
                : c
            ),
          }))
        },

        addRequestToCollection: (collectionId, request) => {
          // 创建不包含 response 的请求副本，并生成新的 ID
          const requestWithoutResponse: HttpRequest = {
            ...request,
            id: generateId(), // 生成新的唯一 ID
            response: undefined, // 移除 response 信息
            createdAt: Date.now(), // 更新创建时间
            updatedAt: Date.now(), // 更新修改时间
          }

          set(state => ({
            collections: state.collections.map(c =>
              c.id === collectionId
                ? {
                    ...c,
                    requests: [...c.requests, requestWithoutResponse],
                    updatedAt: Date.now(),
                  }
                : c
            ),
          }))

          return requestWithoutResponse
        },

        updateRequestInCollection: (collectionId, requestId, updates) => {
          set(state => ({
            collections: state.collections.map(c =>
              c.id === collectionId
                ? {
                    ...c,
                    requests: c.requests.map(r =>
                      r.id === requestId
                        ? { ...r, ...updates, updatedAt: Date.now() }
                        : r
                    ),
                    updatedAt: Date.now(),
                  }
                : c
            ),
          }))
        },

        removeRequestFromCollection: (collectionId, requestId) => {
          set(state => ({
            collections: state.collections.map(c =>
              c.id === collectionId
                ? {
                    ...c,
                    requests: c.requests.filter(r => r.id !== requestId),
                    updatedAt: Date.now(),
                  }
                : c
            ),
          }))
        },

        reorderRequestsInCollection: (collectionId, requestIds) => {
          set(state => ({
            collections: state.collections.map(c =>
              c.id === collectionId
                ? {
                    ...c,
                    requests: requestIds
                      .map(id => c.requests.find(r => r.id === id))
                      .filter(Boolean) as HttpRequest[],
                    updatedAt: Date.now(),
                  }
                : c
            ),
          }))
        },

        // 环境管理
        addEnvironment: environment => {
          const newEnvironment: Environment = {
            ...environment,
            id: generateId(),
          }
          set(state => ({
            environments: [...state.environments, newEnvironment],
          }))
          NotificationService.environmentCreated(newEnvironment.name)
        },

        removeEnvironment: environmentId => {
          const state = get()
          const environment = state.environments.find(
            e => e.id === environmentId
          )
          set(state => ({
            environments: state.environments.filter(
              e => e.id !== environmentId
            ),
            activeEnvironmentIds: state.activeEnvironmentIds.filter(
              id => id !== environmentId
            ),
          }))
          if (environment) {
            NotificationService.environmentDeleted(environment.name)
          }
        },

        activateEnvironment: (environmentId: string) => {
          set(state => ({
            activeEnvironmentIds: state.activeEnvironmentIds.includes(
              environmentId
            )
              ? state.activeEnvironmentIds
              : [...state.activeEnvironmentIds, environmentId],
          }))
        },

        deactivateEnvironment: (environmentId: string) => {
          set(state => ({
            activeEnvironmentIds: state.activeEnvironmentIds.filter(
              id => id !== environmentId
            ),
          }))
        },

        updateEnvironment: (environmentId, updates) => {
          set(state => ({
            environments: state.environments.map(e =>
              e.id === environmentId ? { ...e, ...updates } : e
            ),
          }))
        },

        // 历史记录管理
        removeHistoryItem: index => {
          set(state => ({
            history: state.history.filter((_, i) => i !== index),
          }))
        },

        clearHistory: () => {
          set({ history: [] })
        },
      }),
      {
        name: 're-postman-storage',
        version: 1,
      }
    )
  )
)

// 选择器函数，用于避免不必要的重渲染
export const useTabs = () => useAppStore(state => state.tabs)
export const useActiveTabId = () => useAppStore(state => state.activeTabId)
export const useActiveTab = () =>
  useAppStore(state => state.tabs.find(tab => tab.id === state.activeTabId))
export const useCollections = () => useAppStore(state => state.collections)
export const useEnvironments = () => useAppStore(state => state.environments)
export const useActiveEnvironmentIds = () =>
  useAppStore(state => state.activeEnvironmentIds)
export const useHistory = () => useAppStore(state => state.history)
export const useSettings = () => useAppStore(state => state.settings)

// 计算选择器
export const useActiveEnvironments = () =>
  useAppStore(state => {
    return state.activeEnvironmentIds
      .map(id => state.environments.find(e => e.id === id))
      .filter(Boolean) as Environment[]
  })

export const useMergedEnvironmentVariables = () =>
  useAppStore(state => {
    const activeEnvironments = state.activeEnvironmentIds
      .map(id => state.environments.find(e => e.id === id))
      .filter(Boolean) as Environment[]

    const merged: Record<string, string> = {}
    activeEnvironments.forEach(env => {
      Object.assign(merged, env.variables)
    })
    return merged
  })
