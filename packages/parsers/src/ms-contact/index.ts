import { parseString } from 'xml2js'


export class MSContactCard{

    private contact : any;

    public names?: Array<{
        formattedName: string,
        firstName: string,
        lastName: string
    }>

    public emails?: Array<{
        type: string,
        address: string,
        tags: Array<string>
    }>

    public phoneNumbers?: Array<{
        number: string,
        tags: Array<string>
    }>

    public positions?: Array<{
        title: string,
        company: string,
        tags: Array<string>
    }>

    public notes? : string;

    constructor(input_blob: string){
        parseString(input_blob, (err, result) => {

            this.contact = result['c:contact']

            this.names = this.contact['c:NameCollection'][0]['c:Name'].map(this.formatName.bind(this))
            

            this.notes = this.contact['c:Notes'] ? this.contact['c:Notes'][0] : ''

            this.emails = this.contact['c:EmailAddressCollection'][0]['c:EmailAddress'].filter((a: any) => a['c:Address']).map(this.formatEmail.bind(this))

            this.positions = this.contact['c:PositionCollection'][0]['c:Position'].filter((a: any) => a['c:Company'] || a['c:JobTitle']).map(this.formatPosition.bind(this))

            this.phoneNumbers = this.contact['c:PhoneNumberCollection'][0]['c:PhoneNumber'].map(this.formatPhone.bind(this));

            console.log(this)

        })
    }

    formatPosition(blob : any){
        let position = blob

        return {
            title: position['c:JobTitle'][0],
            company: position['c:Company'][0],
            tags: this.formatLabelCollection(position['c:LabelCollection'])
        }
    }

    formatEmail(blob : any){
        let email = blob;
        return {
            type: email['c:Type'][0],
            address: email['c:Address'][0],
            tags: this.formatLabelCollection(email['c:LabelCollection'])
        }
    }

    formatLabelCollection(tags : any){
        let label = tags.map((x : any) => x['c:Label'])
        return label.length > 0 ? label[0] : []
    }

    formatName(blob : any){
        let name = blob;

        return {
            firstName: name['c:GivenName'][0],
            lastName: name['c:FamilyName'][0],
            formattedName: name['c:FormattedName'][0]
        }
    }

    formatPhone(blob : any){
        console.log(blob)
        let phone = blob

        return {
            number: phone['c:Number'][0],
            tags: this.formatLabelCollection(phone['c:LabelCollection'])
        }
    }


}