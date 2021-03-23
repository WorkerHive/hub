import { DirectiveLocation, GraphQLBoolean, GraphQLDirective, GraphQLSchema } from "graphql";
import { SchemaComposer, schemaComposer } from "graphql-compose";
import { Schema } from "inspector";
import { generatorNames, generators } from "../generators";
import TypeRegistry, { Type } from "../registry/type";
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
        let generatedFields = [];

        for(var k in inputType.fields){
            let field = Object.assign({}, inputType.fields[k])
            field.name = k;
            inputFields.push(field)
        }
        
        generatedFields = inputFields.filter((field) => otc.getFieldDirectiveNames(field.name).filter((directive) => generatorNames.indexOf(directive) > -1).length > 0)


        inputFields = inputFields.filter(field => otc.getFieldExtensions(field.name).directives?.map((x) => x.name).indexOf(directiveName) > -1);
        
        let inputFieldObj = {};
        
        generatedFields.forEach((field) => {
            inputFieldObj[field.name] = {
                type: field.type,
                extensions: {
                    directives: field.directives.map((x) => ({
                            name: x.name.value,
                            args: x.args || {}
                        }))
                }
            }
        })

        console.log(inputFieldObj['pk'])

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

    })

    //console.log("Output", schemaComposer.getITC("ProjectInput").toSDL())

    return schemaComposer.buildSchema();
}


