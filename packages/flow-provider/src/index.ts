import { GraphQLSchema } from 'graphql'
import { ObjectTypeComposer, SchemaComposer, schemaComposer } from 'graphql-compose';

import StoreManager from './stores';

import { MongoStore, MSSQLStore } from './stores'
import { v4 } from 'uuid'
import { BaseConnector, BaseGraph } from '@workerhive/graph';
//Replace below
import { transform as setupConfig } from './transforms/integration'
import {merge} from 'lodash';
import resolvers from './resolver-base'
import MergedAdapter from './adapters';
import FlowPath from './flow-path';
import { hydrate } from './flow-path/hydration';

import QueenDB from '@workerhive/queendb';

export class FlowConnector extends BaseConnector{

    public db: QueenDB;

    public connector: FlowConnector;

    public server: any;

    public typeDefs : any;
    public flowDefs : any;
    public userResolvers: any;

    public flowResolvers: any;

    public schema: GraphQLSchema;
    public schemaOpts: any;

    private timer: any;

    constructor(flowDefs, userResolvers){
        super();
        
        this.db = new QueenDB({
            host: process.env.QUEENDB_HOST || 'queendb',
            port: 5432,
            database: 'postgres',
            user: 'postgres',
            password: process.env.QUEENDB_PASS || 'defaultpassword'
        })

 //       this.db.rehydrate();

        this.flowDefs = flowDefs;
        this.userResolvers = userResolvers;
        this.flowResolvers = merge(resolvers, userResolvers)

      //  this.config = setupConfig(this.schemaFactory)
       // this.rehydrateFlow();
    }

    async rehydrateFlow(){

        let configurable = [];
        this.schemaFactory.types.forEach((val, key, map) => {
            if(typeof(key) === 'string' && val instanceof ObjectTypeComposer && val.getDirectiveNames().indexOf('configurable') > -1){
                configurable.push(val.toSDL())
            }
        })

        await this.db.setupTypeStore(configurable)
        const flowMap = await this.db.readCell('IntegrationMap', {id: 'root-map'})
        await this.db.rehydrate(flowMap);
        console.log("Flow Map", flowMap)
        /*
        if(this.stores.isReady){
            let flowMap : any = await this.read('IntegrationMap', {id: 'root-map'})
            this.flowDefs = hydrate(flowMap.nodes, flowMap.links);
            console.log("Rehydrated", Object.keys(this.flowDefs).length);
        }else{
            clearTimeout(this.timer)
            this.timer = setTimeout(async () => {
                //Retry rehydrateStores every 2 seconds until we can try it with the app store
                await this.rehydrateFlow()
            }, 2 * 1000)
        }
        */
    }

    getConfig(){
        //Get typedefs and resolvers for integration
        return setupConfig(this.schemaFactory, this.db)
    }

    setParent(parent : any){
        this.parent = parent;

        if(parent.typeRegistry.sdl) this.schemaFactory.addTypeDefs(parent.typeRegistry.sdl)

        this.parent.on('schema_update', (schema) => {
         this.schemaFactory = schemaComposer.clone();
         this.schemaFactory.addTypeDefs(parent.typeRegistry.sdl);
        })

//        console.log("Key type registry", this.schemaFactory.typeMapper)



        
        this.rehydrateFlow()
    }

    async create(type, object){
        return await this.db.addCellRow(type, object)
    }

    async update(type, query, update){
      
        return await this.db.updateCell(type, query, update)

    }

    async delete(type : string, query: object) : Promise<boolean> {
        let flowDef = this.flowDefs[type] || {};
        let objectType = this.schemaFactory.getOTC(type)
        return true;
    }

    async read(type, query){
        return await this.db.readCell(type, query)

    }


    async readAll(type, query: object = {}){
           return this.db.readAllCell(type, query);
    }

}


export { 
    MongoStore,
    MSSQLStore
}

