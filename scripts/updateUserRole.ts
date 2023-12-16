import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const drewAtlasaiId = "38cfef14-3043-4f07-9b28-e045fdb6df94";


const updateUserRole = async (userId:string, role:"admin" | "associate") => {
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        
            app_metadata: {
                role
            }
        })
       

    if (error) {
        console.error(error)
        throw new Error(error.message);
    }
    return data;
};

updateUserRole(drewAtlasaiId,"associate")
// updateUserRole(drewAtlasaiId,"admin")
