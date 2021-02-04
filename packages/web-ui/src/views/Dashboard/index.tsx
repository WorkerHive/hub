import { useHub } from '@workerhive/client';
import { MuiPickersUtilsProvider} from '@material-ui/pickers'
import MomentUtils from '@date-io/moment';

import React, { Suspense, lazy } from 'react';
import { Route, Switch } from 'react-router-dom';

import Sidebar from '../../components/sidebar'
import { AdminView } from '../Admin';
import { PageEditor } from '../PageEditor';
import { TypeEditor } from '../TypeEditor';



import './index.css';


const TypeMap = lazy(() => import('./type-map'))
const Settings = lazy(() => import('../Settings')) 
const Workflows = lazy(() => import('../Workflows'))

export interface DashboardProps{
    match: any;
}

const Fallback = (props : any) => {
    return (<div>Loading {props.reason} ...</div>)
}

export const Dashboard: React.FC<DashboardProps> = (props) => {
    const [ hub, store, isReady, err ] = useHub()
    console.log(hub && Object.keys(hub!.actions).length)
    return (
        <div className="dashboard-view">
            <Sidebar />
            {hub != null && isReady ?(
                <Suspense fallback={<Fallback reason="Components"/>}>
                <div className="dashboard-body">
                    <Switch>
                        <Route path={`${props.match.url}/workflows`} exact component={Workflows} />
                        <Route path={`${props.match.url}/settings`} exact component={Settings} />
                        <Route path={`${props.match.url}/settings/type-editor/:type`} exact component={TypeEditor} />
                        <Route path={`${props.match.url}/settings/type-editor/:type/pages/:page_id`} component={PageEditor} />
                        <TypeMap />

                    </Switch>
                </div>
                </Suspense>
            ) : <Fallback reason={`Client ${isReady} ${hub}`} />}

        </div>        
    )
}