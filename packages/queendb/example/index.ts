import QueenDB from '../lib'


let db = new QueenDB({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'password'
});

db.on('ready', () => {
    db.assertType(`
        type Role {
            id: ID
            name: String
            inherits: Role
            privileges: JSON
        }
    `)

    let cell = db.getCell('Role')

    if(cell){
        cell.addContents({name: "Admin", privileges: ["projects:read", "schedule:write"]}).then(() => {
            console.log("Contents added")
        })
    }else{
        console.log("Couldnt find cell")
    }

    //db.getCell('Role')?.addContents({name: 'Admin', privileges: ["projects:read", "schedule:write"]})
})
