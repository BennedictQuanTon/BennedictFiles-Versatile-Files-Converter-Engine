import os
import shutil
from PIL import Image
import img2pdf

def compress_image(input_path: str, output_path: str):
    """
    Compresses image (png/jpg) keeping it perceptually lossless (quality=85).
    """
    img = Image.open(input_path)
    ext = os.path.splitext(input_path)[1].lower()
    
    if ext in ['.jpg', '.jpeg']:
        # Convert RGBA to RGB if saving to JPEG
        if img.mode in ('RGBA', 'LA'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3]) # 3 is alpha
            img = background
        img.save(output_path, 'JPEG', quality=85, optimize=True)
    elif ext == '.png':
        img.save(output_path, 'PNG', optimize=True)
    else:
        shutil.copy2(input_path, output_path)

def images_to_pdf(input_paths: list, output_path: str):
    """
    Combines multiple images into a single PDF without re-encoding (100% lossless).
    """
    # Filter valid file paths
    valid_paths = [p for p in input_paths if os.path.exists(p)]
    if not valid_paths:
        raise FileNotFoundError("No valid image paths provided for PDF conversion")
        
    with open(output_path, "wb") as f:
        f.write(img2pdf.convert(valid_paths))
