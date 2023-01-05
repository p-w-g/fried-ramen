/// <reference types="cypress" />

describe('Correct expense removal', () => {
  it('adds and removes expenses', () => {
    cy.visit('http://localhost:8080');
    cy.get('input.accordion.accordion--close').click();
    cy.get('#expense').type('Coffee');
    cy.get('#amount').type('5').type('{enter}');

    cy.get('#expense').type('Savings');
    cy.get('#amount').type('50').type('{enter}');

    cy.get('#expense').type('Investment fund');
    cy.get('#amount').type('15').type('{enter}');

    cy.get('#expense').type('Shoes');
    cy.get('#amount').type('25').type('{enter}');

    cy.get('div.fr__content-column > div > h2').should(
      'include.text',
      'All: 95'
    );

    // remove coffee
    cy.get(
      'div.fr__content-column > div > div:nth-child(2) > div.fr__card-body.fr__card-body--no-desc > ul > li:nth-child(1) > img'
    ).click();

    cy.get('div.fr__content-column > div > h2').should(
      'include.text',
      'All: 90'
    );

    // remove shoes
    cy.get(
      'div.fr__content-column > div > div:nth-child(4) > div.fr__card-body.fr__card-body--no-desc > ul > li:nth-child(1) > img'
    ).click();

    cy.get('div.fr__content-column > div > h2').should(
      'include.text',
      'All: 65'
    );
  });
});
