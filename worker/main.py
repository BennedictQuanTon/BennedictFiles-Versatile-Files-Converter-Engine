import os
import asyncio
import tempfile
import json
from dotenv import load_dotenv

# Load env variables if .env exists
load_dotenv()

from bullmq import Worker
from utils.storage import download_file, upload_file
from converters.pdf_converter import office_to_pdf, pdf_to_office, compress_pdf, pdf_to_images
from converters.image_converter import compress_image, images_to_pdf
from converters.merge_converter import merge_pdfs

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")

MIME_TYPES = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg"
}

async def process_job(job, job_token):
    print(f"--- Processing Job {job.id} ---")
    data = job.data
    tool = data.get("tool", "").lower()
    input_key = data.get("inputKey")
    output_key = data.get("outputKey")

    print(f"Tool: {tool}")
    print(f"Input Key: {input_key}")
    print(f"Output Key: {output_key}")

    if not input_key or not output_key:
        raise ValueError("Missing inputKey or outputKey in job data")

    with tempfile.TemporaryDirectory() as temp_dir:
        input_ext = os.path.splitext(input_key)[1]
        local_input = os.path.join(temp_dir, f"input{input_ext}")
        
        output_ext = os.path.splitext(output_key)[1]
        local_output = os.path.join(temp_dir, f"output{output_ext}")

        # 1. Download file
        download_file(input_key, local_input)

        # 2. Run conversion
        try:
            lower_tool = tool.lower()
            if "pdf-to-word" in lower_tool or "pdf to word" in lower_tool:
                pdf_to_office(local_input, local_output, "docx")
            elif "pdf-to-excel" in lower_tool or "pdf to excel" in lower_tool:
                pdf_to_office(local_input, local_output, "xlsx")
            elif "pdf-to-png" in lower_tool or "pdf to png" in lower_tool:
                pdf_to_images(local_input, local_output, "png")
            elif "pdf-to-jpg" in lower_tool or "pdf to jpg" in lower_tool:
                pdf_to_images(local_input, local_output, "jpg")
            elif "word-to-pdf" in lower_tool or "word to pdf" in lower_tool:
                office_to_pdf(local_input, local_output)
            elif "excel-to-pdf" in lower_tool or "excel to pdf" in lower_tool:
                office_to_pdf(local_input, local_output)
            elif "png-to-pdf" in lower_tool or "png to pdf" in lower_tool or "jpg-to-pdf" in lower_tool or "jpg to pdf" in lower_tool:
                images_to_pdf([local_input], local_output)
            elif "compress-pdf" in lower_tool or "compress pdf" in lower_tool:
                compress_pdf(local_input, local_output)
            elif "compress-image" in lower_tool or "compress image" in lower_tool:
                compress_image(local_input, local_output)
            elif "merge-pdfs" in lower_tool or "merge pdfs" in lower_tool:
                merge_pdfs([local_input], local_output)
            elif "merge-images" in lower_tool or "merge images" in lower_tool:
                images_to_pdf([local_input], local_output)
            else:
                raise ValueError(f"Unsupported tool: {tool}")

            # 3. Upload file
            mime_type = MIME_TYPES.get(output_ext.replace(".", "").lower(), "application/octet-stream")
            upload_file(local_output, output_key, mime_type)

            print(f"--- Job {job.id} Success ---")
            return json.dumps({"outputKey": output_key})

        except Exception as e:
            print(f"Conversion error on job {job.id}: {e}")
            raise e

async def main():
    print(f"Starting Python Worker, connecting to Redis: {redis_url}")
    try:
        worker = Worker("conversion-jobs", process_job, {
            "connection": redis_url
        })
        print("Worker is ready and listening for jobs...")
        
        # Keep process alive
        while True:
            await asyncio.sleep(1)
    except Exception as e:
        print(f"Failed to start Python worker: {e}")

if __name__ == "__main__":
    asyncio.run(main())
