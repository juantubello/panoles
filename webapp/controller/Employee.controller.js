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

        return Controller.extend("ar.ledesma.fiori.mm.panioles.entregas.controller.Employee", {
            onInit: async function () {
               
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                var that = this;
                oRouter.attachRoutePatternMatched(function (oEvent) {

                    var oView = this.getView();

                   
                    
                    if (that.getView().getParent().getPreviousPage() === undefined) {
                      let initRouter = sap.ui.core.UIComponent.getRouterFor(that);
                     
                        
                     initRouter.navTo("login");
                       
                    }
                }, this);
  

                

            },

            yourFunction: function(){
  
                var oLoggedUser = this.getOwnerComponent().getModel("loggedUserModel");
                 if (oLoggedUser.getProperty("/Legajo") === '') {
                    this.oLoginFragment.open();
                  
                 }

         
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


                    this.getView().byId("inputEmployee").setValue("");
                    this.getOwnerComponent().getRouter().navTo("loan");
                } else {
                    sap.m.MessageToast.show("No se ha encontrado empleado");
                }

            },
            onAfterRendering: function () {
                // this.getView().byId('input-focus').focus();
            },

            getEmployee: async function (sEmployee) {

                var that = this;


                return new Promise(async (resolve, reject) => {
                    try {
                        that.getOwnerComponent().getModel("serviceModel").read("/getEmployees('" + sEmployee + "')", {
                            success: function (oData) {
                                console.log(oData)
                                resolve(oData);
                            }
                        });
                    } catch (err) {
                        reject(err)
                    }

                });

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
            "onPressCancel": function (oEvent) {
                this._DialogSelectFilter.destroy();
                this._DialogSelectFilter = null;

                this._ControllerSelectFilter = null;

                this._DialogMatchCentro = null;
                this._DialogMatchAlmacen = null;
                this._ControllerMatchAlmacen = null;
                this._ControllerMatchCentro = null;

                if (this._DialogMatchCentro) {
                    this._DialogMatchCentro.destroy();
                    this._DialogMatchAlmacen.destroy();
                }
                this.oLoginFragment.close();
            },

            "onLogOut": async function (oEvent) {

                var that = this;
                MessageBox.confirm("¿Desea desloguearse?", {
                    actions: ["Aceptar", "Cancelar"],
                    emphasizedAction: "Aceptar",
                    onClose: async function (sAction) {
                        if ( sAction === 'Aceptar' ){
                            var oLoggedUser = that.getOwnerComponent().getModel("loggedUserModel");

                            that.getView().byId("inputEmployee").setValue("");

                            that.getOwnerComponent().getModel("oLoginModel").setProperty("/plant", "")
                            that.getOwnerComponent().getModel("oLoginModel").setProperty("/userId", "")
                            that.getOwnerComponent().getModel("oLoginModel").setProperty("/storeLocation", "")
                            oLoggedUser.setProperty("/Legajo", "");
                            oLoggedUser.setProperty("/LegajoShow", "");
                            oLoggedUser.setProperty("/Paniol", "");
                            oLoggedUser.setProperty("/Nombre", "");
                            oLoggedUser.setProperty("/Id", "");
                            oLoggedUser.refresh()
            
                           
                            that.getOwnerComponent().getRouter().navTo("login");
                          //  that.oLoginFragment.open();
                        }
                       
                    }
                });
              
            },

            "onContinuar": async function (oEvent) {

                // var = this.getOwnerComponent().getModel("")
            
                var oLoggedUser = this.getOwnerComponent().getModel("loggedUserModel");

                if (sap.ui.getCore().byId("almacenLoginCombo").getSelectedKey() !== "") {


                    if (this.getOwnerComponent().getModel("oLoginModel")) {
                        this.getOwnerComponent().getModel("oLoginModel").setProperty("/plant", sap.ui.getCore().byId("plantId").getValue())
                        this.getOwnerComponent().getModel("oLoginModel").setProperty("/userId", oLoggedUser.getProperty("/Id"))
                        this.getOwnerComponent().getModel("oLoginModel").setProperty("/storeLocation", sap.ui.getCore().byId("almacenLoginCombo").getSelectedKey())



                    } else {
                        this.getOwnerComponent().setModel(new JSONModel().setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay), "oLoginModel")
                        this.getOwnerComponent().getModel("oLoginModel").setProperty("/plant", sap.ui.getCore().byId("plantId").getValue())
                        this.getOwnerComponent().getModel("oLoginModel").setProperty("/userId", oLoggedUser.getProperty("/Id"))
                        this.getOwnerComponent().getModel("oLoginModel").setProperty("/storeLocation", sap.ui.getCore().byId("almacenLoginCombo").getSelectedKey())
                    }
                    this.getOwnerComponent().getModel("oLoginModel").refresh();

                    this.oLoginFragment.close();
                }
                else {
                    sap.m.MessageToast.show("Debe elegir un Almacen");
                } 


            },
            onLiveChange: function (oEvent) {
                this.getView().byId("inputEmployee").setValue(oEvent.mParameters.value = oEvent.mParameters.value.replace(/\*/g, ""));

            },
            "onSubmit": async function (oEvent) {


                sap.ui.getCore().byId("legajoPanolero").setValue(oEvent.mParameters.value = oEvent.mParameters.value.replace(/\*/g, ""));
                var sUser = oEvent.mParameters.value.replace(/\s/g, "");
                return new Promise(async (resolve, reject) => {
                    

                    var oLoggedUser = this.getOwnerComponent().getModel("loggedUserModel");


                    try {
                        let oSelect, oBinding, aFilters;

                        oSelect = sap.ui.getCore().byId("almacenLoginCombo"); //get the reference to your Select control
                        sap.ui.getCore().byId("almacenLoginCombo").setSelectedKey("")


                        oBinding = oSelect.getBinding("items");
                        aFilters = [];

                        aFilters.push(new Filter("storeKeeper", FilterOperator.EQ, sUser));
                        oBinding.filter(aFilters, FilterType.Application); //apply the filter
                        await oBinding.attachChange(async function () {
                            // Resolve the promise with the filtered data
                            return new Promise((resolve, reject) => {
                                resolve(oBinding.getCurrentContexts().map(function (context) {
                                    sap.ui.getCore().byId("plantId").setValue(context.getObject().plant);
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
