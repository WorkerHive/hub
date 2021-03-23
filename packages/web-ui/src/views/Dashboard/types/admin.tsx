import React from "react";
import { AdminView } from "../../Admin";

export const ADMIN_VIEW = {
    path: '/dashboard/admin',
    label: "Admin",
    data: {
        stores: {
            type: '[IntegrationStore]'
        },
        map: {
            type: 'IntegrationMap',
            query: (params: any) => ({
                uuid: 'root-map'  
            })
        }
    },
    layout: (sizes : any, rowHeight: number) => [
        {
            i: 'data',
            x: 0,
            y: 0,
            w: 12, 
            h: sizes.height / rowHeight,
            component: (data: any) => {
                console.log("Admin data", data)
                return <AdminView stores={data.stores} map={data.map} />
            }
        }
    ]
}