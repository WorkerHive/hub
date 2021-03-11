import './window'

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket'

export class Realtime{
    private webProvider: WebsocketProvider;    
    public doc : Y.Doc;

    constructor(url: string){
        this.doc = new Y.Doc();
        this.webProvider = new WebsocketProvider(`wss://${url}/yjs`, 'yjs-hub', this.doc, {WebSocketPolyfill: require('ws')})

    }

}