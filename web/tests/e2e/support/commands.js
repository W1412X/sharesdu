/**
 * Cypress 自定义命令
 */

/**
 * 登录命令
 * @param {string} username - 用户名
 * @param {string} password - 密码
 */
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  cy.get('input[name="userName"], input[placeholder*="用户名"], input[placeholder*="账号"]').type(username);
  cy.get('input[name="passwd"], input[type="password"]').type(password);
  cy.get('button[type="submit"], button:contains("登录")').click();
  // 等待登录完成
  cy.url().should('not.include', '/login');
});

/**
 * 等待 API 请求完成
 * @param {string} alias - API 请求别名
 */
Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(alias);
});

/**
 * 检查元素是否可见（带重试）
 * @param {string} selector - 选择器
 */
Cypress.Commands.add('shouldBeVisible', (selector) => {
  cy.get(selector).should('be.visible');
});

/**
 * 滚动到元素
 * @param {string} selector - 选择器
 */
Cypress.Commands.add('scrollToElement', (selector) => {
  cy.get(selector).scrollIntoView();
});

