import { DirectiveLocation, GraphQLBoolean, GraphQLDirective, GraphQLSchema } from "graphql";
import { SchemaComposer, schemaComposer } from "graphql-compose";
import { Schema } from "inspector";
import TypeRegistry from "../registry/type";
import { convertInput, getTypesWithFieldDirective, objectValues } from "../utils";

export const directiveName = "input";

export const directive : GraphQLDirective = new GraphQLDirective({
    name: directiveName,
    description: "Field is a component of it's sibling input type",
    locations: [DirectiveLocation.FIELD_DEFINITION],
    args: {
        ref: {
            type: GraphQLBoolean,
            description: "input is a reference to type",
            defaultValue: false
        },
        required: {
            type: GraphQLBoolean,
            description: "required for input type of same name",
            defaultValue: false
        }
    }
})

export function transform(composer: SchemaComposer<any>, typeRegistry: TypeRegistry) : GraphQLSchema {
    
    schemaComposer.merge(composer)

 

    const types = getTypesWithFieldDirective(schemaComposer, directiveName)

    let outputTypes = types.map(inputType => {
        let otc = schemaComposer.getOTC(inputType.name)
        
        let inputFields = []
        for(var k in inputType.fields){
            let field = Object.assign({}, inputType.fields[k])
            field.name = k;
            inputFields.push(field)
        }
        
        inputFields = inputFields.filter(field => otc.getFieldExtensions(field.name).directives?.map((x) => x.name).indexOf(directiveName) > -1);
        
        let inputFieldObj = {};
        inputFields.forEach(f => {
            const directives = f.directives.map((x: any) => {
                const args = {};
                (x.arguments || []).forEach((y: any) => {
                    args[y.name.value] = y.value.value;
                })
                return {
                    name: x.name.value,
                    args: args
                }
            })
            const inputDirective = directives.filter((a: any) => a.name == 'input')[0]
            inputFieldObj[f.name] = convertInput(f.type, inputDirective.args);
          
        })

        return composer.createInputTC({
            name: `${inputType.name}Input`,
            fields:{
                ...inputFieldObj
            }
        })
//        typeRegistry.registerInputType(`${inputType.name}Input`, {id: 'ID'})
    })
   

    //schemaComposer.buildSchema()
    return schemaComposer.buildSchema();
}


