from pathlib import Path
from PIL import Image, ImageDraw
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

base = Path(r"C:\Users\MD. KAWSAR AHMED\Downloads")
out = Path(r"C:\Frontend Development\Goalguide\output")
out.mkdir(exist_ok=True)

# Polygons follow the complete card/sleeve edge in each original photograph.
cards = [
    ("Image (11).jpg", [(183, 517), (781, 505), (794, 923), (179, 933)]),
    ("Image (12).jpg", [(146, 526), (851, 518), (859, 1001), (134, 1001)]),
]
cutouts = []
for i, (filename, polygon) in enumerate(cards, 1):
    im = Image.open(base / filename).convert("RGBA")
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).polygon(polygon, fill=255)
    im.putalpha(mask)
    bounds = mask.getbbox()
    im = im.crop(bounds)
    path = out / f"id-card-{i}.png"
    im.save(path)
    cutouts.append(path)

pdf_dir = out / "pdf"
pdf_dir.mkdir(exist_ok=True)
pdf = pdf_dir / "id-cards.pdf"
page_w, page_h = A4
c = canvas.Canvas(str(pdf), pagesize=A4)
c.setFillColorRGB(1, 1, 1)
c.rect(0, 0, page_w, page_h, fill=1, stroke=0)
margin_x, margin_y, gap = 26, 26, 14
slot_h = (page_h - 2 * margin_y - gap) / 2
for idx, image_path in enumerate(cutouts):
    # First input (Image 11) occupies the upper half; Image 12 is lower.
    slot_bottom = page_h - margin_y - slot_h if idx == 0 else margin_y
    c.drawImage(ImageReader(str(image_path)), margin_x, slot_bottom,
                width=page_w - 2 * margin_x, height=slot_h,
                preserveAspectRatio=True, anchor="c", mask="auto")
c.showPage()
c.save()
print(pdf)
