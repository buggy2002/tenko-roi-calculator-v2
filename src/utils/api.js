import { db as authDb } from '@/plugins/fake-api/handlers/auth/db'
import { ofetch } from 'ofetch'

const apiClient = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  async onRequest({ options }) {
    const accessToken = useCookie('accessToken').value
    if (accessToken)
      options.headers.append('Authorization', `Bearer ${accessToken}`)
  },
})

const shouldUseLocalDemoAuth = import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL

const normalizeRequestPath = request => {
  if (typeof request !== 'string')
    return ''

  return request.startsWith('/') ? request : `/${request}`
}

const parseRequestBody = body => {
  if (!body)
    return {}

  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }

  return body
}

const resolveLocalDemoLogin = async options => {
  const { email, password } = parseRequestBody(options.body)
  const user = authDb.users.find(item => item.email === email && item.password === password)

  if (!user) {
    const response = {
      status: 400,
      _data: {
        errors: {
          email: ['Invalid email or password'],
        },
      },
    }

    await options.onResponseError?.({ response })
    throw new Error('Invalid email or password')
  }

  const userData = { ...user }
  const userOutData = Object.fromEntries(
    Object.entries(userData).filter(([key]) => !(key === 'password' || key === 'abilityRules')),
  )

  return {
    userAbilityRules: userData.abilityRules,
    accessToken: authDb.userTokens[user.id],
    userData: userOutData,
  }
}

export const $api = async (request, options = {}) => {
  const requestPath = normalizeRequestPath(request)
  const requestMethod = String(options.method || 'GET').toUpperCase()

  if (shouldUseLocalDemoAuth && requestPath === '/auth/login' && requestMethod === 'POST')
    return resolveLocalDemoLogin(options)

  return apiClient(request, options)
}
