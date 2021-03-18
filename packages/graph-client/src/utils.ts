import { type } from "os";

const nativeTypes = [ "Int", "String", "Boolean", "Float", "ID", "JSON", "Date", "Hash", "Moniker", "Upload"];
export const isNativeType = (typeName : string) => {
    return nativeTypes.indexOf(typeName) > -1;
}

    export const cleanObject = (object: any, definition: any) => {
        let returnObject : any = {};
        definition.forEach((field : any) => {
            console.log("Clean field", field, object[field.name])
            if(object[field.name] && field.directives.map((x: {name: string}) => x.name).indexOf('input') > -1) returnObject[field.name] = object[field.name];
        })
        return Object.assign({}, returnObject);
    }


export const rawType = (typeName: string) => {
    let type : string = typeName;
    let matchName = typeName.match(/\[(.*?)\]/);
    if(matchName != null){
        type = matchName[1]; 
    }
    return type;
}