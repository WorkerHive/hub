/*
    Generator Middleware

    Roams the input arguments of a CRUD query/mutation and fills in generated values
*/

import { GraphQLResolveInfo } from "graphql";
import { schemaComposer } from "graphql-compose";
import { create } from "ipfs-core/src/utils/service";
import { flow } from "lodash";
import { v4 } from "uuid";
import { GraphContext } from "..";
import { isNativeType } from "../utils";
import { timestampMiddleware } from "./timestamp";
import { uuidMiddleware } from "./uuid";

export declare type GraphQLResolver = (parent, args, context, info?: GraphQLResolveInfo) => Promise<any>;

export declare type GraphGeneratorAction = (type: string, field: string) => any;

export interface GraphGenerator {
    directiveName: string;
    actions: {
        create?: GraphGeneratorAction,
        update?: GraphGeneratorAction
    }
}

export const applyGenerators = (resolver: GraphQLResolver, generators: Record<string, GraphGeneratorAction>) => {

    return async (parent, args = {}, context : GraphContext, info: GraphQLResolveInfo) => {
        schemaComposer.merge(info.schema)

        //Get input arguments 
        let inputArgs = info.parentType.getFields()[info.fieldName].args

        let generated = args || {}

        inputArgs.filter((a) => !isNativeType(a.type.toString())).forEach((arg) => {
            //Retrieve InputType for arg
            let argType = arg.type.toString();
            let argkey = arg.name.toString();

            let itc = schemaComposer.getITC(argType)
            let input_fields = itc.getFields()
            
            //Generate for input type fields
            for(var k in input_fields){
                let directives = itc.getFieldDirectiveNames(k).map((a) => generators[a]).filter((a) => a != null);
                if(directives.length > 0){
                    //argKey
                    if(!args[argkey]) args[argkey] = {};

                    let result = flow(directives)(argType, args[argkey][k])
                    args[argkey][k] = result;
                }
            }
            console.log(" Generator ", args)
        })
        return await resolver(parent, args, context, info)
    }
}

let createGenerators = {};
let updateGenerators = {};

export const generators = [
    timestampMiddleware,
    uuidMiddleware
]

generators.forEach((generator) => {
    if(generator.actions.create){
        createGenerators[generator.directiveName] = generator.actions.create
    }

    if(generator.actions.update){
        updateGenerators[generator.directiveName] = generator.actions.update
    }
})

export {
    updateGenerators,
    createGenerators
}

export const generatorNames = generators.map((x) => x.directiveName)
