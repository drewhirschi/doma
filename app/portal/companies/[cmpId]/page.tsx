import { redirect } from "next/navigation";

interface IpageProps {}

export default async function Page({
  params,
  searchParams,
}: {
  params: { cmpId: number };
  searchParams: { query: string; page: number };
}) {
  redirect(params.cmpId + "/overview");
}
