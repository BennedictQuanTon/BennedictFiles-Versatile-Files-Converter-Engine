import os
import shutil
from supabase import create_client, Client

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
bucket_name = os.getenv("SUPABASE_STORAGE_BUCKET", "conversions")

supabase: Client = None
if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")

# Resolve absolute path of root uploads directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_STORAGE_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "../../../uploads"))

def download_file(file_key: str, destination_path: str) -> str:
    """
    Downloads file from Supabase Storage, or copies it from local fallback uploads dir.
    """
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)
    
    if supabase:
        try:
            print(f"Downloading {file_key} from Supabase storage...")
            res = supabase.storage.from_(bucket_name).download(file_key)
            with open(destination_path, "wb") as f:
                f.write(res)
            return destination_path
        except Exception as e:
            print(f"Supabase download failed for {file_key}: {e}. Trying local fallback...")

    # Local fallback
    local_path = os.path.join(LOCAL_STORAGE_DIR, file_key)
    print(f"Reading file from local path: {local_path}")
    if os.path.exists(local_path):
        shutil.copy2(local_path, destination_path)
        return destination_path
    else:
        raise FileNotFoundError(f"File not found on local disk: {local_path}")

def upload_file(source_path: str, file_key: str, mime_type: str = "application/octet-stream") -> str:
    """
    Uploads file to Supabase Storage, and also copies it to local fallback uploads dir.
    """
    # 1. Local copy
    local_path = os.path.join(LOCAL_STORAGE_DIR, file_key)
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    shutil.copy2(source_path, local_path)
    print(f"File saved locally to: {local_path}")

    # 2. Supabase upload
    if supabase:
        try:
            print(f"Uploading {file_key} to Supabase storage...")
            with open(source_path, "rb") as f:
                supabase.storage.from_(bucket_name).upload(
                    path=file_key,
                    file=f,
                    file_options={"content-type": mime_type, "x-upsert": "true"}
                )
            print("Supabase upload success")
        except Exception as e:
            print(f"Supabase upload failed for {file_key}: {e}")
            
    return file_key
