export type FormatterWithInfoAndEi = (Formatter_SB & {
    formatted_info: FormattedInfoWithEiId[]
})

export type FormattedInfoWithEiId = (FormattedInfo_SB & {
    extracted_information: {id:string}[]
})