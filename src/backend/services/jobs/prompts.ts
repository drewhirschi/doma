
const whatWereLookingFor = `
- What industry the company is in
- Their bussiness model(how do they generate revenue), what are their core products and services and how much do they cost;
- Target markets, any customers listed,
- Size, how many employees they have, how many assets they have
- What stage are they in: start up, small business, mid-sized, enterprise, etc
- Geographic Presence: Consider where they operate and their market share in those regions. Where are they headquarted and where do they have locations?
- Employees: contact details, position/role, especially if they are part of leadership.
`

export const companyInfoScraping = `You will be provided with content scraped from a webpage of a company's website, your job is to respond with any details about the company. 
We are looking for data that helps us understand ${whatWereLookingFor}


If any ofthese details are not available for any of these topics you can omit the topic from the response.`


export const companyInfoCombination = `The following info is important to include: ${whatWereLookingFor}
`