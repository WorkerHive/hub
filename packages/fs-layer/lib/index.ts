const ENVIRONMENT = (typeof process !== 'undefined') && (process.release && process.release.name === 'node') ? 'NODE' : 'BROWSER'

if(ENVIRONMENT == "NODE"){

    if(typeof global.btoa == 'undefined'){
        global.btoa = (str) : string => {
            return Buffer.alloc(str.length, str, 'binary').toString('base64') //(str, 'binary').toString('base64')
        }
    }

    global.atob = (str) : string => {
        return Buffer.alloc(str.length, str, 'base64').toString('binary')
    }
    
}

const {fromCharCode} = String;

const encode = (uint8array : Uint8Array) => {
  const output : Array<string> = [];
  for (let i = 0, {length} = uint8array; i < length; i++)
    output.push(fromCharCode(uint8array[i]));
  return global.btoa(output.join(''));
}
const asCharCode = (c:any) => c.charCodeAt(0);

const decode = (chars : string) => Uint8Array.from(global.atob(chars), asCharCode);

const fs = require('fs')
const { generate } = require('libp2p/src/pnet')

const Repo = require('ipfs-repo'); //keep an eye on PR might be included within the week https://github.com/ipfs/js-ipfs-repo/pull/275

import LibP2P from 'libp2p'
import IPFS, { CID } from 'ipfs-core'
import { FSNode } from './fs'

interface IPFSInterface {
    repo: string;
    Swarm: Array<any>;
    Bootstrap: Array<any>;
}

export const generateKey = () => {
    let key : Uint8Array = new Uint8Array(95);
    generate(key)
    return encode(key)
}

export class  WorkhubFS {

    private key : Uint8Array = new Uint8Array(95);
    public swarmKey?: string;

    public repo?: typeof Repo;
    public node?: IPFS.IPFS;
    public libp2p?: LibP2P;

    private config: IPFSInterface;

    public version: number = 1;

    constructor(config: any = {}, swarmKey?: string){
        this.config = config;
        if(swarmKey){
            this.swarmKey = swarmKey
            this.key = decode(swarmKey).slice(0, 95)
        }

        if(ENVIRONMENT == "NODE" && !swarmKey){
            generate(this.key)
            this.swarmKey = encode(this.key)
        }

        this.init().then(() => {
            console.debug('=> IPFS Started')
        });
    }

    async start(){
        return await this.node?.start();
    }
    async stop(){
        return await this.node?.stop();
    }

    async init(){
        this.repo = new Repo(this.config.repo || 'workhub')
        const {node, libp2p} = await FSNode(this.config, this.repo, this.key)
        this.node = node;
        this.libp2p = libp2p;

        let boot = await this.node.bootstrap.list();
       // let swarm = await this.node.swarm.peers()

       /*
       this.libp2p?.peerStore.peers.forEach((peer) => {
           this.libp2p?.peerStore.delete(peer.id)
       })*/
    
        this.libp2p?.on('peer:discovery', (info) => {
            console.log("Peer found", info._idB58String)
        });

        setInterval(async () => {
            console.log(await this.node?.swarm.peers())
        }, 10* 1000);

    }

    async getFile(cid: string, tmpPath?: string) : Promise<Buffer>{
        console.log("Fetching data for", cid);
        let content = Buffer.from('')
        for await (const chunk of this.node!.cat(cid)){
            console.log("Got chunk")
            content = Buffer.concat([content, chunk])
        }
        
        if(ENVIRONMENT == "NODE" && tmpPath) fs.writeFileSync(tmpPath, content)
        return content;
    }

    async pinFile(cid: string, timeout_ms?: number){
        return await this.node?.pin.add(new CID(cid), {
            timeout: timeout_ms
        })
    }

    async addFile(file: File){
        console.log("Add file")
        console.log("Add ", file)

        const result = await this.node!.add({path: file.name, content: file})
        return result.cid.toString();
        /*
        return new Promise((resolve, reject) => {
            let fr = new FileReader();

            fr.onload = async (event) => {
                let buffer : ArrayBuffer = event.target?.result as ArrayBuffer;
                const result = await this.node!.add({path: file.name, content: buffer});
                resolve(result.cid.toString())
                console.log(result.cid.toString());
            }  
    
            fr.readAsArrayBuffer(file);
        })*/
        
   //     const result = await this.node!.add(file)
     //   return result.cid;
    }
}

