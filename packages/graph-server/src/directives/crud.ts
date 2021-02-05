import { DirectiveLocation, GraphQLBoolean, GraphQLDirective, GraphQLSchema } from "graphql";
import { schemaComposer, SchemaComposer } from "graphql-compose";
import GraphContext from "../interfaces/GraphContext";
import { convertInput, getTypesWithDirective } from "../utils";

export const directiveName = "crud"

export const directive = new GraphQLDirective({
    name: directiveName,
    description: "Setup type for automated CRUD",
    locations: [DirectiveLocation.OBJECT],
})

export function transform(composer: SchemaComposer<any>) : GraphQLSchema {
    schemaComposer.merge(composer);
    
    let types = getTypesWithDirective(composer, directiveName)

    const addRealtionships = (item: any) => {
        const otc = schemaComposer.getOTC(item.name);
        const refs = item.def.filter((a) => a.directives.filter((x) => x.name == 'input' && x.args.ref).length > 0)

        refs.forEach((foreignKey) => {
            otc.addFields({
                [foreignKey.name]: {
                    type: foreignKey.type.toString(),
                    resolve: async (parent, args, context : GraphContext, info) => {
                        let arr = foreignKey.type.toString().match(/\[(.*?)\]/) != null;
                        let name = arr ? foreignKey.type.toString().match(/\[(.*?)\]/)[1] : foreignKey.type.toString();
                        
                        let query = {};
                        
                        if(parent[foreignKey.name]){
                            let queryK = Object.keys(parent[foreignKey.name])
                            queryK.forEach(k => {
                                query[k] = arr ? {$in: parent[foreignKey.name][k]} : parent[foreignKey.name][k]
                            })
                        }else {
                            query = null;
                        }


                        return await (arr) ? (query != null) ? context.connector.readAll(name, query) : [] : (query != null) ? context.connector.read(name, query) : {}
                    }
                }
            })
                              
        })
    }

    types.map((item) => {
    
            let args = {
                [item.camelName]: `${item.name}Input`
            };

            let addKey = `add${item.name}`
            let updateKey = `update${item.name}`
            let deleteKey = `delete${item.name}`
            
            let queryKey = `${item.camelName}`
            let queryAllKey = `${item.camelName}s`

            addRealtionships(item)

            schemaComposer.Mutation.addFields({
                [addKey]:{
                    type: item.name, 
                    args: {
                        ...args
                    },
                    resolve: async (parent, args, context : GraphContext) => {
                        return await context.connector.create(item.name, args[item.camelName])
                    }
                },
                [updateKey]:{
                    type: item.name, 
                    args: {
                        id: 'ID',
                        ...args,
                    },
                    resolve: async (parent, args, context : GraphContext) => {
                      
                        return await context.connector.update(item.name, {id: args['id']}, args[item.camelName])
                    }
                },
                [deleteKey]:{
                    type: 'Boolean',
                    args: {
                        id: 'ID'
                    },
                    resolve: async (parent, args, context : GraphContext) => {
                        return await context.connector.delete(item.name, {id: args['id']})
                    }
                }
            })

            schemaComposer.Query.addFields({
                [queryKey]: {
                    type: item.name, 
                    args: {
                        id: 'ID'
                    },
                    resolve: async (parent, args, context : GraphContext) => {
                        return await context.connector.read(item.name, {id: args['id']})
                    }
                },
                [queryAllKey]: {
                    type: `[${item.name}]`,
                    args: {
                        
                    },
                    resolve: async (parent, args, context : GraphContext) => {
                       // const refs = item.def.filter((a) => a.directives.filter((x) => x.name == 'input' && x.args.ref).length > 0)
              
                        let result = await context.connector.readAll(item.name)

                        return result;
                        /*return await Promise.all(result.map(async (x: any) => {
                            if(refs.length > 0){
                                //We have foreign references to check for
                                
                        
                            }
                            return x;
                        }))*/
                    }
                }
            })
        
    })

   return schemaComposer.buildSchema();
}
