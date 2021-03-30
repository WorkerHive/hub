import React from 'react';

import { Table, TableHead, TableRow, TableCell, Checkbox, TableBody, IconButton, TextField } from '@material-ui/core'
import styled from 'styled-components';
import { isEqual } from 'lodash';
import { Search, Clear } from '@material-ui/icons';

export interface SelectTableProps {
    readonly?: boolean;
    data: any[]
    onChange: any;
    selected: Array<any>;
    className?: string;
}

const BaseSelectTable: React.FC<SelectTableProps> = (props) => {

    const [search, setSearch] = React.useState<string>();
    const [ data, setData ] = React.useState(props.data);

    React.useEffect(() => {
        if(!isEqual(props.data,data)){
            setSearch(undefined)
            setData(props.data)
        }
    }, [props.data])

    const onChange = (e: React.ChangeEvent<HTMLInputElement>, item: any) => {
        let ix = props.selected.indexOf(item.id)
        let s = props.selected.slice();
        if (!e.target.checked) {
            s.splice(ix, 1)
        } else {
            s.push(item.id)
        }
        console.log(e.target.checked, s)
        props.onChange(s)
    }

    const sortFn = (a: any, b: any) => {
        if (a.name > b.name) return 1;
        if (b.name > a.name) return -1;
        return 0;
    }

    const filterFn = (a: any) => {
        if(search != undefined){
            return a.name.indexOf(search) > -1;
        }
        return true;
    }

    const allSelected = () => {
        return props.data.length > 0 && props.selected.length > 0 && isEqual(props.selected, getList().map((x) => x.id))
    }

    const selectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            props.onChange(getList().map((x) => x.id))
        } else {
            props.onChange([])
        }
    }

    const getList = () => {
        return props.data.filter(filterFn).sort(sortFn);
    }

    return (
        <Table className={props.className}>
            <TableHead style={{ height: 30, backgroundColor: '#0d7272' }}>
                <TableRow className="select-table__header" style={{ height: 30 }}>
                    <TableCell padding="checkbox">
                        <Checkbox checked={allSelected()} onChange={(e) => selectAll(e)} style={{ color: '#fff !important' }} color="secondary"></Checkbox>
                    </TableCell>
                    <TableCell padding='none' style={{paddingRight: search != undefined ? 30 : 0}}>
                        {search != undefined ? (
                            <TextField 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                size="small" 
                                placeholder="Search" 
                                fullWidth 
                                style={{color: 'white'}}/>
                        ) : "Name"}
                    </TableCell>

                    <div className="select-table__header-actions">
                        <IconButton size="small" onClick={() => setSearch(search != undefined ? undefined : '')}>
                            {search != undefined ? <Clear style={{fill: '#fff'}}/> : <Search style={{ fill: '#fff' }} />}
                        </IconButton>
                    </div>
                </TableRow>
            </TableHead>
            <TableBody>
                {getList().map((x : any, ix : number) => [
                    <TableRow key={ix} style={{height: 30 }}>
                        <TableCell padding="checkbox">
                            <Checkbox
                                color="primary"
                                disabled={props.readonly}
                                checked={props.selected.indexOf(x.id) > -1}
                                onChange={(e) => onChange(e, x)} />
                        </TableCell>
                        <TableCell style={{ color: '#000' }} padding="none">
                            {x.name}

                        </TableCell>
                    </TableRow>
                ])}
            </TableBody>

        </Table>
    )
}

export const SelectTable = styled(BaseSelectTable)`

.select-table__header{
    position: relative;
}

.select-table__header-actions{
    position: absolute;
    right: 4px;
    top: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

`