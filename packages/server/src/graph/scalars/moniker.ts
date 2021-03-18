import Moniker from 'moniker';
import { GraphQLScalarType, Kind } from "graphql";

export const MonikerScalar : GraphQLScalarType = new GraphQLScalarType({
    name: 'Moniker',
    description: 'Short name fallback for string',
    parseValue(value){
        if(!value || value.length < 1){
            return Moniker.choose()
        }else{
            return value;
        }
    },
    serialize(value){
        return value;
    },
    parseLiteral(ast){
        if(ast.kind == Kind.STRING){
            if(!ast.value || ast.value.length < 1){
                return Moniker.choose(); 
            }else{
                return ast.value;
            }
        }
        return null;
    }
})