describe('Profile Page', () => {
    it('Gets User', () => {
        cy.request('/api/users/2').then((response) => {
            expect(response.status).to.equal(200);
            cy.writeFile('cypress/fixtures/get-user.json', response.body);
        });
    });
});


