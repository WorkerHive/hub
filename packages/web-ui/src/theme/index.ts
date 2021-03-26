import { createMuiTheme } from '@material-ui/core/styles';

export default createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#e4bc71'
        },
        secondary: {
            main: '#f1682f'
        },
        background: {
            paper: '#0b7272',

        },
        info: {
            main: '#e4bc71',
            dark: '#e4bc71'
        }
    },
    overrides: {
        MuiDialog: {
            
            paper: {
                border: '5px solid #e4bc71',
                borderRadius: 12,
                backgroundColor: '#e5ddda',
                color: '#0d7272',
                '& .MuiSvgIcon-root': {
                    color: '#0d7272'
                },  
                '& .MuiCheckbox-colorPrimary': {
                    color: '#0d7272 !important'
                },
                '& .MuiButton-root': {
                    color: '#000'
                },
                '& .MuiButton-textSecondary': {
                    color: '#f1682f'
                },
                '& .MuiDivider-root': {
                    color: '#0d7272'
                },
                '& .MuiFormLabel-root':{
                    color: '#0d7272'
                },
                '& .MuiInput-underline:before': {
                    borderBottomColor: '#000'
                },
                '& .MuiInput-underline:after': {
                    borderBottomColor: '#0d7272 !important'
                },
                '& .MuiInputBase-input': {
                    color: '#0d7272'
                }
        
            }
        },
        MuiFormLabel: {
            root: {
                '&.Mui-focused': {
                    color: 'white'
                }
            }
        },
        MuiInput: {
            underline: {
                '&:after': {
                    borderBottomColor: '#e4bc71 !important'
                },
                ':after': {
                    borderBottomColor: '#e4bc71'
                }
            }
        },
        MuiInputBase: {
            root: {
                '&.Mui-focused .MuiInput-underline:after': {
                    borderBottomColor: '#e4bc71'
                },

                '&.MuiInput-underline:after': {
                    borderColor: 'green'
                },
                '&.Mui-focused fieldset': {
                    borderColor: '#e4bc71 !important'
                },
                'fieldset': {
                    borderColor: '#e4bc71'
                },
                borderColor: '#e4bc71 !important',
                color: '#fff'
            },
            input: {
                ':after': {
                    borderColor: '#e4bc71'
                }
            }
            
        },
        MuiTableCell: {
            stickyHeader: {
                backgroundColor: '#168b88',
                borderBottom: '1px solid #e4bc71'
            },
            root: {
                borderBottom: '1px solid #dfdfdf'
            }
        }
    }
})