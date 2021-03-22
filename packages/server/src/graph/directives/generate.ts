import { DirectiveLocation, GraphQLBoolean, GraphQLDirective } from "graphql";
import { SchemaComposer } from "graphql-compose";
import TypeRegistry, { Type } from "../registry/type";

export const directiveName = "generate"

export const directive = new GraphQLDirective({
    name: 'generate',
    description: "Generate value for field",
    locations: [DirectiveLocation.FIELD_DEFINITION]
})

export const transform = (composer: SchemaComposer<any>, typeRegistry: TypeRegistry) => {
    //  console.log(new Type(composer.getOTC('Contact')).def.map((x) => x.directives))

  return composer;
}
