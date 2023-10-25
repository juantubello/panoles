sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("ar.ledesma.fiori.mm.panioles.entregas.controller.Review", {
            onInit: function () {

            },
            toEmployee: function() {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("employee");
            },
            toMaterials: function() {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("materials");
            }
        });
    });
