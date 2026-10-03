from pathlib import Path
from PIL import Image, ImageDraw
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

base = Path(r"C:\Users\MD. KAWSAR AHMED\Downloads")
out = Path(r"C:\Frontend Development\Goalguide\output\pdf")
out.mkdir(parents=True, exist_ok=True)

# Image 13 is the front (top); Image 14 is the reverse (bottom).
cards = [
    ("Image (13).jpg", [(158, 432), (805, 425), (825, 890), (147, 895)]),
    ("Image (14).jpg", [(111, 456), (809, 450), (823, 944), (105, 946)]),
]
cutouts = []
for i, (filename, polygon) in enumerate(cards, 1):
    im = Image.open(base / filename).convert("RGBA")
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).polygon(polygon, fill=255)
    im.putalpha(mask)
    im = im.crop(mask.getbbox())
    path = out / f"id-card-set-2-{i}.png"
    im.save(path)
    cutouts.append(path)

pdf = out / "id-cards-2.pdf"
page_w, page_h = A4
c = canvas.Canvas(str(pdf), pagesize=A4)
c.setFillColorRGB(1, 1, 1)
c.rect(0, 0, page_w, page_h, fill=1, stroke=0)
margin_x, margin_y, gap = 26, 26, 14
slot_h = (page_h - 2 * margin_y - gap) / 2
for idx, image_path in enumerate(cutouts):
    slot_bottom = page_h - margin_y - slot_h if idx == 0 else margin_y
    c.drawImage(ImageReader(str(image_path)), margin_x, slot_bottom,
                width=page_w - 2 * margin_x, height=slot_h,
                preserveAspectRatio=True, anchor="c", mask="auto")
c.showPage()
c.save()
print(pdf)
