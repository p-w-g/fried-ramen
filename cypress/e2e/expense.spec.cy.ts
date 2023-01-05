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

describe('Correct label assignement ', () => {
  it('adds and assigns expenses', () => {
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

    cy.get('input#label.fr__input-box').type('hype yo').type('{enter}');
    cy.get('input#label.fr__input-box').type('Save&Invest').type('{enter}');

    cy.get(
      'div.fr__content-column > div:nth-child(1) > div:nth-child(5) > div.fr__card-body.fr__card-body--no-desc > ul > li:nth-child(3) > select'
    ).select('hype yo');

    cy.get('div.fr__content-column > div:nth-child(2) > h2').should(
      'include.text',
      'hype yo: 25'
    );

    cy.get(
      'div.fr__content-column > div:nth-child(1) > div:nth-child(3) > div.fr__card-body.fr__card-body--no-desc > ul > li:nth-child(3) > select'
    ).select('Save&Invest');

    cy.get(
      'div.fr__content-column > div:nth-child(1) > div:nth-child(3) > div.fr__card-body.fr__card-body--no-desc > ul > li:nth-child(3) > select'
    ).select('Save&Invest');

    cy.get('div.fr__content-column > div:nth-child(3) > h2').should(
      'include.text',
      'Save&Invest: 65'
    );

    // attempt to remove non empty label
    cy.get('select#removal-menu').select('hype yo');

    // ...which shouldnt do anything
    cy.get('div.fr__content-column > div:nth-child(2) > h2').should(
      'include.text',
      'hype yo: 25'
    );

    // remove shoes and then finally remove "hype yo" label
    cy.get(
      'div.fr__content-column > div:nth-child(2) > div > div > div.fr__card-body.fr__card-body--no-desc > ul > li:nth-child(1) > img'
    ).click();

    cy.get('div.fr__content-column > div:nth-child(2) > h2').should(
      'include.text',
      'hype yo: 0'
    );

    cy.get('select#removal-menu').select('hype yo');

    cy.get('div.fr__content-column > div:nth-child(2) > h2').should(
      'not.include.text',
      'hype yo: 0'
    );

    cy.get('div.fr__content-column > div:nth-child(2) > h2').should(
      'include.text',
      'Save&Invest: 65'
    );
  });
});
