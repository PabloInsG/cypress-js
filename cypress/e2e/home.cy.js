describe('home spec', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.wait(500)
  })

  context("Seccion Inicial", ()=>{
    it('el titulo de la pagina contenga el texto indicado', () => {
      cy.getByData("hero-heading").contains("Testing Next.js Applications with Cypress")
    })
    
    it("verificamos las caracteristicas de los cursos", () => {
      cy.get("dt").eq(0).contains("4 Courses")
      cy.get("dt").eq(1).contains("25+ Lessons")
      cy.get("dt").eq(2).contains("Free and Open Source")
    })
  })

  context("Seccion cursos home page", () => {
    it("Curso: Testing your first next.js Application", () => {
      cy.getByData("course-0").find("a").contains("Get started").click()
      cy.location("pathname").should("equal", "/testing-your-first-application")
    })
    /*Tarea 3*/
    it("Curso: Testing Foundations", () => {
      cy.getByData("course-1").find("a").contains("Get started").click();
      cy.location("pathname").should("equal", "/testing-foundations")
    })

    it("Curso: Cypress Fundamentals", () => {
      cy.getByData("course-2").find("a").contains("Get started").click();
      cy.location("pathname").should("equal", "/cypress-fundamentals")
    })
  })
})