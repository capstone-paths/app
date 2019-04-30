describe('Profile Page', () => {
    before(() => {
        cy.server();
        cy.route('GET', '/sockjs-node/**', {});
    });
    it('Should load the page', () => {
        cy.fixture('get-user').then((json) => {
            cy.route('GET', '/api/users/2', json)
        });
        cy.visit('/profile/2');
    });
    //todo the selectors could be improved if we use class names on the frontend. The current implmentation will be sensitive to changes on the frontend. 
    it('Should show courses', () => {
        cy.get('table.ui > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(1)')
            .should('have.text', 'Programming Foundations with JavaScript, HTML and CSS');
    });
    it('Should show sequences', () => {
        cy.get('#root > div > div.ui.container > div > div.ten.wide.column > div:nth-child(2) > div > div:nth-child(1) > div.ui.divided.items > div:nth-child(3) > div > a')
            .should('have.text', "Sam Chao's Full Stack Development");
    });

    it('Should have the bio', () => {
        cy.get('.description')
            .should('have.text', " I'm a management consultant. I spend the bulk of my time in data & analytics, especially in the areas of project management and strategic operations. ");
    });

    it('Should have the learning style', () => {
        cy.get('#root > div > div.ui.container > div > div.six.wide.column > div > div:nth-child(5) > div:nth-child(2)')
            .should('have.text', ' Theorist ');
    });

    it('Should have the interests', () => {
        cy.get('#root > div > div.ui.container > div > div.six.wide.column > div > div:nth-child(5) > div:nth-child(5)')
            .should('have.text', ' Javascript ');
    });
    
    it('Should have the experiences', () => {
        cy.get('div.content:nth-child(6) > div:nth-child(2)')
            .should('have.text', ' HTML ');
    });
});