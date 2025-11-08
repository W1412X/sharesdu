/**
 * API 统一导出文件
 * 导出所有 API 模块，提供统一的导入入口
 */

// 请求实例
export { default as request, axiosInstanceNoHeader } from './request';

// API 模块
export * from './modules/article';
export * from './modules/account';
export * from './modules/post';
export * from './modules/course';
export * from './modules/chat';
export * from './modules/image';
export * from './modules/resource';
export * from './modules/search';
export * from './modules/star';
export * from './modules/like';
export * from './modules/notification';
export * from './modules/manage';
export * from './modules/block';
export * from './modules/invite';
export * from './modules/top';
export * from './modules/token';

// 状态码消息
export * from './modules/statusCodeMessages';

