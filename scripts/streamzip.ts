import axios from 'axios';
import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';

const BUCKET_NAME = '1a026946-561d-4d35-8fc5-de612378daef';
const ZIP_FILE_PATH = 'projects/24f63208-11b1-45c0-a435-e43cfff6de14/tree.zip';
const OUTPUT_DIR = 'tmp'; // Directory to save the unzipped files

async function streamAndUnzip() {
  try {
    const url = `${process.env.SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${ZIP_FILE_PATH}`;

    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apiKey': process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });

    response.data
      .pipe(unzipper.Parse())
      .on('entry', function (entry:any) {
        const fileName = entry.path;
        const type = entry.type; // 'Directory' or 'File'
        const fullPath = path.join(OUTPUT_DIR, fileName);

        if (type === 'File') {
            fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            entry.pipe(fs.createWriteStream(fullPath)).on('finish', () => entry.autodrain());
        } else {
          // If it's a directory, ensure it's created
          fs.mkdirSync(fullPath, { recursive: true });
          entry.autodrain();
        }
      })
      .on('error', (err:any) => console.error('Error while unzipping:', err))
      .on('finish', () => console.log('Finished unzipping'));
  } catch (error) {
    console.error('Error in streaming and unzipping:', error);
  }
}

streamAndUnzip();
