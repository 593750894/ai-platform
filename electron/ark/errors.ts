// 火山方舟 Ark API 错误码 → 中文提示
// 数据源：https://www.volcengine.com/docs/82379/1299023

const CODE_MAP: Record<string, string> = {
  // 400 参数 / 内容
  MissingParameter: '请求缺少必要参数',
  InvalidParameter: '请求参数不合法，请检查后重试',
  'InvalidEndpoint.ClosedEndpoint': '模型接入点已关闭，请更换模型',
  OutofContextError: '输入内容过长，已超过模型上下文限制',
  'InvalidImageURL.EmptyURL': '图片地址为空，请检查 URL',
  'InvalidImageURL.InvalidFormat': '图片格式无法识别，请更换图片',
  'Forbidden.InvalidSubscription': '套餐未订阅或已过期',

  // 400 内容安全
  SensitiveContentDetected: '内容可能涉及敏感信息，请调整提示词',
  'SensitiveContentDetected.SevereViolation': '内容涉及严重违规，已被拒绝',
  'SensitiveContentDetected.Violence': '内容涉及暴力信息，请调整',
  InputTextSensitiveContentDetected: '文本含敏感内容，请更换后重试',
  InputImageSensitiveContentDetected: '图片含敏感内容，请更换后重试',
  InputVideoSensitiveContentDetected: '视频含敏感内容，请更换后重试',
  InputAudioSensitiveContentDetected: '音频含敏感内容，请更换后重试',
  OutputTextSensitiveContentDetected: '生成结果涉及敏感内容，已被拦截',
  OutputImageSensitiveContentDetected: '生成图像涉及敏感内容，已被拦截',
  OutputVideoSensitiveContentDetected: '生成视频涉及敏感内容，已被拦截',
  ContentFilter: '内容安全检测未通过，请调整后重试',

  // 401 / 403 鉴权与账号
  AuthenticationError: 'API Key 无效或鉴权失败，请检查 VOLC_ARK_API_KEY',
  InvalidAccountStatus: '账号状态异常，请前往火山控制台查看',
  AccessDenied: '无该资源访问权限，请检查账号权限',
  'OperationDenied.ServiceNotOpen': '模型服务未开通，请前往控制台开通',
  'OperationDenied.ServiceOverdue': '账户已欠费，请前往控制台充值',
  ModelAccessDenied: '账号对该模型无调用权限',
  InsufficientAccountBalance: '账户余额不足，请充值后重试',

  // 404 模型 / 任务
  'InvalidEndpointOrModel.NotFound': '模型或推理接入点不存在',
  ModelNotOpen: '模型未开通，请前往控制台开通',
  UnsupportedModel: '当前模型不受支持',
  TaskNotFound: '任务不存在或已过期',

  // 429 限流 / 配额
  'RateLimitExceeded.EndpointRPMExceeded': '请求频率过高（RPM 超限），请稍后重试',
  'RateLimitExceeded.EndpointTPMExceeded': 'Token 吞吐过高（TPM 超限），请稍后重试',
  RateLimitExceeded: '请求过于频繁，请稍后重试',
  QuotaExceeded: '免费额度已用完，请充值后继续',
  ServerOverloaded: '服务资源紧张，请稍后重试',
  RequestBurstTooFast: '瞬时请求量过大，请稍后重试',

  // 5xx
  InternalServiceError: '服务内部异常，请稍后重试',
  ServiceUnavailable: '服务暂不可用，请稍后重试',
  RequestTimeout: '请求超时，请稍后重试'
}

const HTTP_MAP: Record<number, string> = {
  400: '请求参数错误',
  401: '鉴权失败，请检查 API Key',
  403: '无访问权限或服务未开通',
  404: '资源不存在（模型或任务 ID 不正确）',
  408: '请求超时',
  429: '请求过于频繁，请稍后重试',
  500: '服务内部异常',
  502: '网关异常',
  503: '服务暂不可用',
  504: '网关超时'
}

export interface ArkErrorPayload {
  code?: string
  message?: string
  param?: string
  type?: string
}

// 支持前缀匹配：code = "InvalidParameter.BadContentURL" 未命中时尝试 "InvalidParameter"
function lookupByCode(code: string): string | null {
  if (CODE_MAP[code]) return CODE_MAP[code]
  const dot = code.indexOf('.')
  if (dot > 0) {
    const prefix = code.slice(0, dot)
    if (CODE_MAP[prefix]) return CODE_MAP[prefix]
  }
  return null
}

export function translateArkError(
  status: number,
  payload: ArkErrorPayload | null | undefined,
  originalMessage?: string
): string {
  const code = payload?.code
  const apiMsg = payload?.message ?? originalMessage

  if (code) {
    const zh = lookupByCode(code)
    if (zh) return apiMsg ? `${zh}（${code}）` : `${zh}（${code}）`
  }

  const httpZh = status ? HTTP_MAP[status] : null
  if (httpZh) {
    if (code) return `${httpZh}：${code}${apiMsg ? ` - ${apiMsg}` : ''}`
    if (apiMsg) return `${httpZh}：${apiMsg}`
    return `${httpZh}（HTTP ${status}）`
  }

  if (apiMsg) return apiMsg
  if (status) return `请求失败（HTTP ${status}）`
  return '请求失败'
}

// 从任务查询结果 body 中解析错误
export function parseArkErrorBody(text: string): ArkErrorPayload | null {
  try {
    const obj = JSON.parse(text)
    if (obj?.error && typeof obj.error === 'object') return obj.error as ArkErrorPayload
    if (obj?.message) return { message: obj.message as string, code: obj.code as string | undefined }
    return null
  } catch {
    return null
  }
}
