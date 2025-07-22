// HTTP请求相关类型
export type BodyType =
  | 'json'
  | 'xml'
  | 'text'
  | 'form-data'
  | 'x-www-form-urlencoded'

export interface HttpRequest {
  id: string
  name: string
  method: HttpMethod
  url: string
  headers: [string, string][]
  body?: string
  bodyType?: BodyType
  params?: [string, string][]
  response?: HttpResponse
  createdAt: number
  updatedAt: number
}

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'

// HTTP响应相关类型
export interface HttpResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  size: number
  duration: number
  url: string
}

// 标签页相关类型
export interface Tab {
  id: string
  title: string
  request: HttpRequest
  response?: HttpResponse
  isActive: boolean
  isLoading: boolean
  sourceCollectionId?: string // 来源 collection 的 ID
  sourceRequestId?: string // 来源 request 的 ID
}

// 环境变量相关类型
export interface Environment {
  id: string
  name: string
  variables: Record<string, string>
  isActive: boolean
}

// 请求集合相关类型
export interface Collection {
  id: string
  name: string
  description?: string
  requests: HttpRequest[]
  folders: Folder[]
  createdAt: number
  updatedAt: number
}

export interface Folder {
  id: string
  name: string
  requests: HttpRequest[]
  folders: Folder[]
}

// 应用状态类型
export interface AppState {
  tabs: Tab[]
  activeTabId: string | null
  collections: Collection[]
  environments: Environment[]
  activeEnvironmentIds: string[] // 启用的环境ID列表
  history: HttpRequest[]
  settings: AppSettings
}

export interface AppSettings {
  maxHistoryItems: number
}

// Chrome Storage类型
export interface StorageData {
  appState: AppState
  version: string
}
