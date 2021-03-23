/*
    UUID Directive to generate v4 uuid given an empty field

*/


import { compose } from "async";
import { DirectiveLocation, GraphQLDirective, GraphQLSchema } from "graphql";
import { schemaComposer, SchemaComposer } from "graphql-compose";
import TypeRegistry from "../registry/type";
import { getTypesWithFieldDirective } from "../utils";

export const directiveName = "uuid"

export const directive = new GraphQLDirective({
    name: directiveName,
    description: "Generate uuid for empty field",
    locations: [DirectiveLocation.FIELD_DEFINITION]
})

export const transform = (composer: SchemaComposer<any>, typeRegistry?: TypeRegistry) => {
    //  console.log(new Type(composer.getOTC('Contact')).def.map((x) => x.directives))
    schemaComposer.merge(composer)

    const types = getTypesWithFieldDirective(schemaComposer, directiveName)

    types.map((x) => {
        let fields = x.def.filter((a) => a.directives.filter((a) => a.name == directiveName).length > 0)
        let otc = schemaComposer.getOTC(x.name)
    
        fields.forEach((field) => {
            let config = otc.getFieldConfig(field.name)    
            console.log(config.resolve)
        })
     //   console.log("Type", x.name, fields)
    })
  //  console.log("Types with uuid field", types)
    
    return composer;
}