import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import unzipper from 'unzipper';

const BUCKET_NAME = '1a026946-561d-4d35-8fc5-de612378daef';
const ZIP_FILE_PATH = 'projects/24f63208-11b1-45c0-a435-e43cfff6de14/tree.zip';

async function streamAndUnzip() {

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // unzipper.Open.url(
 
}

streamAndUnzip();
