import type {Database} from "./supabase"

declare global {
    type Annotation_SB = Database['public']['Tables']['annotation']['Row']
    type Contract_SB = Database['public']['Tables']['contract']['Row']
    type ContractLine_SB = Database['public']['Tables']['contract_line']['Row']
    type Project_SB = Database['public']['Tables']['project']['Row']
    type Profile_SB = Database['public']['Tables']['profile']['Row']
    type Parslet_SB = Database['public']['Tables']['parslet']['Row']
    type ExtractedInformation_SB = Database['public']['Tables']['extracted_information']['Row']
    type ContractNote_SB = Database['public']['Tables']['contract_note']['Row']
    type ExtractJob_SB = Database['public']['Tables']['extract_jobs']['Row']
    type FormattedInfo_SB<T = any> = Database['public']['Tables']['formatted_info']['Row'] & {data: T}
    type Formatter_SB = Database['public']['Tables']['formatters']['Row']

    interface Window {
        fbq: any;
    }
    
}