import GraphTransport from "./interfaces/GraphTransport";
import RoleRegistry from "./registry/role";
import TypeRegistry from "./registry/type";
import EventEmitter from "./interfaces/Emitter"
import { graphql, execute, GraphQLSchema, parse, Source } from "graphql";
import { schemaComposer } from "graphql-compose";
import { GraphConnector, GraphBase, BaseGraph } from "./interfaces/GraphConnector";
import GraphContext from "./interfaces/GraphContext";
import { getTypesWithDirective } from "./utils";
import LoggerConnector from "./connectors/logger";
import BaseConnector from "./interfaces/GraphConnector";
import { merge } from "lodash";
import { directives, directiveTransforms } from './directives';
import { initialTypes } from "./initialTypes";

export {
    GraphContext,
    BaseGraph,
    BaseConnector,
    LoggerConnector
}

export default class HiveGraph extends BaseGraph{

    private initialTypes : string;
    private hotReload: boolean;

    private context : GraphContext;

    private connector : GraphConnector;

    public schema: GraphQLSchema;

    private transports : Array<GraphTransport> = [];

    public typeRegistry: TypeRegistry;

    constructor(initial: string = ``, resolvers: any, connector: GraphConnector, hotReload: boolean = false){
        super();
        this.initialTypes = initialTypes(initial)
        this.hotReload = hotReload

        this.connector = connector;

        this.typeRegistry = new TypeRegistry(this.initialTypes, resolvers);

        this.schema = this.getSchema()

        this.schemaUpdate = this.schemaUpdate.bind(this);

        this.typeRegistry.on('add', this.schemaUpdate)
        this.typeRegistry.on('remove', this.schemaUpdate)
        this.typeRegistry.on('add_fields', this.schemaUpdate)
        this.typeRegistry.on('remove_fields', this.schemaUpdate)

        this.connector.setParent(this);
        
        this.context = {connector: this.connector}

    }

    getSchema(){
        let outputSchema = schemaComposer.clone();

        let typeSchema = this.typeRegistry.schema

        directives.forEach(directive => {
            outputSchema.addDirective(directive)
        })

        directiveTransforms.forEach(transformAction => {
            outputSchema.merge(transformAction(outputSchema, this.typeRegistry))
        })

        outputSchema.merge(typeSchema);

        return outputSchema.buildSchema()
    }

    schemaUpdate(args){
         this.schema = this.getSchema();
        this.emit('schema_update', this.typeRegistry.sdl)
    }

    async executeRequest(query, variables, operationName, extraContext?){
        let result =  await execute({
            schema: this.schema,
            operationName: operationName,
            document: parse(new Source(query)),
            rootValue: this.typeRegistry.resolvers, 
            contextValue: merge(this.context, extraContext || {}),
            variableValues: variables,
        })

        return result
    }


    addType(name, def){
        this.typeRegistry.registerType(name, def)
        this.emit('type:add', name)
    }

    removeType(name){
        this.typeRegistry.deregisterType(name)
        this.emit('type:remove', name)
    }

    get typeSDL(){
        return this.typeRegistry.sdl;
    }

    addTransport(setupFn : Function){
        this.transports.push(setupFn(this.typeRegistry.sdl))
    }

    authenticate(user){

    }
    

}