/**
 * 搜索功能 E2E 测试
 */
describe('搜索功能', () => {
  beforeEach(() => {
    // 假设用户已登录，可以通过 cy.login() 或直接设置 cookie
    cy.setCookie('accessToken', 'mock-token');
    cy.setCookie('userId', '123');
    cy.visit('/search?query=测试');
  });

  it('应该显示搜索结果', () => {
    cy.intercept('GET', '**/api/search/**', {
      statusCode: 200,
      body: {
        status: 200,
        results: [
          {
            id: '1',
            type: 'article',
            title: '测试文章',
            summary: '这是一篇测试文章'
          }
        ]
      }
    }).as('searchRequest');

    cy.wait('@searchRequest');
    cy.contains('测试文章', { timeout: 5000 }).should('be.visible');
  });

  it('应该能够切换搜索类型', () => {
    cy.get('select, [data-cy="search-type-select"]').should('be.visible');
    cy.get('select, [data-cy="search-type-select"]').select('文章');
    cy.url().should('include', 'type=article');
  });

  it('应该显示空状态当没有搜索结果时', () => {
    cy.intercept('GET', '**/api/search/**', {
      statusCode: 200,
      body: {
        status: 200,
        results: []
      }
    }).as('emptySearch');

    cy.wait('@emptySearch');
    cy.contains('未找到', { timeout: 5000 }).should('be.visible');
  });

  it('应该能够加载更多结果', () => {
    cy.intercept('GET', '**/api/search/**', {
      statusCode: 200,
      body: {
        status: 200,
        results: Array(20).fill(null).map((_, i) => ({
          id: String(i),
          type: 'article',
          title: `文章${i}`
        }))
      }
    }).as('searchRequest');

    cy.wait('@searchRequest');
    cy.contains('加载更多').click();
    cy.wait('@searchRequest');
  });
});

