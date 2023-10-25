/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "ar/ledesma/fiori/mm/panioles/entregas/model/models",
    "sap/ui/model/json/JSONModel"
],
    function (UIComponent, Device, models, JSONModel) {
        "use strict";

        return UIComponent.extend("ar.ledesma.fiori.mm.panioles.entregas.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                this.setModel(new JSONModel
                    ({
                        "Materiales": []
                     
                    }), "dataModel");



                this.setModel(new JSONModel
                    ({
                        "Materiales": []
                    }), "returnsModel");

                this.setModel(new JSONModel({ "Nombre": '', "Paniol": "" }), "loggedUserModel");
                this.setModel(new JSONModel({ "Nombre": 'EMPLEADO 500 (Amadeo Martinez)', "employee": "10251082" }), "employeeModel");

               

                let appId = this.getManifestEntry("/sap.app/id");
                let appPath = appId.replaceAll(".", "/");
                $.appModulePath = jQuery.sap.getModulePath(appPath);
            }

        });
    }
);