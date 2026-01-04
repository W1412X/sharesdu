/**
 * 用户身份标识工具模块
 * 用于获取和显示用户身份徽章
 */
import { userRoles, roleConfig } from '@/config';

/**
 * 根据用户ID获取用户身份
 * @param {string|number} userId - 用户ID
 * @returns {string|null} 身份类型，如果没有则返回 null
 */
export function getUserRole(userId) {
  if (!userId) {
    return null;
  }
  // 将 userId 转换为字符串进行比较
  const userIdStr = String(userId);
  return userRoles[userIdStr] || null;
}

/**
 * 根据用户ID获取身份配置信息
 * @param {string|number} userId - 用户ID
 * @returns {Object|null} 身份配置对象，包含 priority, label, icon, color 等
 */
export function getUserRoleConfig(userId) {
  const role = getUserRole(userId);
  if (!role) {
    return null;
  }
  return roleConfig[role] || null;
}

/**
 * 获取用户最高优先级的身份
 * 如果用户有多个身份，返回优先级最高的
 * @param {string|number} userId - 用户ID
 * @returns {Object|null} 身份配置对象
 */
export function getHighestPriorityRole(userId) {
  const role = getUserRole(userId);
  if (!role) {
    return null;
  }
  return roleConfig[role] || null;
}

/**
 * 检查用户是否有指定身份
 * @param {string|number} userId - 用户ID
 * @param {string} roleType - 身份类型
 * @returns {boolean}
 */
export function hasRole(userId, roleType) {
  return getUserRole(userId) === roleType;
}

/**
 * 检查用户是否是管理员
 * @param {string|number} userId - 用户ID
 * @returns {boolean}
 */
export function isAdmin(userId) {
  return hasRole(userId, 'admin');
}

/**
 * 检查用户是否是认证用户
 * @param {string|number} userId - 用户ID
 * @returns {boolean}
 */
export function isVerified(userId) {
  return hasRole(userId, 'verified');
}

