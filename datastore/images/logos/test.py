from rembg import remove 
from PIL import Image 
import os

files = os.listdir("./")

def crop_transparent(image_path, output_path):
    """
    Crop the transparent parts of an image and save the result.
    
    :param image_path: Path to the input image
    :param output_path: Path to save the cropped image
    """
    with Image.open(image_path) as img:
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        
        # Extract the alpha channel
        alpha = img.split()[-1]
        
        # Get the bounding box of the non-transparent part
        bbox = alpha.getbbox()
        if bbox:
            cropped_image = img.crop(bbox)
            cropped_image.save(output_path)
            print(f"Cropped image saved to: {output_path}")
        else:
            print("Image is completely transparent, nothing to crop.")

for file in files:
	if ".png" in file:
		print(file)
		crop_transparent(file, file)
