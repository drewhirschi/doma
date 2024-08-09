import { cookies } from "next/headers";

export default function Layout({
   children,
}: {
   children: React.ReactNode;
}) {

    // if (request.nextUrl.searchParams.get("parsluid")) {
    //     cookies().set({
    //         name: 'parsluid',
    //         value: request.nextUrl.searchParams.get("parsluid")!
    //     })

    // }
   return <div>{children}</div>;
}