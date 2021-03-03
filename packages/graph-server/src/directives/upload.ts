import { DirectiveLocation, GraphQLBoolean, GraphQLDirective } from "graphql";
import { camelCase, schemaComposer, SchemaComposer } from "graphql-compose";
import { GraphQLUpload } from 'graphql-upload';
import { GraphContext } from "..";
import { getTypesWithDirective } from "../utils";
import { CID } from 'ipfs-core';

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
                resolve: async (parent, args, context : GraphContext) => {
                    //TODO add file to fsLayer
                    let cid = new CID(args.cid);
                    let exists = await context.fs.repo.blocks.has(cid)
                    console.log("File exists", exists)
                    /*const content = await context.fs.getFile(args.cid, `/tmp/${args.filename}`)
                    console.log("File contents fetched")*/
                    const pinned = await context.fs.pinFile(args.cid)
                    console.log("Pin result ", pinned);

                    exists = await context.fs.repo.blocks.has(cid)
                    console.log("File exists", exists)
                    return await context.connector.create(type.name, {filename: args.filename, cid: args.cid})
                }
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
    
    return schemaComposer.buildSchema()
}
