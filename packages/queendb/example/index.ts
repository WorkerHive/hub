import QueenDB, { Nectar, Cell, Pollen } from '../';

let db = new QueenDB({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'test'
});

const teamDef = `
type TeamMember {
    id: ID
    username: String @input
    password: Hash @input 
    status: String @input
    admin: Boolean @input
    name: String @input
    email: String @input
    phoneNumber: String @input
}
`

const projectDef = `
   type Project @crud @configurable {
    id: ID
    name: String @input
    description: String @input
    start_date: Date @input
    end_date: Date @input
    status: String @input
  }
`

db.linkServer('JSIS', {
    host: '103.242.246.102',
    port: 1433,
    database: 'CPL_Jsis'
})

db.linkUser('postgres', 'JSIS', {name: 'Ross', pass: 'ross'})
/*
let pollen = new Pollen(projectDef, db.client)
let nectar = new Nectar(projectDef, {gfs: {'vw_Sched_Jobs': {id: 'JobID', name: 'JobName', start_date: 'StartDate', status: 'Status'}}}, db.client)
 
let cell = Cell.from(pollen, [nectar])

setTimeout(() => {
   
    cell.updateContents({description: 'Test Job Update procedure', end_date: new Date().toISOString}, {id: 3560, name: 'Scheduler Updates'})
    cell.getContents().then((contents) => console.log(contents))
}, 1000)
*/

//cell.updateContents({name: 'Ross Leitch', email: '8 Averton Pl'}, `id='8746'`)


/*"TeamMembers", [
    {
        name: 'id',
        type: 'varchar',
        primary: true
    },
    {
        name: 'name',
        type: 'varchar',
    },
    {
        name: 'username',
        type: 'varchar',
    },
    {
        name: 'password',
        type: 'varchar',
    }
], db.client)*/

//pollen.addColumn('role', 'varchar')

/*let cell = new Cell("TeamMembers", [
    {
        name: pollen.tableName,
        fields: [
            "username",
            "password",
            "admin",
            "status",
            "email",
            "phoneNumber"
        ]
    }, 
    {
        name: nectar.tableName,
        foreign: true,
        fields: [
            "id",
            "name"
        ]
    }
], db.client);

cell.createCell(`${pollen.tableName}.id=${nectar.tableName}.id`)
*/

//cell.updateContents({id: 8476, address: '8 Averton Pl, East tamaki', contactnumber: '02108438435'}, `name='Ross Leitch'`)

/*

db.createViewUpdater('_view', [
    {
        name: 'big_team',
        fields: [
            {name: 'id', fresh: true},
            {name: 'name', fresh: true},
            {name: 'address'},
            {name: 'group', fresh: true}
        ],
        where: [
            {name: 'id'}
        ]
    }
])
*/

/*
db.createView('_view', ["id", "name", "address"], {
    authority: 'big_team',
    ancilliary: 'team_test',
    fields: [
        {
            table: 'team_test',
            field: 'id'
        },
        {
            table: 'team_test',
            field: 'Name'
        },
        {
            table: 'big_team',
            field: 'address'
        }
    ],
    query: 'team_test.id = big_team.id'
})*/
