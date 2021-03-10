import React from 'react';
import { IconButton, List,ListItem,ListItemIcon, ListItemText, Paper, Typography } from '@material-ui/core'
import styled from 'styled-components'
import { Sync, ChevronLeft, Description, ChevronRight, CreateNewFolder, Delete, Edit, GetApp, Publish, CloudUpload, ArrowDownward, OfflinePin } from '@material-ui/icons';
import { StyledFileDrop as FileDrop } from '../file-drop';


export interface FileBrowserProps {
    files?: Array<{
        id: string,
        filename: string,
        cid: string,
        pinned: boolean,
        size?: number,
        modified?: Date
    }>;

    title?: string;
    className?: string;
    loading?: boolean;

    selected?: Array<any>;
    onSelect?: (args: {selected: Array<any>}) => void;

    onConvertFiles?: (args: {files: Array<any>}) => void;

  uploading?: Array<{filename: string, status: string}>;
  onUploadFiles?: () => void;
  onFileOpen?: (args: {target: object}) => void;
  onFileUpload?: (args: {files: File[]}) => void;
  onFileDownload?: (args: {files: Array<any>}) => void;
  onDownloadProgress?: () => void;
  onDownloadEnd?: () => void;
}


export const WorkhubFileBrowser : React.FC<FileBrowserProps> = ({
    selected = [],
    onSelect = ({selected}) => console.log("Selection", selected),
    files = [],
    className,
    uploading = [{filename: 'Test file', status: 'uploading'}, {filename: "Tester", status: 'uploading'}],
    onFileUpload = ({files}) => console.log("Dropped files", files),
    onFileDownload
}) => {

    const [ lastSelect, setLastSelect ] = React.useState<number>(-1)


    //TODO rethink
    const selectItem = (item: any, item_ix: number, event: React.MouseEvent) => {
        let shift = event.shiftKey;
        let ctrl = event.ctrlKey;
        const ix = selected.map((x: any) => x.id).indexOf(item.id) 
        let s = selected.slice()
        
        if(ctrl){
            //Ctrl selection

            if(ix > -1){
                s.splice(ix, 1)
            }else{
                setLastSelect(item_ix)
                s.push(item)
            }
        }else if(shift){
            //Shift click selection
            if(lastSelect < 0){
                setLastSelect(item_ix)
                s = [item]
            }else{
                if(item_ix < lastSelect){
                    s = files.slice(item_ix, lastSelect + 1)
                }else{
                    s = files.slice(lastSelect, item_ix + 1)
                }
            }
        }else{
            //Click selection
            
            if(s.length > 1 || ix < 0){
                s = [item]
                setLastSelect(item_ix)
            }else{
                s.splice(ix, 1)
            }
        }
        onSelect({selected:s})
    }

    const dropFiles = ({files}: {files: File[]}) => {
        console.log(files)
        onFileUpload({files});
    }

    const downloadSelected = () => {
        if(onFileDownload) onFileDownload({files: selected});
    }

    return (
        <Paper className={className}>
            <div className={"file-browser__header"}>
                <div className="header-info">
                    <ChevronLeft />
                    <ChevronRight />
                </div>
                <div className="header-actions">
                    <CreateNewFolder />
                    <Publish />
                    <div className="vert-divider" />
                    <Edit className={selected.length == 1 ? '': 'disabled'} />
                    <GetApp onClick={downloadSelected} className={selected.length > 0 ? '':'disabled'} />
                    <Delete />
                </div>
            </div>
            <FileDrop noClick onDrop={dropFiles}>
                {(dragActive : boolean) => (
                    <>
                    {dragActive && <div className="ipfs-loader">
                        <CloudUpload />
                        <span>Drop files to upload</span>    
                    </div>}
                    <List className="file-browser__list">
                        {files.map((x, ix) => (
                            <ListItem className={selected.map((x: any) => x.id).indexOf(x.id) > -1 ? 'selected': ''} button dense onClick={(e) => {
                                selectItem(x, ix, e)
                            }}>
                                <ListItemIcon style={{color: x.pinned ? 'green' : 'blue'}}>
                                    {x.pinned ? <Description /> : <Sync />}
                                </ListItemIcon>
                                <ListItemText>
                                    {x.filename}
                                </ListItemText>
                            </ListItem>
                        ))}
                    </List>
                    </>
                )}
            </FileDrop>
            {uploading.length > 0 &&

            <Paper elevation={4} className="file-upload">
                <div className="file-upload__header">
                    <Typography variant="subtitle1" style={{fontWeight: 'bold', color: 'white'}}>Uploading</Typography>
                    <IconButton size="small">
                        <ArrowDownward style={{color: 'white'}} />
                    </IconButton>
                </div>
                <List>
                    {uploading.map((upload) => (
                    <ListItem>
                        <ListItemIcon>
                            {upload.status == 'uploading' && <Sync />}
                            {upload.status == 'uploaded' && <OfflinePin />}
                        </ListItemIcon>
                        {upload.filename}
                    </ListItem>
                    ))}
                </List>
            </Paper>}
        </Paper>
    )
}

export const StyledFileBrowser = styled(WorkhubFileBrowser)`
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;

  .file-upload{
      position: absolute;
      min-width: 200px;
      max-height: 250px;
      right: 4px;
      bottom: 4px;
  }

  .file-upload__header{
      display: flex;
      align-items: center;
      padding: 4px;
      justify-content: space-between;
      background: rgb(44, 152, 240);
  }

  .file-browser__list {
      flex: 1;
      position: relative;
      overflow-y: auto;
  }

  .file-browser__list .selected{
      background: rgb(44, 152, 240);
      color: white;
  }

  .file-browser__header{
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 50px;
      border-bottom: 1px solid #dfdfdf;
  }

  .header-actions{
      display: flex;
  }

  .header-actions svg, .header-info svg{
      margin: 4px;
      padding: 4px;
      cursor: pointer;
      border-radius: 3px;
  }

  .file-browser__header svg.disabled{
      pointer-events: none;
      color: gray;
  }

  .header-actions svg:hover, .header-info svg:hover{
      background: #dfdfdf;
  }

  .vert-divider {
      border-left: 1px solid #dfdfdf;
      width: 1px;
  }

  .ipfs-loader{
      background: rgba(255, 255, 255, 0.8);
      width: 100%;
      z-index: 9;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .file-drop__inner .chonky-fileListWrapper{
    flex: 1;
  }

`
