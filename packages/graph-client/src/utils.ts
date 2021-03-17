import { type } from "os";

const nativeTypes = [ "Int", "String", "Boolean", "Float", "ID", "JSON", "Date", "Hash", "Moniker", "Upload"];
export const isNativeType = (typeName : string) => {
    return nativeTypes.indexOf(typeName) > -1;
}

    export const cleanObject = (object: any, definition: any) => {
        let returnObject : any = {};
        if(object.id) delete object.id;
        definition.forEach((field : any) => {
            if(object[field.name]) returnObject[field.name] = object[field.name];
        })
        return returnObject;
    }


export const rawType = (typeName: string) => {
    let type : string = typeName;
    let matchName = typeName.match(/\[(.*?)\]/);
    if(matchName != null){
        type = matchName[1]; 
    }
    return type;
}