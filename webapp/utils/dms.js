sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Object, JSONModel, Filter, FilterOperator) {
    "use strict";
    return Object.extend("ar.ledesma.fiori.mm.panioles.entregas.utils.fileManager", {
        constructor: function (service, authClient, authSecret, tokenUrl, repositoryId, dmsUrl) {

            this.oServiceInstance = service
            this.repositoryId = repositoryId
            this.authClient = authClient
            this.authSecret = authSecret
            this.tokenUrl = tokenUrl
            this.dmsUrl = dmsUrl

            this.oCredentials = {
                "credentials_authClient": this.authClient,
                "credentials_authSecret": this.authSecret,
                "credentials_tokenUrl": this.tokenUrl,
                "credentials_repositoryId": this.repositoryId,
                "credentials_dmsUrl": this.dmsUrl
            }

        },
        _createFilter: function (sField, sValue) {
            let oFiltro = new sap.ui.model.Filter({
                path: sField,
                operator: FilterOperator.EQ,
                value1: sValue
            });
            return oFiltro;
        },
        getImage: function (filename, path) {
            return new Promise(async (resolve, reject) => {
                let filenameFilter = this._createFilter("filename", filename);
                let pathFilter = this._createFilter("path", path);
                let repositoryId = this._createFilter("credentials_repositoryId", this.repositoryId);
                let authClient = this._createFilter("credentials_authClient", this.authClient);
                let authSecret = this._createFilter("credentials_authSecret", this.authSecret);
                let tokenUrl = this._createFilter("credentials_tokenUrl", this.tokenUrl);
                let dmsUrl = this._createFilter("credentials_dmsUrl", this.dmsUrl);

                this.oServiceInstance.read("/getImage", {
                    filters: [filenameFilter, pathFilter, repositoryId, authClient, authSecret, tokenUrl, dmsUrl],
                    success: function (res) {
                        resolve(res)
                    },
                    error: function (err) {
                        console.log(err)
                        reject(err)
                     
                    }

                });
            });
        },
        createFolder: function (folderName, path) {
            const oPayload = { ...this.oCredentials };
            oPayload.folderName = folderName
            oPayload.path = path
            oPayload.created = false
            return new Promise(async (resolve, reject) => {
                this.oServiceInstance.create("/createFolder", oPayload, {
                    success: function (response) {
                        resolve(response)
                    },

                    error: function (err) {
                        reject(err)
                    },
                });
            });
        },
        uploadImageToFolder: function (folderPath, filename, b64Content) {
            const oPayload = { ...this.oCredentials };
            oPayload.content = b64Content
            oPayload.path = folderPath
            oPayload.name = filename
            oPayload.created = false
            return new Promise(async (resolve, reject) => {
                this.oServiceInstance.create("/uploadImage", oPayload, {
                    success: function (response) {
                        resolve(response)
                    },
                    error: function (err) {
                        reject(err)
                    },
                });
            });
        },
        getDummy: function () {
            this.oServiceInstance.read("/folders", {
                success: function (res) {
                    console.log(res)
                },
                error: function (err) {
                    console.log(err)
                }

            });
        }
    });
});