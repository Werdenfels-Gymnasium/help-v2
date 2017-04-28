import { WgHelpPage } from './app.po';

describe('wg-help App', () => {
  let page: WgHelpPage;

  beforeEach(() => {
    page = new WgHelpPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
