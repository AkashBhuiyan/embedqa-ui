// ===========================================
// EmbedQA - Core Data Models
// ===========================================

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// Body Types
export type BodyType = 'NONE' | 'JSON' | 'XML' | 'FORM_DATA' | 'RAW' | 'BINARY';

// Auth Types
export type AuthType = 'NONE' | 'BEARER_TOKEN' | 'BASIC_AUTH' | 'API_KEY' | 'OAUTH2';

// Key-Value Pair
export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

// Auth Configuration
export interface AuthConfig {
  bearerToken?: string;
  basicUsername?: string;
  basicPassword?: string;
  apiKey?: string;
  apiKeyHeaderName?: string;
  apiKeyLocation?: 'header' | 'query';
}

// Execute Request DTO
export interface ExecuteRequest {
  url: string;
  method: HttpMethod;
  headers: KeyValuePair[];
  queryParams: KeyValuePair[];
  body?: string;
  bodyType: BodyType;
  authType: AuthType;
  authConfig?: AuthConfig;
  environmentId?: number;
  timeout?: number;
  followRedirects?: boolean;
  verifySsl?: boolean;
}

// API Response
export interface ApiResponse {
  statusCode: number;
  statusText: string;
  body: string;
  contentType: string;
  bodySize: number;
  headers: ResponseHeader[];
  responseTimeMs: number;
  requestUrl: string;
  requestMethod: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

export interface ResponseHeader {
  name: string;
  value: string;
}

// Collection
export interface Collection {
  id: number;
  name: string;
  description?: string;
  requestCount: number;
  requests: RequestSummary[];
  createdAt?: string;
  updatedAt?: string;
}

// Request Summary
export interface RequestSummary {
  id: number;
  name: string;
  url: string;
  method: HttpMethod;
  description?: string;
  collectionId?: number;
  collectionName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Request Detail
export interface RequestDetail {
  id: number;
  name: string;
  url: string;
  method: HttpMethod;
  description?: string;
  headers: KeyValuePair[];
  queryParams: KeyValuePair[];
  body?: string;
  bodyType: BodyType;
  authType: AuthType;
  authConfig?: AuthConfig;
  collectionId?: number;
  collectionName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Save Request DTO
export interface SaveRequest {
  name: string;
  url: string;
  method: HttpMethod;
  description?: string;
  headers: KeyValuePair[];
  queryParams: KeyValuePair[];
  body?: string;
  bodyType: BodyType;
  authType: AuthType;
  authConfig?: AuthConfig;
  collectionId?: number;
}

// Environment
export interface Environment {
  id: number;
  name: string;
  description?: string;
  variables: EnvironmentVariable[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Environment Variable
export interface EnvironmentVariable {
  name: string;
  value: string;
  enabled: boolean;
  secret: boolean;
}

// Environment DTO
export interface EnvironmentDTO {
  name: string;
  description?: string;
  variables: EnvironmentVariable[];
}

// Collection DTO
export interface CollectionDTO {
  name: string;
  description?: string;
}

// API Result wrapper
export interface ApiResult<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
  timestamp: string;
}

// Page response
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Request Tab (for UI state)
export interface RequestTab {
  id: string;
  name: string;
  request: ExecuteRequest;
  response?: ApiResponse;
  loading: boolean;
  dirty: boolean;
  savedRequestId?: number;
}
