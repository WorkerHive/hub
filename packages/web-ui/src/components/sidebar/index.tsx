import React from 'react';

import {
    Typography,
    List,
    ListItem,
    IconButton,
    Divider,
    Paper
} from '@material-ui/core';

import Contacts from '@material-ui/icons/Contacts';
import AccountTree from '@material-ui/icons/AccountTree';
import Dashboard from '@material-ui/icons/Dashboard';
import CalendarToday from '@material-ui/icons/CalendarToday';
import SupervisorAccount from '@material-ui/icons/SupervisorAccount'
import BusinessCenter from '@material-ui/icons/BusinessCenter'
import Description from '@material-ui/icons/Description';
import EmojiNature from '@material-ui/icons/EmojiNature'
import Settings from '@material-ui/icons/Settings';
import LocalLibrary from '@material-ui/icons/LocalLibrary';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';

import { withRouter, matchPath } from 'react-router-dom'

import './index.css';
import { useHub } from '@workerhive/client';
import { Business, Feedback } from '@material-ui/icons';

export interface SidebarProps {
    history: any;
    match: any;
}

export function Sidebar(props : SidebarProps){
      const [client, store, isReady, err] = useHub();

  const [ minimized, setMinimized ] = React.useState(true);
    const menu = [
      /*  {
          icon: <Dashboard />,
          label: "Dashboard",
          path: ""
        },*/
        {
          mainType: 'Schedule',
          icon: <img src="/assets/calendar1.svg" />, 
          label: "Calendar",
          path: ""
        },
        {
          mainType: 'Project',
          icon: <img src="/assets/project1.svg" />,
          label: "Projects",
          path: "/projects"
        },
        {
          mainType: 'TeamMember',
          icon: <img src="/assets/team.svg" />,
          label: "Team",
          path: "/team"
        },
        {
          mainType: 'Equipment',
          icon: <img src="/assets/resources1.svg" />,
          label: "Equipment",
          path: "/equipment"
        },
        {
          mainType: 'File',
          icon: <img src="/assets/files1.svg" />, 
          label: "Files",
          path: "/files"
        },
       /* {
          icon: <img src="/assets/document1.svg" />, 
          label: "Documentation",
          path: '/kb'
        },*/
        {
          mainType: 'Contact',
          icon: <Contacts />,
          label: "Contacts",
          path: "/contacts"
        },
        {
          mainType: 'ContactOrganisation',
          icon: <Business />,
          label: "Companies",
          path: '/companies'
        },
        {
          mainType: 'SiteFeedback',
          icon: <Feedback />,
          label: "Feedback",
          path: '/feedback'
        }
        /*{
          icon: <EmojiNature />,
          label: "Workflows",
          path: '/workflows'
        }*/
      ]

    const isViewOrSub = (ix: number) => {
      let urlSlug = window.location.pathname.split(props.match.url)[1];
      let index = menu.map((x) => x.path).indexOf(urlSlug)

      let paths = menu.map((x) => x.path.length > 0 && matchPath(urlSlug, {path: x.path}))
      let second_index; 
      paths.forEach((path, ix) => {
        if(path){
          second_index = ix;
        }
      })

      return index == ix || second_index == ix
    }

    return (
      <Paper className="sidebar" style={{width: minimized ? 64 : 200}} >
        <List style={{flex: 1, maxWidth: minimized ? 64 : 200, transition: 'max-width 200ms ease-in'}}> 
        <ListItem style={{position: 'relative', color: 'rgb(34, 151, 147)', padding: 12, fontSize: 20, justifyContent: 'flex-start'}}>
           <img src={'/assets/teal.png'} alt="Workhub" style={{height: 33, marginRight: minimized ? 0 : 8, marginLeft: minimized ? 0: 0}} /> 

           {!minimized && <Typography variant="h6" style={{fontWeight: 'bold'}}>Workhub</Typography>}

           <IconButton size="small" style={{backgroundColor: 'green', zIndex: 9, position: 'absolute', right: -12, bottom: -12}} onClick={() => setMinimized(!minimized)}>
              {minimized ? <ChevronRight style={{color: 'rgb(222,222,222)'}}/> : <ChevronLeft style={{color: 'rgb(222,222,222)'}} />}  
           </IconButton>
          
        </ListItem>
        <Divider />
        {menu.filter((a) => client?.canAccess(a.mainType, "read")).map((x, ix) => (
            <ListItem 
              key={ix}
              className={isViewOrSub(ix) ? 'selected menu-item': 'menu-item'}
              onClick={() => props.history.push(`${props.match.url}${x.path}`)}
              >
              <div className="menu-item__icon">
                {x.icon} 
              </div>
              {!minimized && x.label}
            </ListItem>
        ))}
        </List>
        <Divider />
        <ListItem style={{justifyContent: minimized ? 'center' : "initial"}} button onClick={() => props.history.push(`${props.match.url}/settings`)}>
            <Settings style={{marginRight: minimized ? 0 : 12}} />
            {!minimized && <Typography>Settings</Typography>}
        </ListItem>
        </Paper>
    )
}

export default withRouter(Sidebar)