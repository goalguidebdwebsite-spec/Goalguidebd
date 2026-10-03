from pathlib import Path
from PIL import Image, ImageDraw
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

source = Path(r"C:\Users\MD. KAWSAR AHMED\Downloads\Image (9) (1).jpg")
out_dir = Path(r"C:\Frontend Development\Goalguide\output\pdf")
out_dir.mkdir(parents=True, exist_ok=True)

photo = Image.open(source).convert("RGBA")
# Follow the front sheet's visible edges, including its angled upper-left side,
# to exclude the papers and fabric underneath.
mask = Image.new("L", photo.size, 0)
edge = [(260, 143), (858, 143), (938, 1200), (114, 1176), (164, 201)]
ImageDraw.Draw(mask).polygon(edge, fill=255)
photo.putalpha(mask)
page = photo.crop(mask.getbbox())
page_rgb = Image.new("RGB", page.size, "white")
page_rgb.paste(page.convert("RGB"), mask=page.getchannel("A"))
clean_path = out_dir / "birth-certificate-2-clean.png"
page_rgb.save(clean_path)

pdf_path = out_dir / "birth-certificate-2.pdf"
page_w, page_h = A4
c = canvas.Canvas(str(pdf_path), pagesize=A4)
margin = 28
scale = min((page_w - 2 * margin) / page.width,
            (page_h - 2 * margin) / page.height)
w, h = page.width * scale, page.height * scale
c.drawImage(ImageReader(str(clean_path)), (page_w - w) / 2,
            (page_h - h) / 2, width=w, height=h)
c.showPage()
c.save()
print(pdf_path)
