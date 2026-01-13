/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_URL } from "@/constants/env"
import { normalizePath } from "@/lib/utils"

type CustomOptions = Omit<RequestInit, 'method'> & {
  baseUrl?: string | undefined
}

const ENTITY_ERROR_STATUS = 422
const UNAUTHORIZED_ERROR_STATUS = 401

type EntityErrorPayload = {
  message: string,
  errors: {
    message: string,
    field: string
  }[]
}

export class HttpError extends Error {
  status: number
  payload: {
    message: string,
    [key: string]: any
  }
  constructor({ status, payload }: { status: number, payload: any }) {
    super()
    this.status = status
    this.payload = payload
  }
}

export class EntityError extends HttpError {
  status = ENTITY_ERROR_STATUS
  payload: EntityErrorPayload
  constructor({ status, payload }: { status: typeof ENTITY_ERROR_STATUS, payload: EntityErrorPayload }) {
    super({ status, payload })
    this.status = status
    this.payload = payload
  }
}

class SessionToken {
  private token = ''
  get value() {
    return this.token
  }
  set value(token: string) {
    // Nếu gọi method này ở server thì sẽ bị lỗi
    if (typeof window === 'undefined') throw new Error('Cannot set token on server side')
    this.token = token
  }
}

export const clientSessionToken = new SessionToken()

const ACCESS_TOKEN_KEYS = ['accessToken', 'access_token']

const getClientAccessToken = () => {
  const tokens = ACCESS_TOKEN_KEYS.map((key) => (typeof window !== 'undefined' ? localStorage.getItem(key) : null))
  return tokens.find(Boolean) || ''
}

const getServerAccessToken = async () => {
  // Lazy import to avoid bundling server-only module into client build
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const tokens = ACCESS_TOKEN_KEYS.map((key) => cookieStore.get(key)?.value || '')
    return tokens.find((token) => token) || ''
  } catch {
    // In case this is called outside Next.js server context, just ignore
    return ''
  }
}

const getAccessToken = async () => {
  if (typeof window !== 'undefined') {
    return getClientAccessToken()
  }
  return getServerAccessToken()
}

const request = async <Response>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, options?: CustomOptions | undefined) => {
  let body: BodyInit | undefined
  const baseHeaders: Record<string, string> = {}

  if (options?.body) {
    if (options.body instanceof FormData) {
      // FormData: browser sẽ tự động set Content-Type với boundary
      body = options.body
      // Không set Content-Type, để browser tự động set
    } else if (options.body instanceof URLSearchParams) {
      // URLSearchParams: convert sang string và set Content-Type
      body = options.body.toString()
      baseHeaders['Content-Type'] = 'application/x-www-form-urlencoded'
    } else {
      // Object hoặc string khác: JSON.stringify
      body = JSON.stringify(options.body)
      baseHeaders['Content-Type'] = 'application/json'
    }
  }

  // Thêm Authorization tự động cả client và server nếu chưa truyền sẵn
  const hasAuth = options?.headers && 'Authorization' in options.headers
  if (!hasAuth) {
    const accessToken = await getAccessToken()
    if (accessToken) {
      baseHeaders.Authorization = `Bearer ${accessToken}`
    }
  }

  // Nếu không truyền baseUrl (hoặc baseUrl = undefined) thì lấy từ envConfig.NEXT_PUBLIC_API_ENDPOINT
  // Nếu truyền baseUrl thì lấy giá trị truyền vào, truyền vào '' thì đồng nghĩa với việc chúng ta gọi API đến Next.js Server
  const baseUrl = options?.baseUrl === undefined ? API_URL : options.baseUrl

  const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...baseHeaders,
      ...(options?.headers || {})
    },
    body,
    method
  }

  // Chỉ thêm credentials: 'include' khi ở client-side
  if (typeof window !== 'undefined') {
    fetchOptions.credentials = 'include'
  }

  const res = await fetch(fullUrl, fetchOptions)

  const payload: Response = await res.json()
  const data = {
    status: res.status,
    payload
  }

  if (!res.ok) {
    if (res.status === ENTITY_ERROR_STATUS) {
      throw new EntityError(data as { status: typeof ENTITY_ERROR_STATUS, payload: EntityErrorPayload })
    } else if (res.status === UNAUTHORIZED_ERROR_STATUS) {
      // Logout ở client-side
      // if (typeof window !== 'undefined') {
      //   await fetch('/api/auth/logout', {
      //     headers: { ...baseHeaders },
      //     method: 'POST',
      //     body: JSON.stringify({ force: true })
      //   })
      //   clientSessionToken.value = ''
      // }
      location.href = '/sign-in'
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      // Throw error để catch block có thể xử lý
      throw new HttpError(data)
    } else {
      throw new HttpError(data)
    }
  }

  // Chỉ set token nếu đang ở client-side
  if (typeof window !== 'undefined') {
    if (['/api/auth/login'].some(item => item === normalizePath(url))) {
      // Format: ResponseType với data = { accessToken: string, user: UserType }
      const responsePayload = payload as { data?: { accessToken?: string } } | any
      const accessToken =
        responsePayload?.data?.accessToken || // Format mới: ResponseType với data.accessToken
        responsePayload?.accessToken ||        // Format cũ (backward compatibility): accessToken trực tiếp
        ''

      if (accessToken) {
        clientSessionToken.value = accessToken
      }
    } else if ('/api/auth/logout' === normalizePath(url)) {
      clientSessionToken.value = ''
    }
  }

  return payload
}

const http = {
  get<Response>(
    url: string,
    options?: Omit<CustomOptions, 'body'> | undefined
  ) {
    return request<Response>('GET', url, options)
  },
  post<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, 'body'> | undefined
  ) {
    return request<Response>('POST', url, { ...options, body })
  },
  put<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, 'body'> | undefined
  ) {
    return request<Response>('PUT', url, { ...options, body })
  },
  delete<Response>(
    url: string,
    options?: Omit<CustomOptions, 'body'> | undefined
  ) {
    return request<Response>('DELETE', url, { ...options })
  }
}

export default http