import React from 'react';
import { List, ListItem, Avatar,IconButton, Popover, TextField } from '@material-ui/core';
import Done from '@material-ui/icons/Done';
import Add from '@material-ui/icons/Add';

import styled from 'styled-components'
import { Hexagon } from './hexagon';
import { textToColor } from '../../utils/color';

function hashCode(str: string) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function intToRGB(i: number){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

export interface TeamCirclesProps{
  className?: string;
  size?: number;
  members: Array<{id: string, name: string}>;
  options?: Array<{id: string, name: string}>
  onChange?: Function;
  hex?: boolean
}

export const TeamCircles : React.FC<TeamCirclesProps> = ({
  members = [],
  options,
  onChange = () => {},
  className,
  hex = true,
  size = 30
}) => {
  const [anchorEl, setAnchorEl] = React.useState<any>(null);

    return (
        <div className={className}>
            {members.map((mbr) => {
                const member = mbr
                const name = member.name.split(' ').map((x: string) => x.substring(0, 1))
                if(member) return hex ? <Hexagon size={size} color={`#${textToColor(member.name)}`}>{name}</Hexagon> : <Avatar style={{backgroundColor: '#'+ intToRGB(hashCode(member.name))}}>{name}</Avatar>
            })}
            {options && [
              <IconButton style={{width: 40, height: 40}} onClick={(e) => {
                setAnchorEl(e.currentTarget)
              }}><Add />
             </IconButton>,
              <Popover 
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'center',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'center',
                horizontal: 'left'
              }}
              keepMounted 
              open={Boolean(anchorEl)} 
              onClose={() => setAnchorEl(null)}>
                <div style={{height: '66vh', display: 'flex', flexDirection: 'column', padding: 8}}>

                <TextField margin="dense" label="Search" variant="outlined"/>
                <div style={{flex: 1, overflowY: 'auto'}}>
                <List>
                  {options.map((x : any) => {
                   let ix = members.map((x) => x.id).indexOf(x.id)
                    return (<ListItem button onClick={() => {
                   
                      if(ix > -1) members.splice(ix, 1)
                      if(ix < 0) members.push(x)
                      onChange(members)
                    }}>{ix > -1 && <Done />} {x.name}</ListItem>
                  )})}
                </List>
                </div>
              </div>
            </Popover>
              
            ]}
        </div>
    )
}

export const StyledCircles = styled(TeamCircles)`
  display: flex;

   .MuiAvatar-root:not(:first-child){
    margin-left: ${props => (props.size || 40) / 40 * -18}px;
  }

  .hex:not(:first-child){
    margin-left: ${props => (props.size || 30) / -7.5}px;
  }

  .MuiAvatar-root{
    width: ${props => props.size || 40}px;
    height: ${props => props.size || 40}px;
    font-size: ${props => ((props.size || 40) / 40) * 1.25}rem;
  }

`
