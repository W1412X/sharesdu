/**
 * 登录功能 E2E 测试
 */
describe('登录功能', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('应该显示登录页面', () => {
    cy.contains('登录').should('be.visible');
  });

  it('应该能够输入用户名和密码', () => {
    cy.get('input[name="userName"], input[placeholder*="用户名"], input[placeholder*="账号"]').should('be.visible');
    cy.get('input[name="passwd"], input[type="password"]').should('be.visible');
    
    cy.get('input[name="userName"], input[placeholder*="用户名"], input[placeholder*="账号"]').type('testuser');
    cy.get('input[name="passwd"], input[type="password"]').type('testpass');
    
    cy.get('input[name="userName"], input[placeholder*="用户名"], input[placeholder*="账号"]').should('have.value', 'testuser');
    cy.get('input[name="passwd"], input[type="password"]').should('have.value', 'testpass');
  });

  it('应该显示错误信息当登录失败时', () => {
    cy.intercept('POST', '**/api/account/login', {
      statusCode: 401,
      body: { message: '用户名或密码错误' }
    }).as('loginRequest');

    cy.get('input[name="userName"], input[placeholder*="用户名"], input[placeholder*="账号"]').type('wronguser');
    cy.get('input[name="passwd"], input[type="password"]').type('wrongpass');
    cy.get('button[type="submit"], button:contains("登录")').click();

    cy.wait('@loginRequest');
    // 验证错误提示显示（根据实际实现调整选择器）
    cy.contains('错误', { timeout: 5000 }).should('be.visible');
  });

  it('应该成功登录并跳转到首页', () => {
    cy.intercept('POST', '**/api/account/login', {
      statusCode: 200,
      body: {
        status: 200,
        message: '登录成功',
        user_id: '123',
        user_name: 'testuser',
        email: 'test@example.com'
      }
    }).as('loginRequest');

    cy.get('input[name="userName"], input[placeholder*="用户名"], input[placeholder*="账号"]').type('testuser');
    cy.get('input[name="passwd"], input[type="password"]').type('testpass');
    cy.get('button[type="submit"], button:contains("登录")').click();

    cy.wait('@loginRequest');
    cy.url({ timeout: 10000 }).should('include', '/index');
  });
});

