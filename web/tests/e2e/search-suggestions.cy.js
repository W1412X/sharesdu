/* global expect */
import { encrypt, decrypt } from '../../src/utils/encrypt';
import { versionConfig } from '../../src/config';

const search = '#search-box-listen';
const input = `${search} input`;
const panel = `${search} .suggestion-container`;
const history = ['Campus events', 'Course reviews', 'A'.repeat(80), 'Library'];

function visitSearch(route, entries = history, dark = false) {
  cy.intercept('**/index/api/**', {
    statusCode: 200,
    body: { status: 200, article_list: [], section_articles: [], total_pages: 1, current_page: 1 },
  });
  cy.intercept('/notice/global.json', []);
  cy.visit(`/#${route}`, {
    onBeforeLoad(win) {
      win.localStorage.setItem(encrypt('version'), encrypt(versionConfig.globalVersion));
      win.localStorage.setItem(encrypt('searchHistory'), encrypt(JSON.stringify(entries)));
      win.localStorage.setItem(encrypt('darkModeEnabled'), encrypt(String(dark)));
      win.document.cookie = 'accessToken=search-layout-test; path=/';
    },
  });
}

function expectPanelWithinViewport() {
  cy.get(panel).should('be.visible').should(($panel) => {
    const element = $panel[0];
    const bounds = element.getBoundingClientRect();
    const field = element.parentElement.querySelector('input').getBoundingClientRect();
    const viewport = element.ownerDocument.defaultView;
    expect(bounds.left).to.be.closeTo(field.left, 1);
    expect(bounds.right).to.be.closeTo(field.right, 1);
    expect(bounds.top).to.be.closeTo(field.bottom, 1);
    expect(bounds.left).to.be.at.least(0);
    expect(bounds.right).to.be.at.most(viewport.innerWidth);
    expect(bounds.bottom).to.be.at.most(viewport.innerHeight);
    expect(element.scrollWidth).to.be.at.most(element.clientWidth);
    const [recent, hot] = element.querySelectorAll('section');
    expect(recent.getAttribute('aria-label')).to.equal('历史搜索');
    expect(hot.getBoundingClientRect().top).to.be.at.least(recent.getBoundingClientRect().bottom);
  });
}

function screenshotPanel(name) {
  cy.get(search).then(($search) => {
    const bounds = $search[0].getBoundingClientRect();
    const bottom = $search[0].querySelector('.suggestion-container').getBoundingClientRect().bottom;
    cy.screenshot(name, {
      capture: 'viewport',
      clip: { x: bounds.left - 4, y: bounds.top, width: bounds.width + 8, height: bottom - bounds.top + 12 },
    });
  });
}

describe('Search suggestion layout', () => {
  for (const route of ['/index', '/error/layout-preview']) {
    it(`fits both header variants at laptop widths (${route})`, () => {
      visitSearch(route);
      for (const width of [1440, 1366, 1280, 1024, 1001]) {
        cy.viewport(width, 768);
        cy.get(input).focus();
        expectPanelWithinViewport();
      }
      cy.get(`${panel} .history-btn`).eq(2).should(($button) => {
        expect($button[0].scrollWidth).to.be.greaterThan($button[0].clientWidth);
      });
      screenshotPanel(route === '/index' ? 'search-suggestions-compact' : 'search-suggestions-wide');
    });
  }

  it('deletes history without filling the field and preserves the deletion after reload', () => {
    visitSearch('/index');
    cy.get(input).focus().type('Keep this query');
    cy.get(`${panel} .delete-history-btn`).first().should('have.css', 'opacity', '0');
    cy.get(`${panel} .history-btn`).first().focus();
    cy.get(`${panel} .delete-history-btn`).first()
      .should('have.css', 'opacity', '1').focus().type('{enter}');
    cy.get(input).should('have.value', 'Keep this query');
    cy.get(panel).should('be.visible');
    cy.window().then((win) => {
      const stored = JSON.parse(decrypt(win.localStorage.getItem(encrypt('searchHistory'))));
      expect(stored).to.deep.equal(history.slice(1));
    });
    cy.reload();
    cy.get(input).focus();
    cy.get(`${panel} .history-btn`).should('have.length', 3).first().click();
    cy.get(input).should('have.value', history[1]).and('be.focused');
    cy.get(input).type('{esc}');
    cy.get(panel).should('not.be.visible');
    cy.get(input).type('x');
    cy.get(panel).should('be.visible');
    cy.get('#search-btn').focus();
    cy.get(panel).should('not.be.visible');
  });

  it('scrolls long histories on short screens and keeps hot search reachable', () => {
    cy.viewport(1024, 400);
    visitSearch('/index', Array.from({ length: 16 }, (_, index) => `History entry ${index} ${'x'.repeat(40)}`));
    cy.get(input).focus();
    expectPanelWithinViewport();
    cy.get(panel).should(($panel) => {
      expect($panel[0].scrollHeight).to.be.greaterThan($panel[0].clientHeight);
    }).scrollTo('bottom');
    cy.get(`${panel} [aria-label="全站热搜"]`).should('be.visible');
  });

  it('keeps empty states compact', () => {
    visitSearch('/index', []);
    cy.get(input).focus();
    expectPanelWithinViewport();
    cy.get(`${panel} .empty-state`).should('have.length', 2);
    cy.get(panel).invoke('height').should('be.lessThan', 240);
  });

  it('supports the shared mobile history cards', () => {
    cy.viewport(390, 844);
    visitSearch('/search_mobile');
    cy.get('#router-view .history-btn').first().click();
    cy.get(input).should('have.value', history[0]);
    cy.get(panel).should('not.be.visible');
    cy.get('#router-view .total-container').each(($section) => {
      const bounds = $section[0].getBoundingClientRect();
      expect(bounds.left).to.be.at.least(0);
      expect(bounds.right).to.be.at.most(390);
    });
  });

  it('keeps the joined surface consistent in dark mode', () => {
    visitSearch('/index', history, true);
    cy.get('html').should('have.class', 'sharesdu-dark-mode');
    cy.get(input).focus();
    expectPanelWithinViewport();
    cy.get(panel).should('not.have.css', 'background-color', 'rgb(255, 255, 255)');
    cy.get(search).should(($search) => {
      const styles = $search[0].ownerDocument.defaultView.getComputedStyle;
      const field = $search[0].querySelector('input');
      const suggestions = $search[0].querySelector('.suggestion-container');
      expect(styles(field).backgroundColor).to.equal(styles(suggestions).backgroundColor);
    });
    screenshotPanel('search-suggestions-dark');
  });
});
