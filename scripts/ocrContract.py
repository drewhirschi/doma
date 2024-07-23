
import os
from supabase import create_client, Client
import requests
import ocrmypdf
import sys

from dotenv import load_dotenv

load_dotenv(dotenv_path='.env.local')

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)




def download_file_from_supabase(bucket: str, file_path: str, local_path: str):
    response = supabase.storage.from_(bucket).download(file_path)
    with open(local_path, 'wb') as file:
        file.write(response)
    print(f"Downloaded {file_path} to {local_path}")

def upload_file_to_supabase(bucket: str, file_path: str, local_path: str):
    with open(local_path, 'rb') as file:
        supabase.storage.from_(bucket).update(file_path, file)
    print(f"Uploaded {local_path} to {file_path}")
    
    
def get_contract_data_from_supabase(contract_id: str):
    response = supabase.from_('contract').select('*').eq('id', contract_id).single().execute()
    return response

def ocr_pdf(input_path: str, output_path: str):
    ocrmypdf.ocr(input_path, output_path, redo_ocr=True)
    print(f"OCR completed for {input_path}, saved as {output_path}")
    
def linify_pdf(contract_id: str):
    requests.post('https://xjedm27xqhz6bycbmrdwr4n2ve0ywpli.lambda-url.us-west-2.on.aws/', json={'contractId': contract_id})
    print(f"Linified completed for {contract_id}")


if len(sys.argv) < 2:
    raise ValueError("No contract id passed as argument")

contract_id = sys.argv[1]

# contract_id = ""

contract_data = get_contract_data_from_supabase(contract_id)


# Define file paths
bucket_name = "tenants"
remote_file_path = contract_data.data["name"]
local_input_path = "tmp/ocr_file_input.pdf"
local_output_path = "tmp/ocr_file_output.pdf"




download_file_from_supabase(bucket_name, remote_file_path, local_input_path)

ocr_pdf(local_input_path, local_output_path)

upload_file_to_supabase(bucket_name, remote_file_path, local_output_path)

linify_pdf(contract_id)



# Clean up local files
# os.remove(local_input_path)
# os.remove(local_output_path)
