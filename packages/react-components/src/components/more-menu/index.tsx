import React from 'react';

import {
    MoreHoriz,
    MoreVert
} from '@material-ui/icons'

import {
    IconButton,
    Menu,
    MenuItem,
    Typography
} from '@material-ui/core';

export interface MoreMenuItem {
  icon?: any;
  label?: string;
  color?: string;
  action?: () => void;
}

export interface MoreMenuProps {
  menu: Array<MoreMenuItem>;
  horizontal?: boolean;
  size?: "small" | "medium" | undefined;
}

export const MoreMenu : React.FC<MoreMenuProps> = (props) => {
    const [ menuOpen, openMenu ] = React.useState<any>();

    const toggleMenu = (e : any) => {
        e.preventDefault()
        e.stopPropagation()
        openMenu(e.currentTarget)
    }

    return (
      <>
        <IconButton size={props.size} className="more-menu" onClick={toggleMenu}>
            {props.horizontal ? <MoreHoriz /> : <MoreVert />}
        </IconButton>
        <Menu open={props.menu.length > 0 && menuOpen != null} onClose={() => openMenu(null)} anchorEl={menuOpen}>
            {props.menu.map((x) => {
                return (
                    <MenuItem onClick={(e) => {
                        e.stopPropagation()
                        openMenu(null)
                        if(x.action) x.action()
                    }} style={{color: x.color || 'black'}}>
                        {x.icon}
                        <Typography style={{marginLeft: 8}}>
                            {x.label}
                        </Typography>
                    </MenuItem>
                )
            })}
        </Menu>
      </>
    );
}
