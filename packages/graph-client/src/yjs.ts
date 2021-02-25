import React from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

import 'websocket-polyfill'
import { cleanObject } from './utils';
import { YMap } from 'yjs/dist/src/internals';
import { isEqual } from 'lodash';

export function useRealtime(syncObject : Y.Array<any> | Y.Map<any>, reducer : (state: any, action: any) => any){
    const [ state, setState ] = React.useState<any>(syncObject.toJSON());

    const observer = (event: any, transaction: any) => {
        if(!isEqual(syncObject.toJSON(), state)){
            console.log("Sync Object Observer")
            setState(syncObject.toJSON())
        }
    }

    React.useEffect(() => {
        if(!isEqual(syncObject.toJSON(), state)){
            console.log("Sync Object Effect")
            setState(syncObject.toJSON());
        }

        console.log("Setting observer")
        syncObject.observeDeep(observer)

        return () => {
            console.log("Unsetting observer")
            syncObject.unobserveDeep(observer)
        }
    }, [syncObject])




    const dispatch = (action : any) => {
        setState(reducer(state, action))
    }

    return [state, dispatch];
}

export class RealtimeSync {
    public doc = new Y.Doc();

    private websocketProvider : WebsocketProvider;

    public status: string = '';

    constructor(url: string){
        this.websocketProvider = new WebsocketProvider(`wss://${url}/yjs`, 'workhub', this.doc)

        this.websocketProvider.on('status', (e : any) => {
            this.status = e.status;
        })
    }

    pushArray(arrKey: string, items: any[]){
        const arr = this.doc.getArray(arrKey)  
        arr.push(items)
    }

    getArray(key: string, model: any){
        return new RealtimeArray(this.doc.getArray(key), model)
    }

    getMap(key: string){
        return new RealtimeMap(this.doc.getMap(key))
    }
}

export class RealtimeArray {
    private array: Y.Array<any>;
    private model: any;

    constructor(yArray: Y.Array<any>, model: any){
        this.array = yArray;
        this.model = model;
    }

    push(content: any[]){
        content = content.map((x) => {
            const clean = cleanObject(x, this.model.def)
            console.log("Content", x)
            if(typeof(clean) === 'object'){
                console.log("Object", x)
                Object.keys(clean).map((key) => {
                    console.log("Object key", x, key)
                    if(clean[key] instanceof Date){
                        clean[key] = clean[key].toString();
                    }
                })
            }
            return x;
        })
        this.array.push(content)
      //  super.push(content)
    }

    toArray(){
        return this.array.toArray().map((obj) => {
            let x = cleanObject(obj, this.model.def)
            console.log("Arr obj", x)
            Object.keys(x).map((key) => {
              console.log(this.model, key)
                if(this.model && this.model.def && this.model.def.filter((a : any) => a.name == key)[0].type == "Date"){
                    x[key] = new Date(x[key])
                }
            })
            return x;
        })
    }
}


export class RealtimeMap {
    private map : YMap<any>;

    constructor(yMap: YMap<any>){
        this.map = yMap;
    }

    set(key: string, value: any){
        this.map.set(key, value);
    }

    get(key: string){
        this.map.get(key);
    }

    toJSON(){
        return this.map.toJSON();
    }

}
