import Login from './LoginComponent';
import React from 'react';
import { redirect } from 'next/navigation';
import { serverClient } from '@/shared/supabase-client/server';

interface IpageProps {}

export default async function Page() {

    const sb = serverClient()
    const userGet = await sb.auth.getUser()

    if (userGet.data.user != null) {
        redirect("/portal/projects")
    }
        


   return (
       <div>
           <Login />
       </div>
   );
}