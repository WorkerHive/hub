import AccountTree from '@material-ui/icons/AccountTree';
import Description from '@material-ui/icons/Description'
import Settings from "@material-ui/icons/Settings";
import { Calendar, ShortcutLinks } from "@workerhive/react-ui";
import React from "react";

export const HOME_VIEW = {
    path: '/dashboard/home',
    label: 'Home',
    data: {
        schedule: {
            type: '[Schedule]'
        }
    }, 
    layout: (sizes: any, rowHeight: number) => [
        {
            i: 'shortcuts',
            x: 0,
            y: 0,
            w: 4,
            h: 2,
            component: (data: any) => (
                <ShortcutLinks 
                maxItems={4}
                links={[
                    {label: "Projects", icon:<AccountTree />},
                    {label:"Documents", icon: <Description />},
                    {label: "Settings", icon: <Settings />},
                    ]}/>
            )
        },
        {
            i: 'calendar',
            x: 0,
            y: 2,
            w: 12,
            h: sizes.height / rowHeight - 2,
            component: (data: any) => (
                <Calendar events={(data.Schedule || []).map((x: any) => ({...x, start: new Date(x.start), end: new Date(x.end)}))} />
            )
        }
    ]
}

