describe("Counter Component Test", () => {
  beforeEach(() => {
    // Visit the app before each test
    cy.visit("/");
  });

  it("should display the counter component", () => {
    // Check if the heading exists
    cy.contains("h1", "Smart Grocery Budget Assistant").should("be.visible");
    // Check if the counter exists
    cy.contains("p", "Test Counter: 0").should("be.visible");
    // Check if the button exists
    cy.contains("button", "Click me").should("be.visible");
  });

  it("should increment the counter when button is clicked", () => {
    // Check initial counter value
    cy.contains("p", "Test Counter: 0").should("be.visible");

    // Click the button
    cy.contains("button", "Click me").click();

    // Verify counter incremented to 1
    cy.contains("p", "Test Counter: 1").should("be.visible");

    // Click again
    cy.contains("button", "Click me").click();

    // Verify counter incremented to 2
    cy.contains("p", "Test Counter: 2").should("be.visible");
  });
});
