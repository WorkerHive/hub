import { DirectiveLocation, GraphQLBoolean, GraphQLDirective } from "graphql";
import { camelCase, schemaComposer, SchemaComposer } from "graphql-compose";
import { GraphQLUpload } from 'graphql-upload';
import { GraphContext } from "..";
import { getTypesWithDirective } from "../utils";
import { CID } from 'ipfs-core';
import { Type } from "../registry/type";
import { applyGenerators, createGenerators } from "../generators";
import { v4 } from "uuid";

export const directiveName = "upload";

export const directive = new GraphQLDirective({
    name: directiveName,
    description: "Type is a transformation on file upload",
    locations: [DirectiveLocation.OBJECT],
})

export const transform = (composer: SchemaComposer<any>) => {
    schemaComposer.merge(composer);
    
    schemaComposer.add(GraphQLUpload)
    console.info('=> Added Upload Scalar')

    let types = getTypesWithDirective(composer, directiveName)

    types.forEach((type) => {

        const queryKey = `${type.camelName}s`
        const addKey = `add${type.name}`
        const deleteKey = `delete${type.name}`


        schemaComposer.Query.addFields({
            [queryKey]: {
                type: `[${type.name}]`,
                resolve: async (parent, args, context : GraphContext) => {
                    return await context.connector.readAll(type.name)
                }   
            }
        })

        schemaComposer.Mutation.addFields({
            [addKey]: {
                type: type.name,
                args: {
                    cid: 'String',
                    filename: 'String',
                },
                resolve: applyGenerators(async (parent, args, context : GraphContext) => {
                    //TODO make generators run/Merge with input declarations
                    let cid = new CID(args.cid);

                    let exists = await context.fs.repo.blocks.has(cid)

                    let newFile : any = await context.connector.create(type.name, {
                        id: v4(),
                        pinned: exists,
                        filename: args.filename, 
                        cid: args.cid
                    })


                    console.log(`CID(${args.cid}) exists: ${exists}`)

                    if(!exists){
                        console.log("Queuing")
                        let queued = await context.mq.queue('ipfs-pinning', {
                            cid: args.cid,
                            id: newFile.id,
                            filename: args.filename
                        })
                    }else{
                        await context.fs.pinFile(args.cid);
                    }
        
                    return newFile
                }, createGenerators)
            },
            [deleteKey]: {
                type: type.name,
                args: {
                    id: 'ID'
                },
                resolve: async (parent, args, context : GraphContext) => {
                    //TODO delete from fsLayer
                    return await context.connector.delete(type.name, {id: args.id})
                }
            }
        })

    })
    
    console.log(new Type(schemaComposer.getOTC('Contact')).def.map((x) => x.directives))

    
    return schemaComposer.buildSchema()
}
