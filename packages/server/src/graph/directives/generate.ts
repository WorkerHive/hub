import { DirectiveLocation, GraphQLBoolean, GraphQLDirective } from "graphql";
import { generators } from "../generators";

export const directives = generators.map((x) => {
    return new GraphQLDirective({
        name: x.directiveName,
        description: 'Generated directive for generators',
        locations: [DirectiveLocation.FIELD_DEFINITION]
    })  
}) 
