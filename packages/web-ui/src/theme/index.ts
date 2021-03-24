import { createMuiTheme } from '@material-ui/core/styles';

export default createMuiTheme({
    palette: {
        type: 'dark',
        background: {
            paper: '#0b7272',

        },
        info: {
            main: '#e4bc71',
            dark: '#e4bc71'
        }
    },
    overrides: {
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