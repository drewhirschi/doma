import { ScaledPosition } from "react-pdf-highlighter"
import type {Database} from "./supabase"

declare global {
    type Annotation_SB = Database['public']['Tables']['annotation']['Row']
    type Contract_SB = Database['public']['Tables']['contract']['Row']
    type Project_SB = Database['public']['Tables']['project']['Row']
    type Profile_SB = Database['public']['Tables']['profile']['Row']
    type Parslet_SB = Database['public']['Tables']['parslet']['Row']
    
    
}