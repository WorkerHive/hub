import crypto from 'crypto';
import { GraphQLScalarType, Kind } from "graphql";

export const TimestampScalar : GraphQLScalarType = new GraphQLScalarType({
    name: 'Timestamp',
    description: 'Auto generated timestamp',
    parseValue(value){
        console.log("Value", value)
        if(!value){
            return new Date().getTime();
        }else{
            return new Date(value).getTime();
        }
    },
    serialize(value){
        return value;
    },
    parseLiteral(ast){
        console.log("AST", ast)
        return new Date().getTime();
    }
})