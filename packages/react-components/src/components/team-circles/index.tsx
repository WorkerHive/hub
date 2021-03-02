import React from 'react';
import { List, ListItem, Avatar,IconButton, Popover, TextField } from '@material-ui/core';
import { Done, Add } from '@material-ui/icons'
import styled from 'styled-components'

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
  members: Array<{id: string, name: string}>;
  options?: Array<{id: string, name: string}>
  onChange?: Function;
}

export const TeamCircles : React.FC<TeamCirclesProps> = ({
  members = [],
  options,
  onChange = () => {},
  className
}) => {
  const [anchorEl, setAnchorEl] = React.useState<any>(null);

    return (
        <div className={className}>
            {members.map((mbr) => {
                const member = mbr
                if(member) return <Avatar style={{backgroundColor: '#'+ intToRGB(hashCode(member.name))}}>{member.name.split(' ').map((x: string) => x.substring(0, 1))}</Avatar>
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
    margin-left: -18px;
  }

`
