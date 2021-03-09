import React from 'react';
import { List,ListItem,ListItemIcon, ListItemText, Paper } from '@material-ui/core'
import styled from 'styled-components'
import { Sync, ChevronLeft, Description, ChevronRight, CreateNewFolder, Delete, Edit, GetApp, Publish, CloudUpload } from '@material-ui/icons';
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
    onConvertFiles?: (args: {files: Array<any>}) => void;
  onUploadFiles?: () => void;
  onFileOpen?: (args: {target: object}) => void;
  onFileUpload?: (args: {files: File[]}) => void;
  onFileDownload?: (args: {files: Array<any>}) => void;
  onDownloadProgress?: () => void;
  onDownloadEnd?: () => void;
}


export const WorkhubFileBrowser : React.FC<FileBrowserProps> = ({
    files = [],
    className,
    onFileUpload = ({files}) => console.log("Dropped files", files)
}) => {

    const [ selected, setSelected ] = React.useState<any>([])

    const selectItem = (item: any) => {
        const ix = selected.map((x: any) => x.id).indexOf(item.id) 
        let s = selected.slice()
        if(ix > -1){
            s.splice(ix, 1)
        }else{
            s.push(item)
        }
        setSelected(s)
    }

    const dropFiles = ({files}: {files: File[]}) => {
        console.log(files)
        onFileUpload({files});
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
                    <GetApp className={selected.length > 0 ? '':'disabled'} />
                    <Delete />
                </div>
            </div>
            <FileDrop onDrop={dropFiles}>
                {(dragActive : boolean) => (
                    <>
                    {dragActive && <div className="ipfs-loader">
                        <CloudUpload />
                        <span>Drop files to upload</span>    
                    </div>}
                    <List className="file-browser__list">
                        {files.map((x) => (
                            <ListItem className={selected.map((x: any) => x.id).indexOf(x.id) > -1 ? 'selected': ''} button dense onClick={() => selectItem(x)}>
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
        </Paper>
    )
}

export const StyledFileBrowser = styled(WorkhubFileBrowser)`
  display: flex;
  flex-direction: column;
  flex: 1;

  .file-browser__list {
      flex: 1;
      position: relative;
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
