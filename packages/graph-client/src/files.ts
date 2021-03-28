import postman from './postman'

const addFile = (files: File[]) => {
    let fd = new FormData();
    fd.append("file", files[0])
    postman.post('/upload', fd, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: data => {
            Math.round((100 * data.loaded) / data.total)
        }
    })
}
