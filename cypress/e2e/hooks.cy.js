describe("Pruebas data driven", () => {
    before(()=>{
        cy.fixture('example').then(function (datos){
            this.datos = datos
        })
        cy.fixture(this.datos.imagen).as('imagen')
    })
    /* 
    beforeEach(() => {
        //Ingresamos a la pagina de formulario
        cy.visit("https://demoqa.com/automation-practice-form")
    }) 
    
    //Si utilizamos el "this" para definir los datos del archivo, para llamar al "this" debemos utilizar function() callbacks si no, no funcionara el test.
    it("Llenamos nuestro primer formulario utilizando data", function() {
        cy.log(this.datos.apellido);
        /*Nombre, apellidos y email*/
        cy.get('#firstName').type(this.datos.name)
        cy.get('#lastName').type(this.datos.apellido)
        cy.get('#userEmail').type(this.datos.email)

        /*Genero ("force" sirve para forzar una accion sobre un elemento que no nos dejaria hacer una accion normalmente)*/ 
        cy.get('input[name="gender"][value="' + this.datos.sexo + '"]').check({force: true}).should('be.checked')
        
        /*Telefono */
        cy.get('#userNumber').type(this.datos.telefono)

        /*Fecha input dropdown */
        cy.get('#dateOfBirthInput').click()
            /*Deberian de ser visibles el input select de mes y año, seleccionamos los campos que tenemos en el fixture */
            cy.get('.react-datepicker__month-select').should('be.visible').select(this.datos.fechaNacimiento[0])
            cy.get('.react-datepicker__year-select').should('be.visible').select(this.datos.fechaNacimiento[1])
            /*El dia al no ser un select hacemos la funcion click() en el dia que tenemos en el fixture mediante el nombre de la clase en este caso */
            cy.get('.react-datepicker__day--0' + this.datos.fechaNacimiento[2] + '').should('be.visible').click()
        
        /*Comprobamos que los campos coinciden.*/
        cy.get('#dateOfBirthInput')
            /*Substring como en javascript para sacar x cantidad de letras que queramos*/
            .should("contain.value", this.datos.fechaNacimiento[0].substring(0,3))
            .should("contain.value", this.datos.fechaNacimiento[1])
            .should("contain.value", this.datos.fechaNacimiento[2]) 

        /*Materias: */
            /*Materia 1 */
            cy.get('.subjects-auto-complete__value-container').type(this.datos.subjects[0])
            cy.get('#react-select-2-option-0').should("be.visible").click()
            cy.get('.subjects-auto-complete__value-container').should("contains", this.datos.subjects[0])
            /*Materia 2 */
            cy.get('.subjects-auto-complete__value-container').type(this.datos.subjects[1])
            cy.get('#react-select-2-option-0').should("be.visible").click()
            cy.get('.subjects-auto-complete__value-container').should("contains", this.datos.subjects[1])
        
        /*Hobbies*/
        cy.wrap(this.datos.hobbies).each(($el, value) => {
            cy.get('div[class="custom-control custom-checkbox custom-control-inline"]:has(label:contains("' + this.datos.hobbies[value] + '")').check({force: true}).should('be.checked')
        })

        /*Imagen*/
        cy.get('#uploadPicture').then(function($el){
            //Codificar la imagen a un string base64
            const blob = Cypress.Blob.base64StringToBlob(this.imagen, 'image/png')

            const file = new File([blob], this.datos.imagen, {type: 'image/png'})
            const list = new DataTransfer()

            list.items.add(file)
            const myFileList = list.files

            $el[0].files = myFileList
            $el[0].dispatchEvent(new Event('change', {bubbles: true}))
        })

        /*Direccion*/
        cy.get('#currentAddress').type(this.datos.direccion)

        /*Estado y ciudad que son dropdowns con select*/
        cy.get('#state').click().find('div:contains("' + this.datos.estado + '")[id*="react-select"]').should("be.visible").click()
        cy.get('#city').click().find('div:contains("' + this.datos.ciudad + '")[id*="react-select"]').should("be.visible").click()
        
        /*Submit*/
        cy.get('#submit').click()


        /*Assertions avanzadas*/
        cy.get('#example-modal-sizes-title-lg')
            .should('have.text', 'Thanks for submitting the form')

        cy.get('td:contains(Student Name) +td')
            .should('have.text', this.datos.name + " " + this.datos.apellido)
            
        cy.get('td:contains(Student Email) +td')
            .should('have.text', this.datos.email)
            
        cy.get('td:contains(Gender) +td')
            .should('have.text', this.datos.sexo)

        cy.get('td:contains(Mobile) +td')
            .should('have.text', this.datos.telefono)
            
        cy.get('td:contains(Date of Birth) +td')
            .should('have.text', this.datos.fechaNacimiento[2] + " " + this.datos.fechaNacimiento[0] + "," + this.datos.fechaNacimiento[1])
        
        cy.get('td:contains(Subjects) +td')
            .should('have.text', this.datos.subjects[0] + ", " + this.datos.subjects[1])
        
        cy.get('td:contains(Hobbies) +td')
            .should('have.text', this.datos.hobbies[0] + ", " + this.datos.hobbies[1])
        
        cy.get('td:contains(Picture) +td')
            .should('have.text', this.datos.imagen)
        
        cy.get('td:contains(Address) +td')
            .should('have.text', this.datos.direccion)
            
        cy.get('td:contains(State and city) +td')
            .should('have.text', this.datos.estado + " " + this.datos.ciudad)
        
})