import { schemaComposer, SchemaComposer }  from 'graphql-compose'
import { GraphContext } from '../../graph'
import { FlowConnector } from '.';
import QueenDb from '@workerhive/queendb';
let typeMap;


export const transform = (schema : SchemaComposer<any>, db: QueenDb) : {types: any, resolvers: any} => {

            schemaComposer.merge(schema);

  
            schemaComposer.createInputTC({
                name: 'IntegrationMapInput',
                fields: {
                    nodes: '[JSON]',
                    links: '[JSON]'
                }
            })

            schemaComposer.createInputTC({
                name: 'IntegrationStoreInput',
                fields: {
                    name: 'String',
                    type: 'StoreTypeInput',
                    host: 'String',
                    port: 'Int',
                    dbName: 'String',
                    user: 'String',
                    pass: 'String'
                }
            })


            schemaComposer.createInputTC({
                name: 'StoreTypeInput',
                fields: {
                    id: 'ID'
                }
            })

            schemaComposer.createObjectTC({
                name: 'StoreType',
                fields: {
                    id: 'ID',
                    name: 'String',
                    description: 'String'
                }
            })

            schemaComposer.createObjectTC({
                name: 'IntegrationMap',
                fields: {
                    id: 'String',
                    nodes: 'JSON',
                    links: 'JSON'
                }
            })

            db.newCell(`
                type IntegrationMap{
                    id: ID
                    nodes: JSON
                    links: JSON
                }
            `).then(() => {
                console.log("Integration Map cell should exits")
            })

            schemaComposer.createObjectTC({
                name: 'IntegrationStore',
                fields: {
                    id: 'ID',
                    name: 'String',
                    host: 'String',
                    port: 'Int',
                    user: 'String',
                    pass: 'String',
                    dbName: 'String',
                    type: 'StoreType'
                }
            })

            schemaComposer.Mutation.addFields({
                addIntegrationMap: {
                    type: 'IntegrationMap',
                    args: {
                        integrationMap: 'IntegrationMapInput'
                    },
                    resolve: async (parent, args, context : GraphContext) => {
                        return await context.connector.create('IntegrationMap', args.integrationMap)
                    }
                },
                addIntegrationStore: {
                    type: 'IntegrationStore',
                    args: {
                        integrationStore: 'IntegrationStoreInput'
                    },
                    resolve: async (parent, {integrationStore}, context : GraphContext) => {
                        /*
                   name: 'String',
                    type: 'StoreTypeInput',
                    host: 'String',
                    dbName: 'String',
                    user: 'String',
                    pass: 'String'
                        */

                        let serverResult = await (context.connector as FlowConnector).db.linkServer(integrationStore.name, {
                            host: integrationStore.host,
                            port: integrationStore.port,
                            database: integrationStore.dbName
                        } )

                        let userResult = await (context.connector as FlowConnector).db.linkUser('postgres', integrationStore.name, {name: integrationStore.user, pass: integrationStore.pass})

                        let importResult = await (context.connector as FlowConnector).db.importServer(integrationStore.name);


                        console.log(serverResult, userResult, importResult);
                        return {server: serverResult, user: userResult, import: importResult};
                //        (context.connector as FlowConnector).stores.setupStore(args.integrationStore)
                //TODO        return await context.connector.create('IntegrationStore', args.integrationStore)
                    }
                },
                updateIntegrationMap: {
                    type: 'IntegrationMap',
                    args: {
                        id: 'String',
                        integrationMap: 'IntegrationMapInput'
                    },
                    resolve: async (parent, args, context : GraphContext) => {
                        console.log(args, "update map")
                        return await context.connector.update('IntegrationMap', {id: args.id}, args.integrationMap);
                    }
                },
                updateIntegrationStore: {
                    type: 'IntegrationStore',
                    args: {
                        id: 'ID',
                        integrationStore: 'IntegrationStoreInput'
                    },
                    resolve: async (parent, args, context : GraphContext) => {
                        return await context.connector.update('IntegrationStore', {id: args.id}, args.integrationStore)
                    }
                },
                deleteIntegrationMap: {
                    type: 'Boolean',
                    args: {
                        id: 'String'
                    }, 
                    resolve: async (parent, args, context : GraphContext) => {
                        return await context.connector.delete('IntegrationMap', {id: args.id})
                    }
                },
                deleteIntegrationStore: {
                    type: 'Boolean',
                    ags: {
                        id: 'ID',
                    },
                    resolve: async (parent, args, context : GraphContext) => {
                        return await context.connector.delete('IntegrationStore', {id: args.id})
                    }
                }
            })

            schemaComposer.Query.addFields({
                storeTypes: {
                    type: '[StoreType]',
                    resolve: (parent, args, context : GraphContext) => {
                        return [
                            {id: 'mssql', name: "MS-SQL", description: "Microsoft SQL Server"}
                        ]
                    //TODO    return (context.connector as FlowConnector).stores.getTypes();
                    }
                },
                stores: {
                    type: 'JSON',
                    resolve: async (parent, args, context : GraphContext) => {
                        return await (context.connector as FlowConnector).db.getServers();
                    //TODO    return (context.connector as FlowConnector).stores.getAll();
                    }
                },
                storeBuckets: {
                    type: 'JSON',
                    args: {
                        name: 'String'
                    },
                    resolve: async (parent, args, context : GraphContext) => {
                    //TODO    return await (context.connector as FlowConnector).stores.get(args.name).getBucketGroups();
                    }
                },
                storeLayout: {
                    type: 'JSON',
                    args: {
                        storeName: 'String'
                    },
                    resolve: async (parent, args, context: GraphContext) => {
                        return await (context.connector as FlowConnector).db.getServerTables(args.storeName)
                    //TODO    return await (context.connector as FlowConnector).stores.get(args.storeName).layout();
                    }
                },
                bucketLayout: {
                    type: 'JSON',
                    args: {
                        storeName: 'String',
                        bucketName: 'String'
                    },
                    resolve: async (parent, args, context: GraphContext) => {
                        console.log(`Get bucket layout store: ${args.storeName} bucket: ${args.bucketName}`)
                        const conn : FlowConnector = (context.connector as FlowConnector)
                        return await conn.db.getTableColumns(args.storeName, args.bucketName)
                     //TODO   const store = conn.stores.stores[args.storeName.trim()];
                     //   return await store.bucketLayout(args.bucketName);
                    }
                },
                integrationMap: {
                    type: 'IntegrationMap',
                    args: {
                        id: 'String'
                    },
                    resolve: async (parent, args, context : GraphContext) => {
                        return await context.connector.read('IntegrationMap', {id: args.id})
                    }
                },
                integrationMaps: {
                    type: '[IntegrationMap]',
                    resolve: async (parent, args, context : GraphContext) => {
                        return await context.connector.readAll('IntegrationMap')
                    }
                },
                integrationStore: {
                    type: 'IntegrationStore',
                    args: {
                        name: 'String'
                    },
                    resolve: async (parent, args, context : GraphContext) => {
                        const stores : Array<any> = await (context.connector as FlowConnector).db.getServers()
                        return stores.filter((a: any) => a.name == args.name);
                    }
                },
                integrationStores: {
                    type: '[IntegrationStore]',
                    resolve: async (parent, args, context : GraphContext) => {
                        return await (context.connector as FlowConnector).db.getServers();
                    }
                }
            })

            let sdl = schemaComposer.toSDL();
            let resolvers = schemaComposer.getResolveMethods();
            return { types: sdl, resolvers: resolvers}
        }
