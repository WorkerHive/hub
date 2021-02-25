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
const { v4 } = require('uuid')
import IPFS, { CID } from 'ipfs'
import { P2PStack } from './p2p-stack'

interface IPFSInterface {
    repo: string;
    Swarm: Array<any>;
    Bootstrap: Array<any>;
}

export class  WorkhubFS {
    private key : Uint8Array = new Uint8Array(95);
    public swarmKey?: string;

    public node?: IPFS.IPFS;
    private config: IPFSInterface;

    public version: number = 1;

    constructor(config: any = {}, swarmKey?: string){
        this.config = config;
        if(swarmKey){
          //  this.key =  .toString();
          this.swarmKey = swarmKey
            this.key = decode(swarmKey)
        }

        if(ENVIRONMENT == "NODE" && !swarmKey){
            generate(this.key)
            this.swarmKey = encode(this.key)
            console.info('=> Swarm Key: ', this.swarmKey)
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
        console.log("Starting IPFS with Bootstrap list", this.config.Bootstrap)
        this.node = await IPFS.create({
            repo: this.config.repo || 'workhub',
            libp2p: P2PStack(this.key),
            config: {
                Bootstrap: this.config.Bootstrap || [],
                Addresses: {
                    Swarm: this.config.Swarm || [],
                },
                Discovery: {
                    webRTCStar: {Enabled: true},
                    MDNS: {Enabled: true}
                }
            },
            relay: {enabled: true, hop: {enabled: true}}
        })
    }

    async getFile(cid: string, tmpPath: string){
        let content = Buffer.from('')
        for await (const chunk of this.node!.cat(cid)){
            content = Buffer.concat([content, chunk])
        }
        
        if(ENVIRONMENT == "NODE") fs.writeFileSync(tmpPath, content)
        return content;
    }

    async pinFile(cid: string){
        return await this.node?.pin.add(new CID(cid))
    }

    async addFile(file: File){
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

