import { EventEmitter } from "events";
import { GraphQLSchema } from "graphql";
import { schemaComposer, SchemaComposer } from "graphql-compose";
import MyEmitter, { EventKey, EventReceiver } from "./Emitter";

export interface GraphBase{
    schema: GraphQLSchema;
    getSchema() : GraphQLSchema;
}

export interface GraphConnector{

    setParent(parent: GraphBase): void;

    create(type : string, newObject: any) : Promise<object>;
    read(type : string, query: object) : Promise<object>;
    readAll(type: string, query?: object): Promise<Array<object>>;
    update(type: string, query: object, update: object) : Promise<object>; 
    delete(type: string, query: object) : Promise<boolean>;
}

export class BaseGraph extends EventEmitter implements GraphBase {

    schema: GraphQLSchema;
    
    constructor(){
        super();
    }

    getSchema(): GraphQLSchema {
        return this.schema;
    }

}


export default class BaseConnector implements GraphConnector{

    protected parent: BaseGraph;

    protected schemaFactory: SchemaComposer<any> = schemaComposer;

    constructor(){

    }

    setParent(parent: BaseGraph): void {
        this.parent = parent;
        this.parent.on('schema_update', (schema) => {
            console.info("=> Schema update")
            this.schemaFactory.merge(schema);
        })
        //this.schemaFactory.merge(this.parent.schema)
    }

    create(type: string, newObject: any): Promise<object> {
        throw new Error("Method not implemented.");
    }
    read(type: string, query: object): Promise<object> {
        throw new Error("Method not implemented.");
    }
    readAll(type: string, query: object = {}): Promise<object[]> {
        throw new Error("Method not implemented.");
    }
    update(type: string, query: object, update: object): Promise<object> {
        throw new Error("Method not implemented.");
    }
    delete(type: string, query: object): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}

