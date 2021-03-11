#!/usr/local/bin/node
import { access, mkdir, readFile, writeFile } from 'fs/promises'
import { constants } from 'fs';
import * as commandpost from 'commandpost';
import { WorkhiveServer } from '.';
import path from 'path';
import crypto from 'crypto'
import { config } from 'process';
import { generateKey } from '@workerhive/ipfs'
const pjson = require('../package.json');

console.log(`
8   8  8                                             8""""8                                
8   8  8 eeeee eeeee  e   e  e   e e  ee   e eeee    8      eeee eeeee  ee   e eeee eeeee  
8e  8  8 8  88 8   8  8   8  8   8 8  88   8 8       8eeeee 8    8   8  88   8 8    8   8  
88  8  8 8   8 8eee8e 8eee8e 8eee8 8e 88  e8 8eee        88 8eee 8eee8e 88  e8 8eee 8eee8e 
88  8  8 8   8 88   8 88   8 88  8 88  8  8  88      e   88 88   88   8  8  8  88   88   8 
88ee8ee8 8eee8 88   8 88   8 88  8 88  8ee8  88ee    8eee88 88ee 88   8  8ee8  88ee 88   8

Version: v${pjson.version}

`)

let root = commandpost
    .create<{}, {}>("workhub")
    .version(pjson.version, "-v", "--version")
    .option('-v', '--version', "Version")


let start = root
    .subCommand<{}, {}>("start [service]")
    .option("-c, --config <config_dir>", "config directory")
    .option("-r, --restart", "Restart service(s)")
    .action(async (opts : {config: string[], restart: boolean}, args, rest) => {
        let configDir = opts.config.length > 0 ? opts.config[0] : './config'

        await mkdir(path.join(configDir, '/keys'), {recursive: true})

        const jwtKey = path.join(configDir, '/keys/jwt')
        const ipfsKey = path.join(configDir, '/keys/ipfs')

        let jwtSecret, ipfsSecret;

        try{
            await access(jwtKey, constants.F_OK)
            jwtSecret = await readFile(jwtKey, {encoding: 'utf-8'})
        }catch(e){
            jwtSecret = crypto.randomBytes(256).toString('base64')
            await writeFile(jwtKey, jwtSecret)
        }

        try{
            await access(ipfsKey, constants.F_OK)
            ipfsSecret = await readFile(ipfsKey, {encoding: 'utf-8'})
        }catch(e){
            ipfsSecret = generateKey();
            await writeFile(ipfsKey, ipfsSecret)
        }

        console.log(`IPFS: ${ipfsSecret}`)
        console.log(`JWT: ${jwtSecret}`)
        console.log(`MQ: ${process.env.MQ_URL}`)
        console.log(`Domain: ${process.env.WORKHUB_DOMAIN}`)
        
        let server = new WorkhiveServer({
            workhubDomain: process.env.WORKHUB_DOMAIN,
            jwtSecret: jwtSecret,
            swarmKey: ipfsSecret,
            mqUrl: process.env.MQ_URL
        })
    })



commandpost.exec(root, process.argv)
    .catch(err => {
        if(err instanceof Error){
            console.error(err.stack)
        }else{
            console.error(err)
        }
        process.exit(1)
    })
    

