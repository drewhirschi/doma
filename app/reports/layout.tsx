import { cookies } from "next/headers";

export default function Layout({
   children,
}: {
   children: React.ReactNode;
}) {

    
   return <div>{children}</div>;
}