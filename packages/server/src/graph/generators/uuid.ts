import { v4 } from "uuid"
import { GraphGenerator } from "."

export const uuidMiddleware : GraphGenerator = {
    directiveName: 'uuid',
    actions: {
        create: (type, field) => {
            console.log("UUID ACTION")
            if(field) return field;
            return v4()
        }, 
       
    }
}