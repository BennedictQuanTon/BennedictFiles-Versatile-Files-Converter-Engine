from pypdf import PdfMerger

def merge_pdfs(input_paths: list, output_path: str):
    """
    Merges multiple PDF files into a single PDF document.
    """
    merger = PdfMerger()
    for path in input_paths:
        merger.append(path)
    merger.write(output_path)
    merger.close()
