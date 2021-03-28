import { WorkhubClient } from "..";
import CRUD from './crud';
import UPLOAD from './upload';
import { ModelStorage } from "../models";

export class ActionFactory {
    private client: WorkhubClient;
    private models: ModelStorage;

    private lastUpdate?: Date;

    private actions : any;

    constructor(client: WorkhubClient, models: ModelStorage, dispatch: any) {
        this.client = client;
        this.models = models;

        console.debug('Starting Action Manager with ', this.models.types?.crud)

        this.actions = CRUD(this.models.types?.crud, client, dispatch)
        this.actions = {
            ...this.actions,
            ...UPLOAD(this.models.types?.upload, client, dispatch)
        }
    }

    getFunction(func: string){
        return this.actions[func] || (() => {
            return {};
        })
    }



}