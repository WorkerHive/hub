
export const CREATE_SERVER = (name: string, server: {host: string, port: number, database: string}) => `
    CREATE SERVER ${name}
        FOREIGN DATA WRAPPER tds_fdw
        OPTIONS (servername '${server.host}', port '${server.port}', database '${server.database}');
`

export const CREATE_USER = (user: string, server: string, username: string, password: string) => `
    CREATE USER MAPPING FOR ${user}
        SERVER ${server}
        OPTIONS (username '${username}', password '${password}'); 
`

export const IMPORT_SERVER = (name: string) => `
    CREATE SCHEMA IF NOT EXISTS ${name};
    IMPORT FOREIGN SCHEMA dbo
        FROM SERVER ${name} 
        INTO ${name};
`