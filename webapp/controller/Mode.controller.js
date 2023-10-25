sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("ar.ledesma.fiori.mm.panioles.entregas.controller.Mode", {
            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("mode").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function() {
                sap.m.MessageToast.show('EMPLEADO ENCONTRADO')
            },

            toReturns: function() { // Devoluciones
                // window.history.go(-1);
                this.getOwnerComponent().getRouter().navTo("returns");
            },

            toDelivery: function() { // Entregas
                this.getOwnerComponent().getRouter().navTo("delivery");
            },

            toLoan: function() { // Prestamos
                this.getOwnerComponent().getRouter().navTo("loan");
            },
            
            toEmployee: function() { // Prestamos
                this.getOwnerComponent().getRouter().navTo("employee");
            }

            // onSearch: function(){
            //     // this.byId('button-2').setVisible(true);
            //     this.byId('list-1').setVisible(true);
            // }
        });
    });
