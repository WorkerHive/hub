import * as commandpost from 'commandpost';
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

let create = commandpost
    .create<{}, {service: string}>("start [service]")
    .version(pjson.version, "-v", "--version")
    .option('-v', '--version', "Version")
    .option("-r", "--restart", "Restart service(s)")
    .action((opts, args, rest) => {
        console.log(opts, args, rest)
    })

commandpost.exec(create, process.argv)
    .catch(err => {
        if(err instanceof Error){
            console.error(err.stack)
        }else{
            console.error(err)
        }
        process.exit(1)
    })
    

