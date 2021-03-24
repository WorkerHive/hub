import React from 'react';

import Search from '@material-ui/icons/Search';
import ViewHeadline from '@material-ui/icons/ViewHeadline';
import ViewModule from '@material-ui/icons/ViewModule';

import {
    Paper,
    TextField,
    ButtonGroup,
    Button,
    Divider,
    InputAdornment,
    Table,
    TableHead,
    TableContainer,
    TableCell,
    TableRow,
    TableBody,
    TableSortLabel,
    SortDirection
} from '@material-ui/core';

import { orderBy as _orderBy } from 'lodash'

import styled from 'styled-components'
//import './index.css';

export interface SearchTableProps{
  className?: string;
  data?: Array<object>;
  columns?: Array<{
      key: string,
      label: string, 
      flex: number
    }>;
  renderItem?: (args: {item: object}) => any;
  onClick?: (args: {item: any}) => any;
  filter?: (args: {item: any, filterText: string}) => boolean;
}

export const SearchTable : React.FC<SearchTableProps> = ({
  className,
  data = [],
  columns = [],
  onClick,
  renderItem,
  filter
}) => {
    const [ order, setOrder ] = React.useState<'asc' | 'desc'>('desc')
    const [ orderBy, setOrderBy ] = React.useState<string>();
    
    const [ search, setSearch ] = React.useState('')
    
    const changeOrder = (event: any, item : {key: string, label: string, flex: number}) => {
        const isAsc = orderBy === item.key && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc')
        setOrderBy(item.key)
    }

    const orderSort = (items: any[]) => {
        if(orderBy){
            console.log("Order by", orderBy, order)
            let results = _orderBy(items, [orderBy], [order])
            console.log(results);
            return results;
        }else{
            return items;
        }
    }

    const filtration = (a: any) => {
                        if(filter && search.length > 0){
                            return filter({item: a, filterText: search})
                        }
                        return true;
                    }

    return (
        <Paper className={className}>
            <div className="options-bar">
                <TextField
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                    }}
                    label="Search"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                    }}
                    variant="outlined"
                    size="small" />
                <ButtonGroup>
                    <Button><ViewHeadline /></Button>
                    <Button><ViewModule /></Button>
                </ButtonGroup>
            </div>
            <Divider />
            <TableContainer>
            <Table stickyHeader className="grid-list">
                {columns.length > 0 && (
                    <TableHead>
                        <TableRow>
                        {columns.map((x) => (
                            <TableCell 
                                sortDirection={orderBy === x.key ? order : false} 
                                style={{width: `${x.flex * 100}%`}}>
                                <TableSortLabel
                                    active={orderBy == x.key}
                                    direction={(orderBy === x.key ? order : undefined)}
                                    onClick={(e) => changeOrder(e, x)}
                                    >
                                    {x.label}
                                    {orderBy === x.key ? (
                                        <span style={{display: 'hidden'}}>
                                            {/*order === 'desc' ? 'sorted descending' : 'sorted ascending'*/}
                                        </span>
                                    ) : null}
                                </TableSortLabel>
                            </TableCell>
                        ))}
                        </TableRow>
                    </TableHead>
                )}
                <TableBody>
                    {orderSort(data).filter(filtration).map((x, ix) => (
                    <TableRow onClick={(e) => onClick && onClick({item: x})} className="grid-list__item" key={ix}>
                        {columns.length > 0 && !renderItem ? columns.map((col) => (
                            <TableCell>{x[col.key]}</TableCell>
                        )) : renderItem && renderItem({item: x})}
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
            </TableContainer>
        </Paper>
    )
}


export const StyledSearchTable = styled(SearchTable)`
  flex: 1 1 auto;
  margin-top: 12px;
  display: flex;
  flex-direction: column;

  .grid-header{
      display: flex;
  }
  
  .grid-list{
      overflow-y: auto;
      flex: 1;
  }

  .grid-list thead tr th{
      padding-top: 8px;
      padding-bottom: 8px;
  }

  .grid-list .grid-list__item{
      cursor: ${props => props.onClick ? 'pointer' :'inherit'}
  }

  .grid-list .grid-list__item:hover{
    background: #dfdfdf;
  }

  .options-bar{
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`
