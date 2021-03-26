import React from 'react';

import MoreHoriz from '@material-ui/icons/MoreHoriz';
import MoreVert from '@material-ui/icons/MoreVert';

import {
    Button,
    IconButton,
    Menu,
    MenuItem,
    Typography
} from '@material-ui/core';

export interface MoreMenuItem {
  type?: string;
  icon?: any;
  label?: string;
  color?: string;
  action?: (item?: any) => void;
}

export interface MoreMenuProps {
  menu: Array<MoreMenuItem>;
  horizontal?: boolean;
  size?: "small" | "medium" | undefined;
  square?: boolean;
}

export const MoreMenu : React.FC<MoreMenuProps> = (props) => {
    const [ menuOpen, openMenu ] = React.useState<any>();

    const toggleMenu = (e : any) => {
        e.preventDefault()
        e.stopPropagation()
        openMenu(e.currentTarget)
    }

    const icon = props.horizontal ? <MoreHoriz /> : <MoreVert />

    return (
      <>
        {props.square ? (
            <Button style={{minWidth: 'unset'}} size={props.size} className="more-menu" onClick={toggleMenu}>
                {icon}
            </Button>
        ) : (<IconButton size={props.size} className="more-menu" onClick={toggleMenu}>
            {icon}
        </IconButton>)}
        <Menu open={props.menu.length > 0 && menuOpen != null} onClose={() => openMenu(null)} anchorEl={menuOpen}>
            {props.menu.map((x, ix) => {
                return (
                    <MenuItem key={ix} onClick={(e) => {
                        e.stopPropagation()
                        openMenu(null)
                        if(x.action) x.action()
                    }} style={{color: x.color || 'black'}}>
                        {x.icon}
                        <Typography style={{fontWeight: 'bold', marginLeft: 8}}>
                            {x.label}
                        </Typography>
                    </MenuItem>
                )
            })}
        </Menu>
      </>
    );
}
