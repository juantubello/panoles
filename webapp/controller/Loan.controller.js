sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/core/BusyIndicator",
    "../utils/dms",
    'sap/ui/model/Filter',
    "sap/ui/model/FilterType",
    'sap/ui/model/FilterOperator',
    "sap/m/Dialog",
    "sap/m/Image",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Fragment, BusyIndicator, DMS, Filter, FilterType, FilterOperator, Dialog, Image, MessageBox, History) {
        "use strict";

        return Controller.extend("ar.ledesma.fiori.mm.panioles.entregas.controller.Loan", {
            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                oRouter.getRoute("loan").attachPatternMatched(this._onObjectMatched, this);


                this._operation = "Prestamos";
                this.authClientHide = 'sb-97de5e58-e18a-4963-b168-b580689fa283!b5657|sdm-di-DocumentManagement-sdm_integration!b2797'
                this.authSecretHide = '7qfT/G5+33AOdoYF0UuplT0ZWjw='
                this.tokenUrlHide = 'https://dev-aplicaciones-z59t51rh.authentication.us30.hana.ondemand.com'
                this.repositoryIdHide = '3a175656-1040-4344-b3ad-90185a6f506b'
                this.dmsUrlHide = 'https://api-sdm-di.cfapps.us30.hana.ondemand.com'

                // const oRequestsModel = new JSONModel({})
                // this.getView().setModel(oRequestsModel, "requestsModel")
                const oService = this.getOwnerComponent().getModel("dmsService")
                this.oDMS = new DMS(oService, this.authClientHide, this.authSecretHide, this.tokenUrlHide, this.repositoryIdHide, this.dmsUrlHide)

                // const response = await this.oDMS.getImage()
                // let image = response.results[0].image
                // oRequestsModel.setProperty("/image", image)
                // console.log(response)

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

            _onObjectMatched: function () {
                // sap.m.MessageToast.show('MODO PRESTAMO')
            },

            toEmployee: function () {
                // window.history.go(-1);

                this.clearPantalla();
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("employee");
            },
            toReview: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("review");
            },
            onAdd: async function () {

                if (!this.getOwnerComponent().getModel("dataModel")) {
                    this.getOwnerComponent().setModel(new JSONModel
                        ({
                            "Materiales": []
                        }), "dataModel");
                }

                var oModel = this.getOwnerComponent().getModel("dataModel");

                if (this._operation === "Entregas") {
                    var sTipo = 'PLP'
                    var sMaterial = this.getView().byId("inputMaterialEntregas").getValue().replace(/\s/g, "");
                } else {
                    sTipo = 'PCP'
                    sMaterial = this.getView().byId("inputMaterialPrestamos").getValue().replace(/\s/g, "");
                }


                if (sMaterial) {

                    BusyIndicator.show(0);
                    let oMaterial = await this.getMaterial(sMaterial);


                    console.log(oMaterial);
                    BusyIndicator.hide(0);
                    if (oMaterial.noMara === "X") {
                        // sap.m.MessageToast.show("Material Inexistente");
                        MessageBox.error("Material inexistente");
                        return;
                    }else
                        if (oMaterial.type === "") {
                        // sap.m.MessageToast.show("Material Inexistente");
                        MessageBox.error("Material no configurado");
                        return;
                    }
                    if (oMaterial.type === sTipo || (this._operation === "Prestamos" && oMaterial.type === 'SSR')) {



                        this.getView().byId("list" + this._operation).setVisible(true);

                        var jsonModel = {};

                        jsonModel.Descripcion = oMaterial.description;
                        jsonModel.Codigo = oMaterial.material.replace(/\s/g, "");
                        jsonModel.type = oMaterial.type;
                        jsonModel.cantidad = "1";

                        oModel.getProperty("/Materiales").push(Object.assign({}, jsonModel));
                        oModel.refresh();
                    } else {
                        MessageBox.error("Tipo de material no permitido en esta pestaña");
                        //  sap.m.MessageToast.show("Tipo de material no permitido en esta pestaña");
                    }


                }



            },

            onChangeInput: function (oEvent) {
                debugger;
                if (oEvent.getParameter("value") > 1000) {
                   
                }
            },

            clearPantalla: function () {

                var oModel = this.getOwnerComponent().getModel("dataModel");
                oModel.setProperty("/Materiales", []);
                this.getView().byId("listPrestamos").setVisible(false);
                this.getView().byId("listEntregas").setVisible(false);

                var oModelReturn = this.getOwnerComponent().getModel("returnsModel");
                oModelReturn.setProperty("/Materiales", []);

                this.getView().byId("inputMaterialEntregas").setValue("");
                this.getView().byId("inputMaterialPrestamos").setValue("");

            },

            onChangeOperacion: async function (oEvent) {

                this.clearPantalla();



                var sKey = oEvent.getParameter("key");
                var oEmployeeModel = this.getOwnerComponent().getModel("employeeModel");
                this._operation = sKey
                if (sKey === 'DevolucionesCP') {
                    this.pendings(oEmployeeModel, "PCP")
                }
                if (sKey === 'DevolucionesLP') {
                    this.pendings(oEmployeeModel, "PLP")
                }





            },

            pendings: async function (oEmployeeModel, sType) {


                BusyIndicator.show(0);
                var oPendings = await this.getPendings(oEmployeeModel.oData.employee, sType);


                await this.listPendings(oPendings);
                BusyIndicator.hide();

                console.log(oPendings)


            },
            onLiveChange: function (oEvent) {
                this.getView().byId("inputMaterialEntregas").setValue(oEvent.mParameters.value = oEvent.mParameters.value.replace(/\*/g, ""));
                this.getView().byId("inputMaterialPrestamos").setValue(oEvent.mParameters.value = oEvent.mParameters.value.replace(/\*/g, ""));
            },

            listPendings: async function (oPendings) {


                var that = this;

                if (!this.getOwnerComponent().getModel("returnsModel")) {
                    this.getOwnerComponent().setModel(new JSONModel
                        ({
                            "Materiales": []
                        }), "returnsModel");
                }

                var oModel = this.getOwnerComponent().getModel("returnsModel");
                oModel.setProperty("/Materiales", []);



                await this.procesarElementos(oPendings, oModel);
                oModel.refresh();


            },

            procesarElementos: async function (oPendings, oModel) {


                const promesas = oPendings.results.map(elemento => this.procesarElementoAsync(elemento, oModel));

                await Promise.all(promesas).then(response => {
                    console.log(response);
                }).catch(e => {
                    console.log(e);
                });

                console.log("Todos los elementos han sido procesados de manera asíncrona");
            },

            procesarElementoAsync: async function (elemento, oModel) {
                var that = this;
                var jsonModel = {};


                return new Promise(async (resolve, reject) => {
                    // Simula una operación asíncrona, como una solicitud HTTP o una tarea demorada
                    var indexDoc = "X";
                    elemento.pendingToDocument.results.some(function (value, index) {
                        if (value.imagen === "X") {
                            indexDoc = index;
                        }

                    });
                    debugger;

                    if (indexDoc !== "X") {
                        var path = 'root/' + elemento.pendingToDocument.results[indexDoc].documentNumber + elemento.pendingToDocument.results[indexDoc].year;
                    } else {
                        var path = 'root/' + elemento.pendingToDocument.results[0].documentNumber + elemento.pendingToDocument.results[0].year;
                    }


                    jsonModel.Descripcion = elemento.description;
                    jsonModel.Codigo = elemento.material;
                    jsonModel.type = elemento.type;
                    jsonModel.Cantidad = parseFloat(elemento.amount)
                    jsonModel.pendingToDocument = elemento.pendingToDocument
                    jsonModel.CantidadDevuelta = "1"

                    jsonModel.Return = false;

                    if (indexDoc !== "X") {
                        try {
                            var response = await that.oDMS.getImage(elemento.material, path);
                            jsonModel.URL = response.results[0].image;
                            resolve();

                        } catch (error) {
                            reject();
                        }
                    } else {
                        resolve();
                    }

                    oModel.getProperty("/Materiales").push(Object.assign({}, jsonModel));





                });
            },

            getPendings: function (sEmployee, sType) {
                var that = this;
                var aFilters = [];
                aFilters.push(new Filter("employeeId", FilterOperator.EQ, sEmployee));
                aFilters.push(new Filter("type", FilterOperator.EQ, sType));


                return new Promise(async (resolve, reject) => {

                    try {
                        that.getOwnerComponent().getModel("serviceModel").read("/getPendings", {
                            filters: aFilters,
                            urlParameters: {
                                "$expand": "pendingToDocument"
                            },
                            success: function (oData) {

                                resolve(oData);
                            }
                        });
                    } catch (err) {
                        reject(err)
                    }

                });
            },

            getMaterial: async function (sMaterial) {

                var that = this;


                return new Promise(async (resolve, reject) => {

                    try {
                        that.getOwnerComponent().getModel("serviceModel").read("/getMaterials('" + sMaterial + "')", {
                            success: function (oData) {

                                resolve(oData);
                            }
                        });
                    } catch (err) {
                        reject(err)
                    }

                });

            },
            onDelete: function (oEvent) {


                var sPath = oEvent.getSource().getBindingContext("dataModel").sPath
                const selectedIndex = sPath.slice(-1)[0];


                this.getOwnerComponent().getModel("dataModel").getData().Materiales.splice(selectedIndex, 1);
                this.getOwnerComponent().getModel("dataModel").refresh();
            },

            onConfirmar: async function () {



                var oLoginModel = this.getOwnerComponent().getModel("oLoginModel");
                var oEmployeeModel = this.getOwnerComponent().getModel("employeeModel");
                var that = this;
                var aHeaderToItem = [];
                var jsonHeaderToItem = {};
                var jsonDatos = {};
                var error = 0;

                var oItemsDevolucion = this.getOwnerComponent().getModel("returnsModel");
                var oItems = this.getOwnerComponent().getModel("dataModel");

                oItems.oData.Materiales.forEach(function (value) {
                    if (value.cantidad > 1000) {
                        error = 1;

                    }
                });

                if (error !== 1) {


                    MessageBox.information("¿Desea confirmar el documento?", {
                        actions: ["Aceptar", "Cancelar"],
                        emphasizedAction: "Aceptar",
                        onClose: async function (sAction) {
                            if (sAction === 'Aceptar') {
                                if (oItemsDevolucion.oData.Materiales.length > 0 || oItems.oData.Materiales.length > 0) {

                                    switch (that._operation) {


                                        case "DevolucionesCP":
                                        case "DevolucionesLP":




                                            aHeaderToItem = [];
                                            jsonHeaderToItem = {};
                                            jsonDatos = {};


                                            jsonDatos.documentNumber = "";
                                            jsonDatos.documentYear = "";
                                            jsonDatos.storeKeeper = oLoginModel.oData.userId;
                                            jsonDatos.statusDoc = "";

                                            oItemsDevolucion.oData.Materiales.forEach(function (value) {
                                                if (value.Return) {

                                                    jsonHeaderToItem.documentNumber = "";
                                                    jsonHeaderToItem.material = value.Codigo;
                                                    jsonHeaderToItem.plant = oLoginModel.oData.plant;
                                                    jsonHeaderToItem.stageLoc = oLoginModel.oData.storeLocation;
                                                    jsonHeaderToItem.entryQnt = value.CantidadDevuelta.toString();;
                                                    jsonHeaderToItem.unloadPt = oEmployeeModel.oData.employee;
                                                    jsonHeaderToItem.costCenter = oEmployeeModel.oData.costCenter;
                                                    jsonHeaderToItem.grRcpt = value.type;
                                                    jsonHeaderToItem.itemText = value.Comentario;
                                                    jsonHeaderToItem.itemToDocument = value.pendingToDocument.results;
                                                    jsonHeaderToItem.moveReas = value.MoveReas;

                                                    aHeaderToItem.push(Object.assign({}, jsonHeaderToItem));
                                                }

                                            });


                                            break;
                                        case "Prestamos":
                                        case "Entregas":




                                            aHeaderToItem = [];
                                            jsonHeaderToItem = {};
                                            jsonDatos = {};


                                            jsonDatos.documentNumber = "";
                                            jsonDatos.documentYear = "";
                                            jsonDatos.storeKeeper = oLoginModel.oData.userId;
                                            jsonDatos.statusDoc = "";

                                            oItems.oData.Materiales.forEach(function (value) {


                                                jsonHeaderToItem.documentNumber = "";
                                                jsonHeaderToItem.material = value.Codigo;
                                                jsonHeaderToItem.plant = oLoginModel.oData.plant;
                                                jsonHeaderToItem.stageLoc = oLoginModel.oData.storeLocation;
                                                jsonHeaderToItem.entryQnt = value.cantidad.toString();;
                                                jsonHeaderToItem.unloadPt = oEmployeeModel.oData.employee;
                                                jsonHeaderToItem.costCenter = oEmployeeModel.oData.costCenter;
                                                jsonHeaderToItem.grRcpt = value.type;
                                                jsonHeaderToItem.itemText = value.Comentario;
                                                if (value.Imagen) {
                                                    jsonHeaderToItem.imagen = "X";
                                                } else {
                                                    jsonHeaderToItem.imagen = "";
                                                }



                                                aHeaderToItem.push(Object.assign({}, jsonHeaderToItem));

                                                console.log(value);
                                            });


                                            break;
                                    }

                                    jsonDatos.headerToItem = aHeaderToItem;

                                    sap.ui.core.BusyIndicator.show(0);
                                    let oResultado = await that.createMaterialDocument(jsonDatos);
                                    debugger;
                                    if (oResultado.statusDoc === 'OK') {
                                        MessageBox.information("Documento creado: " + oResultado.documentNumber + "-" + oResultado.documentYear, {
                                            actions: ["Aceptar"],
                                            emphasizedAction: "Aceptar",
                                            onClose: async function (sAction) { }
                                        });


                                        oItems.oData.MaterialesAux = oItems.oData.Materiales
                                        switch (that._operation) {
                                            case "DevolucionesCP":
                                                that.pendings(oEmployeeModel, "PCP")
                                                break;

                                            case "DevolucionesLP":
                                                that.pendings(oEmployeeModel, "PLP")
                                                break;

                                            case "Prestamos":
                                            case "Entregas":
                                                if (that._tengoURL) {

                                                    try {


                                                        that.oDMS.createFolder(oResultado.documentNumber + oResultado.documentYear, "root").then((res) => {
                                                            const folderPath = `${res.path}/${res.folderName}`
                                                            oItems.oData.MaterialesAux.forEach(function (value) {

                                                                that.oDMS.uploadImageToFolder(folderPath, value.Codigo, value.URL)
                                                            });
                                                            that._tengoURL = false;
                                                            // oItems.oData.MaterialesAux = null;

                                                        })
                                                    } catch (error) {
                                                        console.log(error);
                                                    }
                                                }

                                                break;

                                        }

                                    }
                                    else {
                                        MessageBox.information(oResultado.statusDoc, {
                                            actions: ["Aceptar"],
                                            emphasizedAction: "Aceptar",
                                            onClose: async function (sAction) { }
                                        })

                                    }

                                    that.clearPantalla();
                                } else {
                                    sap.m.MessageToast.show("Agregue al menos un material");
                                }
                            }
                        }
                    })

                } else {
                    sap.m.MessageToast.show("Se superó valor máximo (1000)");
                }


            },

            onSelectionChange: function (oEvent) {

                var sPath = oEvent.getSource().getBindingContext("returnsModel").sPath
                var reason = oEvent.getParameters().selectedItem.getKey();

                const selectedIndex = sPath.slice(-1)[0];


                var dataModel = this.getOwnerComponent().getModel("returnsModel").getData().Materiales[selectedIndex]
                dataModel.MoveReas = reason
                this.getOwnerComponent().getModel("returnsModel").refresh();

            },

            createMaterialDocument: async function (jsonDatos) {

                return new Promise(async (resolve, reject) => {
                    try {
                        var res = this.getOwnerComponent().getModel("serviceModel").create("/createDocumentsHeader", jsonDatos, {
                            success: function (oData, response) {
                                sap.ui.core.BusyIndicator.hide(0);
                                console.log(oData);
                                resolve(oData);
                            },
                            error: function (oError) {
                                var errorRes = JSON.parse(oError.responseText);
                                sap.m.MessageBox.error(errorRes.error.message.value);
                                sap.ui.core.BusyIndicator.hide(0);
                                reject(oError);
                            }
                        });
                    } catch (err) {
                        reject(err)
                    }
                });
            },

            onUploadPhoto: async function (oEvent) {
                const id = oEvent.getSource().getBindingContext("dataModel").sPath.split('/')[2];
                this._oCameraFragment = await this._initFragment(
                    "ar.ledesma.fiori.mm.panioles.entregas.view.fragments.Camera");

                const htmlModel = this.getOwnerComponent().getModel("htmlModel");
                let htmlCode = `<html>
                <head>
                  <style>
                    #cellphone-camera {
                      width: 100%; /* Puedes ajustar el ancho deseado */
                      height: auto; /* Autoajusta la altura de acuerdo al ancho */
                      pointer-events: none;
                    }
              
                    /* Estilo para ocultar el DIV siempre */
                    #cellphone-image-container {
                      display: none;
                    }
                  </style>
                </head>
                <body>
                  <div>
                    <video id="cellphone-camera" autoplay loop muted webkit-playsinline playsinline></video>
                    <div id="cellphone-image-container"></div>
                  </div>
     
              
               
            
                </body>
              </html>`
                htmlModel.setProperty("/takeNewPhoto", htmlCode)
                htmlModel.setProperty("/takeNewPhotoVisible", true)
                htmlModel.setProperty("/takenPhotoVisible", false)
                htmlModel.setProperty("/retakePhoto", false)
                htmlModel.setProperty("/id", id)
                // mainModel.setSizeLimit("200000");
                this._oCameraFragment.setModel(htmlModel, "htmlModel");
                this._oCameraFragment.open();

                this.startCellphoneCamera();
                // var id = oEvent.getSource().getBindingContext("dataModel").sPath.split('/')[2];

                // var aMateriales = this.getOwnerComponent().getModel("dataModel").getProperty("/Materiales");

                // aMateriales[id].Imagen = true;

                // const sPath = sap.ui.require.toUrl( aMateriales[id].URL );
                // // const oModel = new JSONModel({ imagePath: sPath });
                // // this.getView().setModel(oModel, "view");

                // aMateriales[id].URL = sPath;

                // this.getOwnerComponent().setModel(new JSONModel
                //     ({
                //         "Materiales":  aMateriales
                //     }), "dataModel");
            },

            captureCellphoneCameraImage: async function () {
                const cellphoneCameraVideo = document.getElementById('cellphone-camera');
                const canvas = document.createElement('canvas');
                canvas.width = cellphoneCameraVideo.videoWidth;
                canvas.height = cellphoneCameraVideo.videoHeight;
                canvas.getContext('2d').drawImage(cellphoneCameraVideo, 0, 0);
                const imgData = canvas.toDataURL('image/png');

                // Agregar la imagen al DIV (aunque esté oculto visualmente)
                const imageContainer = document.getElementById('cellphone-image-container');
                const imgElement = document.createElement('img');
                imgElement.src = imgData;
                imageContainer.appendChild(imgElement);
            },

            startCellphoneCamera: async function () {
                try {
                    let cellphoneCameraStream;
                    const constraints = { video: { facingMode: 'environment' } };
                    cellphoneCameraStream = await navigator.mediaDevices.getUserMedia(constraints);
                    const cellphoneCameraVideo = document.getElementById('cellphone-camera');
                    cellphoneCameraVideo.srcObject = cellphoneCameraStream;
                } catch (error) {
                    console.error('Error accessing cellphone camera:', error);
                }
            },

            onComment: async function (oEvent, TipoEjecucion) {


                if (TipoEjecucion === 'R') {
                    this.sPathComment = oEvent.getSource().getBindingContext("returnsModel").sPath
                    this.modelString = "returnsModel"
                } else {
                    this.sPathComment = oEvent.getSource().getBindingContext("dataModel").sPath
                    this.modelString = "dataModel"
                }



                if (!this.oCommentFragment) {
                    this.oCommentFragment = await this._initFragment("ar.ledesma.fiori.mm.panioles.entregas.view.fragments.Comment");
                    this.oCommentFragment.setModel(this.getOwnerComponent().getModel("serviceModel"), "serviceModel");

                }
                debugger;
                const selectedIndex = this.sPathComment.slice(-1)[0];
                var dataModel = this.getOwnerComponent().getModel(this.modelString).getData().Materiales[selectedIndex]

                sap.ui.getCore().byId("idTextArea").setValue(dataModel.Comentario);

                this.oCommentFragment.open();
            },
            onLogOut: async function () {
                var that = this;
                MessageBox.confirm("¿Desea desloguearse?", {
                    actions: ["Aceptar", "Cancelar"],
                    emphasizedAction: "Aceptar",
                    onClose: async function (sAction) {
                        if (sAction === 'Aceptar') {
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


                            var oRouter = that.getOwnerComponent().getRouter();
                            oRouter.navTo("login");


                        }

                    }
                });



            },

            onReturnCode: function () {

                // this.getOwnerComponent().setModel(new JSONModel
                //     ({ "Materiales": []
                //     [{ "Descripcion": "Llave con descripcion de 35 digitos", "Codigo": '10001', "Cantidad": 2, "Imagen": false, "Comentario": 'Foto y Observ ingresados', "State": "Success", "URL": "/img/imgPico.png" },
                //      { "Descripcion": "Palanca", "Codigo": '10002', "Cantidad": 1, "Imagen": false, "Comentario": 'Foto ingresada', "State": "Warning", "URL": ""},
                //      { "Descripcion": "Material con descripcion de 40 digitos ", "Codigo": '10003', "Cantidad": 1, "Imagen": false, "Comentario": 'Sin informacion', "State": "Error", "URL": "/img/imgMartillo.png" }]
                //   }), "returnDataModel");

                this.getView().byId("demo-list2").setVisible(true);

                var aModel =
                    [{ "Descripcion": "Llave con descripcion de 35 digitos", "Codigo": '10001', "Cantidad": 2, "CantidadDevuelta": 2, "Return": true, "Comentario": 'Foto y Observ ingresados', "State": "Success", "URL": "./img/imgPico.png", "Comentario": true },
                    { "Descripcion": "Palanca", "Codigo": '10002', "Cantidad": 1, "CantidadDevuelta": 1, "Return": true, "Comentario": 'Foto ingresada', "State": "Warning", "URL": "./img/imgPalanca.png", "Comentario": false },
                    { "Descripcion": "Material con descripcion de 40 digitos ", "Codigo": '10003', "Cantidad": 1, "CantidadDevuelta": 1, "Return": true, "Comentario": 'Sin informacion', "State": "Error", "URL": "./img/imgMartillo.png", "Comentario": false }]
                    ;

                this.getOwnerComponent().setModel(new JSONModel
                    ({
                        "Materiales": aModel
                    }), "returnsModel");

            },
            validateInputs: function (oEvent) {
                // oEvent.getSource().setValueState("Error");
                // oEvent.getSource().setValueStateText("");
            },
            _addPhoto: async function (oEvent) {
                const htmlModel = this.getOwnerComponent().getModel("htmlModel").getData();
                const mainModel = this.getOwnerComponent().getModel("dataModel")
                var aMateriales = mainModel.getProperty("/Materiales");

                this._tengoURL = true;

                aMateriales[htmlModel.id].URL = htmlModel.takenPhoto;
                aMateriales[htmlModel.id].Imagen = true
                mainModel.refresh()
                console.log(aMateriales)

                // const response = await this.oDMS.createFolder("testdeui5", "root")
                //  console.log(response)

                // const response = await this.oDMS.uploadImageToFolder("root/carpetaprueba", "testdesdeui5", htmlModel.takenPhoto)
                // console.log(response)

                this._onClose()
            },
            _onClose: function (oEvent) {
                const htmlModel = this.getOwnerComponent().getModel("htmlModel");
                htmlModel.setProperty("/takeNewPhoto", "")
                this._oCameraFragment.close()
                if (this._oCameraFragment) {
                    this._oCameraFragment.destroy();
                    this._oCameraFragment = null;
                }
            },
            _takePhoto: function () {
                //const scriptElement = document.getElementById('myscript');
                //const scriptContent = scriptElement.textContent;
                // eval(scriptContent);
                this.captureCellphoneCameraImage();
                const imageContainer = document.getElementById("cellphone-image-container");
                const imgElement = imageContainer.querySelector("img");
                const srcValue = imgElement.src;
                // console.log(srcValue);
                imageContainer.removeChild(imgElement);
                this._showTakenPhoto(srcValue)
            },
            _retakePhoto: function () {
                const htmlModel = this.getOwnerComponent().getModel("htmlModel");
                htmlModel.setProperty("/takeNewPhotoVisible", true)
                htmlModel.setProperty("/takenPhotoVisible", false)
                htmlModel.setProperty("/retakePhoto", false)
                htmlModel.setProperty("/takenPhoto", "")
                htmlModel.refresh()
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
            _showTakenPhoto: function (imgContent) {
                const htmlModel = this.getOwnerComponent().getModel("htmlModel");
                htmlModel.setProperty("/takenPhoto", imgContent)
                htmlModel.setProperty("/takeNewPhotoVisible", false)
                htmlModel.setProperty("/takenPhotoVisible", true)
                htmlModel.setProperty("/retakePhoto", true)
                htmlModel.refresh()
            },

            onCancelarCommentario: function () {
                this.oCommentFragment.close();
            },

            onGuardarCommentario: function (oEvent) {

                var sPath = this.sPathComment
                var modelString = this.modelString
                var comment = sap.ui.getCore().byId("idTextArea").getValue();
                const selectedIndex = sPath.slice(-1)[0];



                var dataModel = this.getOwnerComponent().getModel(modelString).getData().Materiales[selectedIndex]
                dataModel.Comentario = comment
                if (comment !== '') {
                    dataModel.Comment = true;
                } else {
                    dataModel.Comment = false;
                }

                this.getOwnerComponent().getModel(modelString).refresh();

                this.oCommentFragment.close();
                //sap.ui.getCore().byId("idTextArea").setValue("");

            },

            onPressImage: function (oEvent) {
                const oImage = oEvent.getSource();
                const oDialog = new Dialog({
                    title: "Imagen Ampliada",
                    content: new Image({
                        src: oImage.getSrc(),
                        width: "100%", // Ajusta el tamaño de la imagen ampliada según tus necesidades
                        height: "auto"
                    }),
                    endButton: new sap.m.Button({
                        text: "Cerrar",
                        press: function () {
                            oDialog.close();
                        }
                    })
                });

                oDialog.open();
            }
        });
    });
