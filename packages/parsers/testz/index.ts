import {MSContactCard} from '../src/ms-contact'

let xml = `
<?xml version="1.0" encoding="UTF-8"?>
<c:contact c:Version="1" xmlns:c="http://schemas.microsoft.com/Contact" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:MSP2P="http://schemas.microsoft.com/Contact/Extended/MSP2P">
	<c:Notes>2020.05.14
Good evening Peter, once again, many thanks for your support through Kurt today to look at the leak we have at St Peters College on the Epsom #2 main.
This will indeed be a tricky one, and we value your expertise.
I appreciate the timing of the work is far from desirable, just free from Covid restrictions and the forecast for the weekend looking great
Lets see what you can come up with, I appreciate the communication style you have with Andrew Deutschle, I am happy to be involved with the team, and learn at the same time.
I met Kurt with Andrew on site this morning, so I am extremely aware of the challenges
Regards
Simon
</c:Notes>
<c:CreationDate>
	2020-05-14T20:53:00Z
</c:CreationDate>
<c:Extended xsi:nil="true"/>
<c:ContactIDCollection>
	<c:ContactID c:ElementID="d6bd29b8-0495-49af-88f3-a4937d7d1ad0">
		<c:Value>f8a61471-546b-4050-846b-f4a44eda81c2</c:Value>
	</c:ContactID>
</c:ContactIDCollection>
<c:EmailAddressCollection>
	<c:EmailAddress c:ElementID="85523757-536a-4900-baff-07170e966ff2">
		<c:Type>SMTP</c:Type>
		<c:Address>Simon.Porter@water.co.nz</c:Address>
		<c:LabelCollection>
			<c:Label>Preferred</c:Label>
		</c:LabelCollection>
	</c:EmailAddress>
	<c:EmailAddress c:ElementID="3bd4ea17-939d-4291-8075-284e8996e38c" xsi:nil="true"/>
</c:EmailAddressCollection>
<c:NameCollection>
	<c:Name c:ElementID="08a161ee-a5aa-43be-8510-636e543e6b3d">
		<c:FormattedName>Simon Porter</c:FormattedName>
		<c:FamilyName>Porter</c:FamilyName>
		<c:GivenName>Simon</c:GivenName>
	</c:Name>
</c:NameCollection>
<c:PhoneNumberCollection>
	<c:PhoneNumber c:ElementID="a47c4286-3f40-44be-9068-cc0256477b73">
		<c:Number>539 7489</c:Number>
		<c:LabelCollection>
			<c:Label>Voice</c:Label>
			<c:Label>Business</c:Label>
		</c:LabelCollection>
	</c:PhoneNumber>
	<c:PhoneNumber c:ElementID="69efe08f-f9f3-4521-af6d-d170a9a3855d">\
		<c:Number>021 2807489</c:Number>
		<c:LabelCollection>
			<c:Label>Cellular</c:Label>
		</c:LabelCollection>
	</c:PhoneNumber>
</c:PhoneNumberCollection>
<c:PositionCollection>
	<c:Position c:ElementID="a8bf6c48-c4d4-4d1a-a491-037f2bc28e7f">
		<c:JobTitle>Head of Service Delivery</c:JobTitle>
		<c:Company>Watercare</c:Company>
		<c:LabelCollection>
			<c:Label>Business</c:Label>
		</c:LabelCollection>
	</c:Position>
</c:PositionCollection>
<c:PhotoCollection>
	<c:Photo c:ElementID="cb92b7ea-0c5b-4cb3-938b-98d78bd22903">
		<c:LabelCollection>
			<c:Label>UserTile</c:Label>
		</c:LabelCollection>
	</c:Photo>
</c:PhotoCollection>
</c:contact>

`

let card = new MSContactCard(xml)