import { Client } from "pg";

export const getViews = async (client: Client) => {
        const views = await client.query(`
            SELECT table_name
            FROM information_schema.views
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `)
        return views.rows;
}

export const getTables = async (client: Client) => {
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;`)
        return tables.rows;
    }
