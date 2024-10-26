import type { Database } from "./supabase";

declare global {
  type Profile_SB = Database["public"]["Tables"]["profile"]["Row"];
  type Report_SB = Database["public"]["Tables"]["reports"]["Row"];
  type ReportSection_SB = Database["public"]["Tables"]["report_sections"]["Row"];
  type ReportView_SB = Database["public"]["Tables"]["report_views"]["Row"];
  type SearchResult_SB = Database["public"]["Tables"]["search_result"]["Row"];
  type IBProject_SB = Database["public"]["Tables"]["ib_projects"]["Row"];
  type CompanyProfile_SB = Database["public"]["Tables"]["company_profile"]["Row"];
  type CompanyLogo_SB = Database["public"]["Tables"]["cmp_logos"]["Row"];
  type LinkedInProfile_SB = Database["public"]["Tables"]["li_profile"]["Row"];
  type MaArticle_SB = Database["public"]["Tables"]["ma_articles"]["Row"];
  type MaTransaction_SB = Database["public"]["Tables"]["ma_transaction"]["Row"];

  interface Window {
    fbq: any;
  }
}
