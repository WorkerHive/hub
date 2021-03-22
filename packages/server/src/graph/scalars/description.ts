import { GraphQLScalarType, Kind } from "graphql";

export const DescriptionScalar : GraphQLScalarType = new GraphQLScalarType({
    name: 'Description',
    description: 'Extra string type for form-building multiline text',
    parseValue(value){
        return value;
    },
    serialize(value){
        return value;
    },
    parseLiteral(ast){
        if(ast.kind == Kind.STRING){
            return ast.value;
        }
        return null;
    }
})