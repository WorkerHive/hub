import { useRealtime, WorkhubClient } from "@workerhive/client";
import { WorkhubFS } from "@workerhive/ipfs";
import { CID } from 'ipfs-core';
import { FileDrop, FileBrowser, Header } from "@workerhive/react-ui";
import React from "react";
import { v4 } from "uuid";


export const FILE_VIEW = {
        path: '/dashboard/files',
        label: "Files",
        data: {
            files: {
                type: '[File]',
                query: () => {

                }
            }
        },
        layout: (sizes: any, rowHeight: number) => [
            {
                i: 'header',
                x: 0,
                y: 0,
                w: 12, 
                h: 1,
                component: (data: any) => (<Header title="Files" />)
            },
            {
                i: 'data',
                x: 0,
                y: 1,
                w: 12,
                h: (sizes.height / rowHeight) - 1,
                component: (data: any, params: any, types: any, client: any) => {
                    console.log(data)

                    const pins = client?.realtimeSync?.doc.getMap('file-pins')
                    console.log("PINS", pins.toJSON(), pins.observeDeep)

                    const [ pinState, dispatchPins ] = useRealtime(pins, (state, action) => {
                        
                        return state;
                    })


                    const [ selectedFiles, setSelectedFiles ] = React.useState<Array<any>>([]);
                    const [ uploadingState, setUploadingState ] = React.useState<Array<any>>([])

                    const [ state, dispatch ] = React.useReducer((state : any, action : any): any => {
                        let uploading = state.uploading.slice();
                        switch(action.type){
                            case 'UPLOAD_FILE':
                                uploading.push({id: action.id, filename: action.file.name, status: 'uploading'})
                                return {uploading}
                            case 'UPLOADED_FILE':
                                let upload_ix = uploading.map((x : any) => x.id).indexOf(action.id)
                                if(upload_ix > -1){
                                    uploading[upload_ix].status = 'uploaded';
                                }
                                return {uploading}
                            default: 
                                return state;
                        }
                    }, {uploading: []})

                    const uploadFile = async (file: File, id: string) => {
                        console.log("Upload File", file, id);
                        dispatch({type: 'UPLOAD_FILE', id: id, file: file})
                        let {cid} = await client?.fsLayer?.node?.add({path: file.name, content: file})
                        // addFile(file)
                        console.log("Added", cid.toString())
                        dispatch({type: 'UPLOADED_FILE', id: id, cid: cid.toString()})
                        let uploadResult = await client?.actions.addFile(file.name, cid.toString())
                       // console.log("Sync with hub", uploadResult)
                    }

                    const uploadFiles = (files: File[]) => {
                        let newIds = files.map(() => v4())

                        Promise.all(files.map((file, ix) => uploadFile(file, newIds[ix])))
                    }

                    return (
                        <FileBrowser 
                            selected={selectedFiles}
                            onSelect={({selected}) => {
                                setSelectedFiles(selected);
                            }}
                            files={data.files.map((file : any) => ({
                                ...file,
                                pinned: Object.keys(pinState).indexOf(file.cid) > -1 ? true : file.pinned
                            }))} 
                            onFileDownload={({files}) => {
                                console.log("Download files", files)
                                client?.fsLayer?.getFile(files[0].cid).then((result : any) => {
                                    console.log("Files download?", result)
                                })
                            }}
                            onUploadFiles={() => {
                                console.log("Upload files")
                            }}
                            uploading={state.uploading}
                            onFileUpload={({files}: {files: File[]}) => {
                                console.log(files);


                                uploadFiles(files)
                                /*
                                client?.fsLayer?.addFile(files[0]).then(async (cid : any) => {
                                   // let cid = data.toString();
                                    
                                   let e = await client?.fsLayer?.repo.blocks.has(new CID(cid))
                                    console.log(e)
                                    client?.actions.addFile(files[0].name, cid).then((r: any) => {
                                       console.log("Upload response", r);
                                    });

                                    console.log('Upload file', cid);
                                }) //.actions.addFile(files[0])*/
                            }} />
                )
                        }
            }
        ]
    }