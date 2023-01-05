describe('Correct label removal', () => {
  it('adds and removes empty label', () => {
    cy.visit('http://localhost:8080');
    cy.get('input.accordion.accordion--close').click();
    cy.get('input#label.fr__input-box').type('first').type('{enter}');
    cy.get('input#label.fr__input-box').type('second').type('{enter}');
    cy.get('input#label.fr__input-box').type('third').type('{enter}');

    cy.get('select#removal-menu').select('first');

    // should be second and third only
    cy.get(
      '#app > div > div > div.fr__content-column > div:nth-child(2) > h2'
    ).should('not.include.text', 'first: 0');

    cy.get(
      '#app > div > div > div.fr__content-column > div:nth-child(2) > h2'
    ).should('include.text', 'second: 0');

    cy.get(
      '#app > div > div > div.fr__content-column > div:nth-child(3) > h2'
    ).should('include.text', 'third: 0');
  });
});
