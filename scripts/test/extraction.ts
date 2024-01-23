import { fullAccessServiceClient as fullDBAccessServiceClient } from "@/supabase/ServerClients";
import { reviewContract } from "../../src/server/processContract";

const supabase = fullDBAccessServiceClient()

reviewContract(supabase, "83ccbd60-6dbe-443c-b6ed-15fec6bf5437").then(console.log)