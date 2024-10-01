import { redirect } from "next/navigation";

interface IpageProps {}

export default async function Page({
  params,
  searchParams,
}: {
  params: { projectId: string; cmpId: number };
  searchParams: { query: string; page: number; cmpId: number };
}) {
  redirect("overview");
}
