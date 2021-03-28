import gql from 'graphql-tag';
import { camelCase } from 'camel-case';
import { cleanObject, isNativeType, rawType } from '../utils';
import { WorkhubClient } from '..';

export default (models: any, client?: WorkhubClient, dispatch?: any) => {
    let actions: any = {};


    //Takes a type model and iterates over available keys, if key isn't native getFields will be called again to fill out the query fields
    const getFields = (type: any, parent?: any) => {
      
        return type.def.map((x: any) => {
            let raw = rawType(x.type);

            if (isNativeType(raw)) {
                return x.name
            } else {
                let model = models.filter((a: any) => a.name == raw)[0];

                //Recursion blocker, hopefully stops some of the circular references
                if (!parent || parent.name != raw) {
                    return `
                        ${x.name} {
                            ${getFields(model, type)}
                        }
                    `
                }
            }
        }).join(`\n`)

    }

    const setupAdd = (model: any, fields: any) => {
        actions[`add${model.name}`] = (item: any) => {
            const newObject = cleanObject(item, model.def);

            return client!.mutation(`
                    mutation Add${model.name}($input: ${model.name}Input){
                        add${model.name}(${camelCase(model.name)}: $input){
                            ${fields}
                        }
                    }
                `,
                {
                    input: newObject
                }
            ).then((r: any) => r.data[`add${model.name}`]).then((data: any) => {
                dispatch({ type: `ADD_${model.name}`, data: data })
                return data;
            })
        }
    }

    const setupDelete = (model: any, fields: any) => {
        actions[`delete${model.name}`] = (id: string) => {
            return client!.mutation(`
            mutation Delete${model.name}($id: ID){
                delete${model.name}(id: $id)
            }
        `,{
                    id: id
                }
            ).then((r: any): any => r.data[`delete${model.name}`]).then((data: any) => {
                if (data) dispatch({ type: `DELETE_${model.name}`, id: id })
                return data;
            })
        }
    }

    const setupUpdate = (model: any, fields: any) => {
        actions[`update${model.name}`] = (id: string, update: any) => {

            const updateObject = cleanObject(update, model.def)
            delete updateObject.id;

            return client!.mutation(`
            mutation Update${model.name}($id: ID, $update: ${model.name}Input){
                update${model.name}(${camelCase(model.name)}: $update, id: $id){
                    ${fields}
                }
            }
            `,{
                    id,
                    update: updateObject
                }
            ).then((r: any) => r.data[`update${model.name}`]).then((data: any) => {
                dispatch({ type: `UPDATE_${model.name}`, id: id, data: data })
                return data;
            })
        }
    }

    const setupRead = (model: any, fields: any) => {
        actions[`get${model.name}`] = (id: any, cache: boolean = true) => {
            return client!.query(`
            query Get${model.name}($id: ID){
                ${camelCase(model.name)}(id: $id) {
                    ${fields}
                }
            }
        `,
                {
                    id: id
                }
            ).then((r: any) => r.data[`${camelCase(model.name)}`]).then((data: any) => {
                dispatch({ type: `GET_${model.name}`, id: id, data: data })
                return data;
            })
        }
    }

    const setupReadAll = (model: any, fields: any) => {
        actions[`get${model.name}s`] = (cache: boolean = true) => {
            return client!.query(`
                query Get${model.name}s {
                    ${camelCase(model.name)}s {
                        ${fields}
                    }
                }
                `).then((r: any) => r.data[`${camelCase(model.name)}s`]).then((data: any) => {
                dispatch({ type: `GETS_${model.name}`, data: data })
                return data;
            })
        }
    }

    console.log(models)

    models.forEach((model: any) => {
        console.log("Setting up actions for model")

        const fields = getFields(model);

        setupAdd(model, fields)
        setupDelete(model, fields)
        setupUpdate(model, fields)
        setupReadAll(model, fields)
        setupRead(model, fields)
    })
    return actions;

}
