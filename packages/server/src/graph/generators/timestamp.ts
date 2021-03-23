import { GraphGenerator } from ".";

export const timestampMiddleware : GraphGenerator = {
    directiveName: 'timestamp',
    actions: {
        create: (type, field) => {
            if(field) return new Date(field).getTime();
            return new Date().getTime()
        }
    }
}