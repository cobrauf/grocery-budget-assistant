describe("Counter Component Test", () => {
  beforeEach(() => {
    // Mock API responses before each test
    cy.mockBackendAPI();
    
    // Visit the app before each test
    cy.visit("/");
  });

  it("should test the backend button", () => {
    // Check if the backend button exists
    cy.contains("button", "Test Backend").should("be.visible");

    // Click the backend button
    cy.contains("button", "Test Backend").click();

    // Verify the backend message is displayed
    cy.contains("p", "Welcome to the Grocery Budget Assistant API").should(
      "be.visible"
    );

    // Wait for 2 seconds and ensure the message fades
    cy.wait(2000);
    cy.contains("p", "Welcome to the Grocery Budget Assistant API").should(
      "not.exist"
    );
  });

  it("should display the counter component", () => {
    // Check if the heading exists
    cy.contains("h1", "Smart Grocery Budget Assistant").should("be.visible");
    // Check if the counter exists
    cy.contains("p", "Test Counter: 0").should("be.visible");
    // Check if the button exists
    cy.contains("button", "Increment").should("be.visible");
  });

  it("should increment the counter when button is clicked", () => {
    // Check initial counter value
    cy.contains("p", "Test Counter: 0").should("be.visible");

    // Click the button
    cy.contains("button", "Increment").click();

    // Verify counter incremented to 1
    cy.contains("p", "Test Counter: 1").should("be.visible");

    // Click again
    cy.contains("button", "Increment").click();

    // Verify counter incremented to 2
    cy.contains("p", "Test Counter: 2").should("be.visible");
  });
});
