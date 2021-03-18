import { directive as inputDirective, transform as inputTransform } from './input';
import { directive as uploadDirective, transform as uploadTransform } from './upload'
import { directive as crudDirective, transform as crudTransform } from './crud'
import { directive as configurableDirective, transform as configurableTransform } from './configurable'

export const directives = [ 
    inputDirective,
    uploadDirective,
    crudDirective,
    configurableDirective
]

export const directiveTransforms = [ 
    inputTransform,
    uploadTransform,
    crudTransform,
    configurableTransform
]