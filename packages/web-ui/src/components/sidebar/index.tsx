import React from 'react';

import {
    Typography,
    List,
    ListItem,
    IconButton,
    Divider,
    Paper
} from '@material-ui/core';

import isElectron from 'is-electron'

import Settings from '@material-ui/icons/Settings';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';

import { withRouter, matchPath } from 'react-router-dom'

import './index.css';
import { useHub } from '@workerhive/client';
import { Business, Feedback } from '@material-ui/icons';

import CalendarIcon from '../../assets/calendar1.svg'
import ProjectIcon from '../../assets/project1.svg';
import TeamIcon from '../../assets/team.svg'; 
import ResourceIcon from '../../assets/resources1.svg';
import FileIcon from '../../assets/files1.svg';

import { ReactComponent as Contacts} from '../../assets/contacts.svg';

import {ReactComponent as Logo} from '../../assets/logo.svg';

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
          icon: <img src={CalendarIcon}/>, 
          label: "Calendar",
          path: ""
        },
        {
          mainType: 'Project',
          icon: <img src={ProjectIcon} />,
          label: "Projects",
          path: "/projects"
        },
        {
          mainType: 'TeamMember',
          icon: <img src={TeamIcon} />,
          label: "Team",
          path: "/team"
        },
        {
          mainType: 'Equipment',
          icon: <img src={ResourceIcon} />,
          label: "Equipment",
          path: "/equipment"
        },
        {
          mainType: 'File',
          icon: <img src={FileIcon} />, 
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
      let urlSlug = isElectron() ?  window.location.href.split(props.match.url)[1] : window.location.pathname.split(props.match.url)[1];
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
        <List className={`sidebar-list ${minimized ? 'minimized': ''}`} style={{flex: 1, maxWidth: minimized ? 64 : 200, transition: 'max-width 200ms ease-in'}}> 
        <ListItem className="sidebar-header" style={{position: 'relative', color: 'rgb(34, 151, 147)', padding: 12, fontSize: 20, justifyContent: 'flex-start'}}>
           <Logo color="#079692" style={{fill: '#079692', cursor: 'pointer', height: 33, marginLeft: minimized ? 0: 0}} onClick={() => setMinimized(!minimized)} /> 

           <Typography variant="h6" style={{fontWeight: 'bold', color: "#e4bc71", maxWidth: minimized ? 0: 200, overflow: 'hidden'}}>Workhub</Typography>

          
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