sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../utils/dms",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/Fragment",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterType",
    'sap/ui/model/FilterOperator',
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, DMS, BusyIndicator, Fragment, Filter, FilterType, FilterOperator, MessageBox, History) {
        "use strict";

        return Controller.extend("ar.ledesma.fiori.mm.panioles.entregas.controller.Login", {
            onInit: async function () {
               
               
                const oImageModel = new JSONModel();
                this.getView().setModel(oImageModel, "imageModel");




                this.authClientHide = 'sb-97de5e58-e18a-4963-b168-b580689fa283!b5657|sdm-di-DocumentManagement-sdm_integration!b2797'
                this.authSecretHide = '7qfT/G5+33AOdoYF0UuplT0ZWjw='
                this.tokenUrlHide = 'https://dev-aplicaciones-z59t51rh.authentication.us30.hana.ondemand.com'
                this.repositoryIdHide = '3a175656-1040-4344-b3ad-90185a6f506b'
                this.dmsUrlHide = 'https://api-sdm-di.cfapps.us30.hana.ondemand.com'


                const oRequestsModel = new JSONModel({})
               
                // In your controller or view
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                
      

                oRouter.attachRoutePatternMatched(function (oEvent) {
                    var sRouteName = oEvent.getParameter("name");
                    
                    // Check if the route matches the desired route
                    if (sRouteName === "employee" || sRouteName === "loan") {
                        // Execute your function here
                        this.borrarDatos();
                    }
                }, this);
                

            },

            borrarDatos: async function(){
  
                var oLoggedUser = this.getOwnerComponent().getModel("loggedUserModel");
               
                    this.getView().byId("almacenLoginCombo").setValue("");
                    this.getView().byId("almacenLoginCombo").setSelectedKey("");
                    var oBinding =  this.getView().byId("almacenLoginCombo").getBinding("items");
                    oBinding.filter([], FilterType.Application); //apply the filter
                    await oBinding.attachChange(async function () {
                    });
    
                    this.getView().byId("legajoPanolero").setValue("");
                    this.getView().byId("plantId").setValue("");
    
                  
                 



         
              },


            // toMaterials: function () {
            //     var oRouter = this.getOwnerComponent().getRouter();
            //     oRouter.navTo("materials");
            // },
            onSearch: async function () {

                let sEmployee = this.getView().byId("inputEmployee").getValue();

                BusyIndicator.show(0);
                let oEmployee = await this.getEmployee(sEmployee);
                BusyIndicator.hide(0);

                if (oEmployee.description.length > 0) {

                    let oEmployeeModel = this.getOwnerComponent().getModel("employeeModel")

                    oEmployeeModel.setProperty("/Nombre", "Empleado:(" + oEmployee.employee + ") " + oEmployee.description)
                    oEmployeeModel.setProperty("/employee", oEmployee.employee);
                    oEmployeeModel.setProperty("/costCenter", oEmployee.costCenter);



                    this.getOwnerComponent().getRouter().navTo("loan");
                } else {
                    sap.m.MessageToast.show("No se ha encontrado empleado");
                }

            },
            onAfterRendering: function () {
                // this.getView().byId('input-focus').focus();
            },

      

            _initFragment: function (sPath) {
                const that = this;
                return new Promise((resolve, reject) => {
                    const oFragmentInstance = Fragment.load({
                        name: sPath,
                        controller: that
                    }).then(oFragment => {
                        return oFragment;
                    }).catch(error => {
                        reject(error);
                    });
                    resolve(oFragmentInstance);
                });
            },
  
            "onLogOut": async function (oEvent) {

                var that = this;
                MessageBox.confirm("¿Desea desloguearse?", {
                    actions: ["Aceptar", "Cancelar"],
                    emphasizedAction: "Aceptar",
                    onClose: async function (sAction) {
                        if ( sAction === 'Aceptar' ){
                            var oLoggedUser = that.getOwnerComponent().getModel("loggedUserModel");

                            that.getOwnerComponent().getModel("oLoginModel").setProperty("/plant", "")
                            that.getOwnerComponent().getModel("oLoginModel").setProperty("/userId", "")
                            that.getOwnerComponent().getModel("oLoginModel").setProperty("/storeLocation", "")
                            oLoggedUser.setProperty("/Legajo", "");
                            oLoggedUser.setProperty("/LegajoShow", "");
                            oLoggedUser.setProperty("/Paniol", "");
                            oLoggedUser.setProperty("/Nombre", "");
                            oLoggedUser.setProperty("/Id", "");
                            oLoggedUser.refresh()
            
                            sap.ui.getCore().byId("almacenLoginCombo").setValue("");
                            sap.ui.getCore().byId("almacenLoginCombo").setSelectedKey("");
                            var oBinding = sap.ui.getCore().byId("almacenLoginCombo").getBinding("items");
                            oBinding.filter([], FilterType.Application); //apply the filter
                            await oBinding.attachChange(async function () {
                            });
            
                            sap.ui.getCore().byId("legajoPanolero").setValue("");
                            sap.ui.getCore().byId("plantId").setValue("");
            
                            this.getOwnerComponent().getRouter().navTo("login");
                            
                        }
                       
                    }
                });
              
            },

            "onContinuar": async function (oEvent) {

                // var = this.getOwnerComponent().getModel("")
            
                var oLoggedUser = this.getOwnerComponent().getModel("loggedUserModel");

                if (  this.getView().byId("almacenLoginCombo").getSelectedKey() !== "") {


                    if (this.getOwnerComponent().getModel("oLoginModel")) {
                        this.getOwnerComponent().getModel("oLoginModel").setProperty("/plant",   this.getView().byId("plantId").getValue())
                        this.getOwnerComponent().getModel("oLoginModel").setProperty("/userId", oLoggedUser.getProperty("/Id"))
                        this.getOwnerComponent().getModel("oLoginModel").setProperty("/storeLocation",   this.getView().byId("almacenLoginCombo").getSelectedKey())



                    } else {
                        this.getOwnerComponent().setModel(new JSONModel().setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay), "oLoginModel")
                        this.getOwnerComponent().getModel("oLoginModel").setProperty("/plant",   this.getView().byId("plantId").getValue())
                        this.getOwnerComponent().getModel("oLoginModel").setProperty("/userId", oLoggedUser.getProperty("/Id"))
                        this.getOwnerComponent().getModel("oLoginModel").setProperty("/storeLocation",   this.getView().byId("almacenLoginCombo").getSelectedKey())
                    }
                    this.getOwnerComponent().getModel("oLoginModel").refresh();

                    this.getOwnerComponent().getRouter().navTo("employee");
                }
                else {
                    sap.m.MessageToast.show("Debe elegir un Almacen");
                } 


            },
            onLiveChange: function (oEvent) {
                this.getView().byId("inputEmployee").setValue(oEvent.mParameters.value = oEvent.mParameters.value.replace(/\*/g, ""));

            },
            "onSubmit": async function (oEvent) {

                var that = this;
                this.getView().byId("legajoPanolero").setValue(oEvent.mParameters.value = oEvent.mParameters.value.replace(/\*/g, ""));
                var sUser = oEvent.mParameters.value.replace(/\s/g, "");
                return new Promise(async (resolve, reject) => {
                    

                    var oLoggedUser = this.getOwnerComponent().getModel("loggedUserModel");


                    try {
                        let oSelect, oBinding, aFilters;

                        oSelect =  this.getView().byId("almacenLoginCombo"); //get the reference to your Select control
                        this.getView().byId("almacenLoginCombo").setSelectedKey("")


                        oBinding = oSelect.getBinding("items");
                        aFilters = [];

                        aFilters.push(new Filter("storeKeeper", FilterOperator.EQ, sUser));
                        oBinding.filter(aFilters, FilterType.Application); //apply the filter
                        await oBinding.attachChange(async function () {
                            // Resolve the promise with the filtered data
                            return new Promise((resolve, reject) => {
                                resolve(oBinding.getCurrentContexts().map(function (context) {
                                    that.getView().byId("plantId").setValue(context.getObject().plant);
                                    if (oLoggedUser.getProperty("/Legajo") === '' || oLoggedUser.getProperty("/Legajo") === undefined) {

                                        oLoggedUser.setProperty("/Legajo", context.getObject().storeKeeper);
                                        oLoggedUser.setProperty("/LegajoShow", "(" + context.getObject().storeKeeper + ")");
                                        oLoggedUser.setProperty("/Paniol", +context.getObject().plant);
                                        oLoggedUser.setProperty("/Nombre", context.getObject().storeKeeperName);
                                        oLoggedUser.setProperty("/Id", context.getObject().storeKeeperId);
                                        oLoggedUser.refresh()
                                        console.log(oLoggedUser)
                                    }

                                    return context.getObject();
                                }));
                            })
                        });



                    } catch (err) {
                        reject(err)
                    }
                });
            }
        });
    });
