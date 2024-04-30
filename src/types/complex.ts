export type FormatterWithInfo = (Formatter_SB & {
    formatted_info: FormattedInfo_SB[]
})

export type ContractWithFormattedInfo = Contract_SB & { formatted_info: FormattedInfo_SB[], project: {target:string} | null }

