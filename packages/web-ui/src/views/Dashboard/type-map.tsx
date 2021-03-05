import React, { FC, ReactElement } from 'react';
import { Route } from 'react-router-dom';
import { Layout } from '../../components/layout';

import { CALENDAR_VIEW } from './types/calendar'
import { PROJECT_DRILLDOWN, PROJECT_VIEW } from './types/project';
import { EQUIPMENT_VIEW } from './types/equipment';
import { FILE_VIEW } from './types/file';
import { CONTACT_VIEW } from './types/contacts';
import { KNOWLEDGE_VIEW } from './types/knowledgebase';
import { TEAM_VIEW } from './types/team';
import { HOME_VIEW } from './types/home';
import { ADMIN_VIEW } from './types/admin';
const Types = [
    ADMIN_VIEW,
    HOME_VIEW,
   CALENDAR_VIEW,
    PROJECT_VIEW,
    PROJECT_DRILLDOWN,
    EQUIPMENT_VIEW,
    FILE_VIEW,
    CONTACT_VIEW,
    KNOWLEDGE_VIEW,
    TEAM_VIEW
]

export default (props: any) => {
    return (
        <>
            {Types.map((x, ix) => (
                <Route key={ix} path={x.path} exact render={(props) => (
                    <Layout {...props} schema={x} />
                )} />
            ))}
        </>
    )
}