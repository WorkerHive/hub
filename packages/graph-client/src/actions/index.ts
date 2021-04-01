import { WorkhubClient } from "..";
import CRUD from './crud';
import UPLOAD from './upload';
import { ModelStorage } from "../models";

export class ActionFactory {
    private client: WorkhubClient;
    private models: ModelStorage;

    private dispatch: any;

    private lastUpdate?: Date;

    private actions: any;

    constructor(client: WorkhubClient, models: ModelStorage, dispatch: any) {
        this.client = client;
        this.models = models;
        this.dispatch = dispatch

        console.debug('Starting Action Manager with ', this.models.types?.crud)

        this.actions = CRUD(this.models.types?.crud, client, dispatch)
        this.actions = {
            ...this.actions,
            ...UPLOAD(this.models.types?.upload, client, dispatch)
        }

        this.registerPluginFunctions()
    }

    registerPluginFunctions() {

        this.actions['getStoreTypes'] = async () => {
            let result = await this.client.query(`
                        query GetStoreTypes{
                            storeTypes {
                                id
                                name
                                description
                            }
                        }
                    `)
            this.dispatch({ type: `GETS_StoreType`, data: result.data.storeTypes })
            return result.data.storeTypes;
        }
        this.actions['getIntegrationStores'] = async () => {
            let result = await this.client.query(`
                        query GetStores {
                            integrationStores{
                                id
                                name
                                host
                                user
                                pass
                                dbName
                                type
                            }
                        }
                    `)
            this.dispatch({ type: `GETS_IntegrationStore`, data: result.data.integrationStores })
            return result.data.integrationStores;
        }
        this.actions['addStore'] = async (store: any) => {
            let result = await this.client.mutation(`
                        mutation AddStore($store: IntegrationStoreInput){
                            addIntegrationStore(integrationStore: $store){
                                id
                                name
                                host
                                user
                                pass
                                dbName
                                type
                            }
                        }
                    `, {
                store: store
            })
            this.dispatch({ type: `ADD_IntegrationStore`, data: result.data.addIntegrationStore })
            return result.data.addIntegrationStore;
        }
        this.actions['updateStore'] = async (id: string, store: any) => {
            let result = await this.client.mutation(`
                        mutation UpdateStore($id: String, $store: IntegrationStoreInput) {
                            updateIntegrationStore(id: $id, integrationStore: $store){
                                id
                                name
                                host
                                user
                                pass
                                dbName
                                type
                            }
                        }
                    `, {
                store: store,
                id: id
            })
            this.dispatch({ type: `UPDATE_IntegrationStore`, data: result.data.updateIntegrationStore, id: id })
            return result.data.updateIntegrationStore
        }
        this.actions['deleteStore'] = async (id: string) => {
            let result = await this.client.mutation(`
                        mutation DeleteStore($id: String){
                            deleteIntegrationStore(id: $id)
                        }
                    `, {
                id: id
            })
            this.dispatch({ type: `DELETE_IntegrationStore`, id: id })
            return result.data.deleteIntegrationStore;
        }
    }

    getFunction(func: string) {
        return this.actions[func] || (() => {
            return {};
        })
    }



}