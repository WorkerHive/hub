/* eslint-disable react/jsx-pascal-case */
import React from 'react'

import {
  KeyboardDatePicker,
  KeyboardTimePicker,
  KeyboardDateTimePicker
} from '@material-ui/pickers'

import {
  Dialog,
  DialogTitle,
  TextField,
  Button,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@material-ui/core'

import { isEqual } from 'lodash';


import { CRUDKV } from '../crud-kv'
import { RWTable } from '../rw-table'
import moment from 'moment'
import { Autocomplete } from '@material-ui/lab';
import { createFilterOptions } from '@material-ui/lab/Autocomplete'

const filter = createFilterOptions();

export interface MutableDialogProps {
  client: any;
  data?: Record<string, any> | any
  models?: Array<any>;
  onClose?: () => void
  onSave?: (args: { item: object }) => void;
  structure: Record<string, any>
  title: string
  prefix?: string;
  open: boolean
}

export const MutableDialog: React.FC<MutableDialogProps> = (props) => {
  const [data, setData] = React.useState<any>({})

  React.useEffect(() => {

    if (props.data && !isEqual(props.data, data)) {
      setData(props.data)
    } else if (!props.open) {
      setData({})
    }
  }, [props.data, props.open])

  const onClose = () => {
    if (props.onClose) props.onClose()
    setData({})
  }

  const onSave = () => {
    if (props.onSave) props.onSave({ item: data })
    // setData({})
  }

  const onChange = (key: string, value: any) => {
    let d: any = Object.assign({}, data)
    d[key] = value;
    setData(d)
  }

  const renderItem = (key: string, type: any): any => {
    let typeName = type.type ? type.type : type;

    let uiType = type.type ? type.type : type;

    console.log(typeName, props.models)
    if (props.models && props.models.length > 0) {
      //Transformations to make if supplied type is another ObjectType
      if (props.models.map((x: any) => x.name).indexOf(typeName) > -1) {
        type = {};
        const model = props.models.filter((x: any) => x.name == typeName)[0]
        type.key = 'id'
        type.items = model.data;
        uiType = 'Autoselect'

      } else if (props.models.map((x: any) => `[${x.name}]`).indexOf(typeName) > -1) {
        //If supplied type is an array
        type = {};
        const model = props.models.filter((x: any) => `[${x.name}]` == typeName)[0]
        type.key = 'id',
          type.items = model.data;
        type.multi = true;
        if (data[key]) {
          let keyData: any = {};
          keyData[type.key] = Array.isArray(data[key]) ? data[key].map((x: any) => x[type.key]) : data[key][type.key]
          data[key] = keyData;
        }
        uiType = 'Autoselect'
      }
    }

    switch (uiType) {
      case 'KV':
        return (
          <CRUDKV
            key={key}
            value={data[key] ? data[key][type.key] : ''}
            types={type.items}
            onChange={({ value }: any) => {
              onChange(key, value)
            }}
          />
        )
      case 'Autoselect':
        return (
          <Autocomplete
            freeSolo
            value={data[key] ? data[key][type.key].map((id : string) => {
              return type.items.find((a: any) => a.id == id)
            }) : type.multi ? [] : ''}
            
            multiple={type.multi}
            options={type.items}
            onChange={(event, newVal) => {
              Promise.all(newVal.map( async (item: any) => {
                if(item.inputValue){
//                  client.actions[`add${type}`]
                  let actionType = type.multi ? typeName.match(/\[(.*?)\]/)[1] : typeName
                  let newItem = await props.client.actions[`add${actionType}`]({name: item.inputValue})
                  console.log(type, typeName)
                  console.log("New item", item)
                  return newItem;
                }else{
                  return item
                }


              })).then((newVals) => {
                console.log("New Vals", newVals)
                onChange(key, {[type.key]: newVals.map((x: any) => x.id)})
              })

              
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);

              if (params.inputValue !== '' && filtered.map((x: any) => x.inputValue || x.name).indexOf(params.inputValue) < 0) {
                filtered.push({
                  inputValue: params.inputValue,
                  name: `Add "${params.inputValue}"`,
                });
              }

              return filtered;
            }}
            getOptionLabel={(option: any) => option.inputValue ? option.inputValue : option.name}
            renderOption={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label={uppercase(key)}
              />
            )} />
        )
      case 'Select':
        return (
          <FormControl key={key}>
            <InputLabel>{uppercase(key)}</InputLabel>
            <Select
              multiple={type.multi}
              value={data[key] ? data[key][type.key] : (type.multi) ? [] : ''}
              onChange={(event: any) => {
                console.log(key, type.key , event.target.value)
                onChange(key, { [type.key]: event.target.value })
              }}
              label={uppercase(key)}
            >
              {(Array.isArray(type.items) ? type.items : []).map((x: any, ix: number) => (
                <MenuItem key={ix} value={x[type.key]}>
                  {x.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      case 'Table':
        return (
          <RWTable
            key={key}
            items={type.items}
            value={data[key] || {}}
            onChange={({ value }: any) => {
              onChange(key, value)

            }}
          />
        )
      case 'Hash':
        return (
          <TextField
            key={key}
            label={uppercase(key)}
            type='password'
            value={data[key] || ''}
            onChange={(e) => {
              onChange(key, e.target.value)
            }}
          />
        )
      case 'String':
        return (
          <TextField
            key={key}
            value={data[key] || ''}
            onChange={(e) => {
              onChange(key, e.target.value)
            }}
            margin='dense'
            label={uppercase(key)}
          />
        )
      case 'Description':
        return (
          <TextField
            key={key}
            value={data[key] || ''}
            onChange={(e) => {
              onChange(key, e.target.value)
            }}
            rows={3}
            margin="dense"
            multiline
            label={uppercase(key)} />
        )
      case 'Password':
        return (
          <TextField
            key={key}
            value={data[key] || ''}
            onChange={(e) => {
              onChange(key, e.target.value)
            }}
            margin="dense"
            type="password"
            label={uppercase(key)} />
        )
      case 'Date':
        return (
          <KeyboardDatePicker
            key={key}
            margin="dense"
            label={uppercase(key)}
            format={"DD/MM/YYYY"}
            value={moment(data[key]) || new Date()}
            onChange={(e) => {
              onChange(key, e)
            }} />
        )
      case 'Time':
        return (
          <KeyboardTimePicker
            key={key}
            margin="dense"
            label={uppercase(key)}
            value={data[key] || new Date()}
            onChange={(e) => {
              onChange(key, e)
            }} />
        )
      case 'Datetime':
        return (
          <KeyboardDateTimePicker
            key={key}
            margin="dense"
            format={"DD/MM/YYYY hh:mma"}
            label={uppercase(key)}
            value={data[key] || new Date()}
            onChange={(e) => {
              onChange(key, e)
            }} />
        )
      default:

        return null
    }
  }

  const uppercase = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  const renderStructure = () => {
    let struct: Array<any> = []

    for (var k in props.structure) {
      struct.push(renderItem(k, props.structure[k]))
    }
    return struct
  }

  return (
    <Dialog fullWidth open={props.open} onClose={onClose}>
      <DialogTitle>{props.prefix ? props.prefix + " " : ""}{props.title}</DialogTitle>
      <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
        {renderStructure()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} color='primary' variant='contained'>
          Enter
        </Button>
      </DialogActions>
    </Dialog>
  )
}
