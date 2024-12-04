import CompanyList from "./List";
import { serverClient } from "@/shared/supabase-client/server";

export default async function Page({ params }: { params: { projectId: string } }) {
  const supabase = serverClient();

  const { data: project, error } = await supabase
    .from("ib_projects")
    .select("*, model_cmp(*), company_profile!deal_comps(*) ")
    .eq("id", params.projectId)
    .single();

  const companiesGet = await supabase.rpc("proj_cmp_sim", { pid: project?.id! });

  if (error || companiesGet.error) {
    console.log(companiesGet.error);
    throw error;
  }

  return (
    <div>
      <CompanyList project={project!} companies={companiesGet.data} />
    </div>
  );
}
