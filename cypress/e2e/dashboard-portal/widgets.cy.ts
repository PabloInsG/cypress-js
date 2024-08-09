/// <reference types='cypress' />

describe("Dashboard eplan-met-dev", () => {

    const office = Cypress.env('despacho');

    beforeEach(() => {

        cy.interceptCrmRequest<ElementRegistriesResponse[]>({
            path: 'menus/me',
            trigger: () => cy.enterOfficeAndLogin(office, "juanval1986@gmail.com", "Sudespach00*"),
            callback: (response, status) => {
                expect(status).to.eq(200);
            },
        })
    })

    it.skip("Los widgets deben aparecer y dar la información correcta", () => {

        const fechaNoFormat = new Date();

        //Today date
        const todayDay = new Date().getDate();
        const todayMonth = new Date().getMonth();
        const todayYear = new Date().getFullYear();

        let mes = (fechaNoFormat.getMonth() + 1); // Obtener el mes (MM). Los string dan problemas
        mes = mes < 10 ? `0${mes.toString()}` : mes.toString();
        let dia = fechaNoFormat.getDate();
        dia = dia < 10 ? `0${dia.toString()}` : dia.toString();

        const fecha = fechaNoFormat.getFullYear().toString() + "-" + mes + "-" + dia;

        console.log(fecha);

        cy.intercept("GET", "https://api-crm.dev.iberley.org/api/questions?page=1&itemsPerPage=99999&properties%5B0%5D=id")
            .as("numConsultas");
        cy.intercept("GET", `https://api-crm.dev.iberley.org/api/timetracking/worked?fromDate=${fecha}&toDate=${fecha}`)
            .as("tiempoReloj");
        cy.intercept("GET", "https://api-crm.dev.iberley.org/api/timetracking/worked?fromDate=2024-04-01&toDate=2024-04-30&dbal=1")
            .as("tablaHoras");
        cy.intercept("https://api-crm.dev.iberley.org/api/questions?page=1&itemsPerPage=10&properties%5B0%5D=id&properties%5B1%5D=asunto&properties%5B2%5D=estado&properties%5B3%5D=leido&properties%5B4%5D=consulta&properties%5B5%5D=fecha_creacion&filterGroup%5Bcondition%5D=AND&filterGroup%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Boperator%5D=equal&filterGroup%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Bvalue%5D=abierto&filterGroup%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Bproperty%5D=estado&filterGroup%5BfilterGroups%5D%5B0%5D%5Bcondition%5D=AND")
            .as("consultasAbiertas");
        cy.intercept("https://api-crm.dev.iberley.org/api/questions?page=1&itemsPerPage=10&properties%5B0%5D=id&properties%5B1%5D=asunto&properties%5B2%5D=estado&properties%5B3%5D=leido&properties%5B4%5D=consulta&properties%5B5%5D=fecha_creacion&filterGroup%5Bcondition%5D=AND&filterGroup%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Boperator%5D=equal&filterGroup%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Bvalue%5D=cerrado&filterGroup%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Bproperty%5D=estado&filterGroup%5BfilterGroups%5D%5B0%5D%5Bcondition%5D=AND")
            .as("consultasCerradas");
        cy.intercept("https://api-crm.dev.iberley.org/api/holidays?idUser=me&page=1&itemsPerPage=10&id=me&properties%5B0%5D=id&properties%5B1%5D=asunto&properties%5B2%5D=estado&properties%5B3%5D=fecha_inicio&properties%5B4%5D=fecha_fin&properties%5B5%5D=tipo&properties%5B6%5D=notas&properties%5B7%5D=numero_dias&filterGroup%5Bcondition%5D=AND&filterGroup%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Boperator%5D=equal&filterGroup%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Bvalue%5D=Pendiente&filterGroup%5BfilterGroups%5D%5B0%5D%5Bfilters%5D%5B0%5D%5Bproperty%5D=estado&filterGroup%5BfilterGroups%5D%5B0%5D%5Bcondition%5D=AND")
            .as("vacacionesPendientes");

        cy.wait("@numConsultas").then((response) => {

            const data = response.response?.body

            //Consultas realizadas
            cy.get(".card-value.h1").eq(0).should("contain", data["totalItems"]);
        });

        cy.wait("@tiempoReloj").then((response) => {

            const data = response.response?.body;


            if (data.length > 0) {
                

                //con .h4 se pueden coger las salidas. Aquí se coge el reloj
                cy.get(".h4 span").each(($el, index) => {
                    switch (index) {
                        case 0:
                            //Comprobación de horas
                            let horas = "";
    
                            if (data[0]["time"]["hours"] < 10) {
                                horas = "0" + data[0]["time"]["hours"].toString()
                            }
                            cy.wrap($el).should("contain", horas);
                            break;
                        case 1:
                            //Comprobación de minutos
                            let min = "";
    
                            if (data[0]["time"]["minutes"] < 10) {
                                min = "0" + data[0]["time"]["minutes"].toString()
                            }
                            cy.wrap($el).should("contain", min);
                            break;
                        default:
                            break;
                    }
                })
            }
        })

        cy.wait("@tablaHoras").then((response) => {

            const data = response.response?.body;

            for (let i = 0; i < data.length; i++) {

                //Cogemos el día del data. Así podemos coger tanto el elemento que necesitamos, como su valor en horas.
                const fecha = new Date(data[i]["details"][0]["inDateTime"]);

                const dia = fecha.getDate();

                cy.get("g.apexcharts-series path").eq(dia - 1).should("have.attr", "val", data[i]["time"]["hours"]);

            }
        })

        //Comprobación tabla consultas abiertas
        cy.wait("@consultasAbiertas").then((response) => {

            const data = response.response?.body;

            cy.get(".el-table__body").eq(1).within(() => {

                cy.get("tbody tr").each(($tr, index) => {

                    const tds = $tr.find("td");

                    //Validación por columnas
                    cy.wrap(tds).eq(0).should("contain", data["items"][index]["values"][0]["value"]);
                    cy.wrap(tds).eq(1).should("contain", data["items"][index]["values"][3]["value"]);
                    cy.wrap(tds).eq(2).find("svg").invoke("attr", "fill").then((atributo) => {
                        const color = atributo;
                        if (data["items"][index]["values"][2]["value"] == 0) {
                            cy.wrap(atributo).should("contain", "red");
                        } else {
                            cy.wrap(atributo).should("contain", "green");
                        }
                    })
                    // Validación fecha creación
                    cy.wrap(tds).eq(3).find("span").invoke("text").then((value) => {
                        const text = value;

                        //Json date
                        const jsonDate = new Date(data["items"][index]["values"][4]["value"]);
                        const jsonDay = jsonDate.getDate();
                        const jsonMonth = jsonDate.getMonth();
                        const jsonYear = jsonDate.getFullYear();

                        //Hour format
                        const hour = jsonDate.getHours();
                        const min = jsonDate.getMinutes();
                        const hourFormat = `${hour < 10 ? '0' : ''}${hour}:${min < 10 ? '0' : ''}${min}`;

                        //Date format
                        const dateFormat = `${jsonYear}-${jsonMonth < 10 ? '0' : ''}${jsonMonth + 1}-${jsonDay < 10 ? '0' : ''}${jsonDay}`;

                        if (todayDay === jsonDay && todayMonth === jsonMonth && todayYear === jsonYear) {
                            cy.wrap(text).should("contain", "hoy a las " + hourFormat);
                        } else if (jsonDay == todayDay - 1 && todayMonth === jsonMonth && todayYear === jsonYear) {
                            cy.wrap(text).should("contain", "ayer a las " + hourFormat)
                        } else {
                            cy.wrap(text).should("contain", dateFormat + " " + hourFormat);
                        }
                        console.log(text);


                    })
                })
            });
        });

        //Comprobación vacaciones pendientes
        cy.wait("@vacacionesPendientes").then((response) =>{
            
            const data = response.response?.body;

            cy.get(".el-table__body").eq(2).within(() =>{

                cy.get("tbody").find("tr").each(($tr, index) =>{
    
                    const tds = $tr.find("td");

                    //Validación por columnas
                    cy.wrap(tds).eq(0).should("contain", data["items"][index]["values"][0]["value"]);
                    cy.wrap(tds).eq(1).should("contain", data["items"][index]["values"][2]["value"]);
                    cy.wrap(tds).eq(2).should("contain", data["items"][index]["values"][3]["value"]);
                    cy.wrap(tds).eq(3).should("contain", data["items"][index]["values"][6]["value"]);
                    cy.wrap(tds).eq(4).invoke("text").then((text) =>{
                        
                        expect(text.toLowerCase()).to.contains(data["items"][index]["values"][4]["value"])
                    })

                })
            })
    
        })
        
        cy.get("#tab-cerrado").click();

        //Comprobación de consultas cerradas
        cy.wait("@consultasCerradas").then((response) =>{

            const data = response.response?.body;
            console.log(data)

            cy.get(".el-table__body").eq(0).within(() => {

                cy.get("tbody tr").each(($tr, index) => {

                    const tds = $tr.find("td");

                    //Validación por columnas
                    cy.wrap(tds).eq(0).should("contain", data["items"][index]["values"][0]["value"]);
                    cy.wrap(tds).eq(1).should("contain", data["items"][index]["values"][3]["value"]);
                    cy.wrap(tds).eq(2).find("svg").invoke("attr", "fill").then((atributo) => {
                        const color = atributo;
                        if (data["items"][index]["values"][2]["value"] == 0) {
                            cy.wrap(atributo).should("contain", "red");
                        } else {
                            cy.wrap(atributo).should("contain", "green");
                        }
                    })
                    cy.wrap(tds).eq(3).find("span").invoke("text").then((value) => {
                        const text = value;

                        //Json date
                        const jsonDate = new Date(data["items"][index]["values"][4]["value"]);
                        const jsonDay = jsonDate.getDate();
                        const jsonMonth = jsonDate.getMonth();
                        const jsonYear = jsonDate.getFullYear();

                        //Hour format
                        const hour = jsonDate.getHours();
                        const min = jsonDate.getMinutes();
                        const hourFormat = `${hour < 10 ? '0' : ''}${hour}:${min < 10 ? '0' : ''}${min}`;

                        //Date format
                        const dateFormat = `${jsonYear}-${jsonMonth < 10 ? '0' : ''}${jsonMonth + 1}-${jsonDay < 10 ? '0' : ''}${jsonDay}`;

                        if (todayDay === jsonDay && todayMonth === jsonMonth && todayYear === jsonYear) {
                            cy.wrap(text).should("contain", "hoy a las " + hourFormat);
                        } else if (jsonDay == todayDay - 1 && todayMonth === jsonMonth && todayYear === jsonYear) {
                            cy.wrap(text).should("contain", "ayer a las " + hourFormat)
                        } else {
                            cy.wrap(text).should("contain", dateFormat + " " + hourFormat);
                        }
                        console.log(text);
                    })
                })
            })
        });
    });
})