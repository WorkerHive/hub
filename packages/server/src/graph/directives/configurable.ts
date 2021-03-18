import { DirectiveLocation, GraphQLBoolean, GraphQLDirective } from "graphql";
import { SchemaComposer } from "graphql-compose";
import TypeRegistry, { Type } from "../registry/type";

export const directive = new GraphQLDirective({
    name: 'configurable',
    description: "Type input & ouput flow user configurable",
    locations: [DirectiveLocation.OBJECT],
})

export const transform = (composer: SchemaComposer<any>, typeRegistry: TypeRegistry) => {
      console.log(new Type(composer.getOTC('Contact')).def.map((x) => x.directives))

  return composer;
}
