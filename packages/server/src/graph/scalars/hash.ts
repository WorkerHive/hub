import crypto from 'crypto';
import { GraphQLScalarType, Kind } from "graphql";

const HashRegex = /\b[A-Fa-f0-9]{64}\b/

export const HashScalar : GraphQLScalarType = new GraphQLScalarType({
    name: 'Hash',
    description: 'Sha256 Hash Expressed as a Scalar',
    parseValue(value){
        if(!value.match(HashRegex)){
            return crypto.createHash('sha256').update(value).digest('hex');
        }else{
            return value;
        }
    },
    serialize(value){
        return value;
    },
    parseLiteral(ast){
        if(ast.kind == Kind.STRING){
            if(!ast.value.match(HashRegex)){
                return crypto.createHash('sha256').update(ast.value).digest('hex')
            }else{
                return ast.value;
            }
        }
        return null;
    }
})