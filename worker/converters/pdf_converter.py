import os
import subprocess
import shutil
from pdf2image import convert_from_path

def run_command(cmd):
    print(f"Running command: {' '.join(cmd)}")
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if result.returncode != 0:
        print(f"Command failed with code {result.returncode}")
        print(f"STDOUT: {result.stdout}")
        print(f"STDERR: {result.stderr}")
        raise RuntimeError(f"Command failed: {result.stderr}")
    return result.stdout

def office_to_pdf(input_path: str, output_path: str):
    """
    Converts docx/xlsx/pptx to pdf using headless LibreOffice.
    """
    outdir = os.path.dirname(output_path)
    cmd = [
        "libreoffice",
        "--headless",
        "--convert-to",
        "pdf:writer_pdf_Export",
        "--outdir",
        outdir,
        input_path
    ]
    
    try:
        run_command(cmd)
    except FileNotFoundError:
        print("WARNING: 'libreoffice' command not found. Please install LibreOffice.")
        raise RuntimeError("LibreOffice not installed on system. Unable to convert Office to PDF.")

    # LibreOffice names the output file same as input but with .pdf
    input_filename = os.path.basename(input_path)
    default_output_name = os.path.splitext(input_filename)[0] + ".pdf"
    default_output_path = os.path.join(outdir, default_output_name)
    
    if os.path.exists(default_output_path):
        if default_output_path != output_path:
            shutil.move(default_output_path, output_path)
    else:
        # Check if there is a pdf in the folder with similar name
        files = [f for f in os.listdir(outdir) if f.endswith('.pdf')]
        if files:
            shutil.move(os.path.join(outdir, files[0]), output_path)
        else:
            raise FileNotFoundError(f"LibreOffice conversion output PDF not found in {outdir}")

def pdf_to_office(input_path: str, output_path: str, target_format: str):
    """
    Converts PDF to docx/xlsx using headless LibreOffice.
    target_format should be 'docx' or 'xlsx'
    """
    outdir = os.path.dirname(output_path)
    cmd = [
        "libreoffice",
        "--headless",
        "--infilter=writer_pdf_Import",
        "--convert-to",
        target_format,
        "--outdir",
        outdir,
        input_path
    ]
    
    try:
        run_command(cmd)
    except FileNotFoundError:
        print("WARNING: 'libreoffice' command not found. Please install LibreOffice.")
        raise RuntimeError("LibreOffice not installed on system. Unable to convert PDF to Office.")

    input_filename = os.path.basename(input_path)
    default_output_name = os.path.splitext(input_filename)[0] + f".{target_format}"
    default_output_path = os.path.join(outdir, default_output_name)
    
    if os.path.exists(default_output_path):
        if default_output_path != output_path:
            shutil.move(default_output_path, output_path)
    else:
        # Check for matching files
        files = [f for f in os.listdir(outdir) if f.endswith(f'.{target_format}')]
        if files:
            shutil.move(os.path.join(outdir, files[0]), output_path)
        else:
            raise FileNotFoundError(f"LibreOffice conversion output .{target_format} not found")

def compress_pdf(input_path: str, output_path: str):
    """
    Compresses PDF using Ghostscript with high resolution printer preset.
    """
    cmd = [
        "gs",
        "-sDEVICE=pdfwrite",
        "-dPDFSETTINGS=/printer",
        "-dCompatibilityLevel=1.4",
        "-dNOPAUSE",
        "-dBATCH",
        f"-sOutputFile={output_path}",
        input_path
    ]
    try:
        run_command(cmd)
    except FileNotFoundError:
        print("WARNING: 'gs' (Ghostscript) not found. Copied PDF without compression.")
        shutil.copy2(input_path, output_path)

def pdf_to_images(input_path: str, output_path: str, fmt: str = "png"):
    """
    Converts a PDF page 1 to a high resolution image.
    """
    try:
        images = convert_from_path(input_path, dpi=300, fmt=fmt)
        if not images:
            raise RuntimeError("No pages found in PDF")
        
        image = images[0]
        if fmt in ["jpeg", "jpg"]:
            image.save(output_path, "JPEG", quality=95, subsampling=0)
        else:
            image.save(output_path, "PNG", optimize=True)
    except Exception as e:
        print(f"WARNING: PDF to Image failed ({e}). Checking for Poppler dependency.")
        raise RuntimeError(f"Poppler or pdf2image failed: {e}")
