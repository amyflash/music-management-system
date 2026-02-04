import { NextRequest, NextResponse } from 'next/server';

// 后端认证API地址
const AUTH_API_URL = 'https://auth.516768.xyz';

/**
 * 从请求中提取 Bearer Token
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // 移除 "Bearer " 前缀
}

/**
 * 验证 Token 是否有效
 * 调用后端验证 API
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    console.log('[Auth] 开始验证 token:', token.substring(0, 10) + '...');

    const response = await fetch(`${AUTH_API_URL}/api/verify-token`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('[Auth] 验证响应状态:', response.status);

    const data = await response.json();
    console.log('[Auth] 验证响应数据:', data);

    // 成功响应：{"success":true,"message":"Token 验证有效",...}
    // 失败响应：{"detail":"Token 无效或已被注销"}
    return response.ok && data.success === true;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return false;
  }
}

/**
 * 返回未授权响应
 */
export function unauthorizedResponse(message: string = '未授权，请先登录') {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 401 }
  );
}

/**
 * 检查请求是否已认证
 * 如果未认证，返回未授权响应
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const token = extractToken(request);

  if (!token) {
    return unauthorizedResponse('缺少认证令牌，请先登录');
  }

  const isValid = await verifyToken(token);

  if (!isValid) {
    return unauthorizedResponse('认证令牌无效或已过期，请重新登录');
  }

  return null; // 认证通过，返回 null
}

/**
 * 检查请求是否已认证（同步版本，用于简单检查）
 * 仅检查 token 是否存在，不验证有效性
 */
export function requireAuthSync(request: NextRequest): NextResponse | null {
  const token = extractToken(request);

  if (!token) {
    return unauthorizedResponse('缺少认证令牌，请先登录');
  }

  return null; // 认证通过
}
