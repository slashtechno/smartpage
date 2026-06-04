#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["Pillow"]
# ///

import argparse
import sys
from datetime import datetime, timedelta
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


# ── Font loading ──────────────────────────────────────────────────────────────

FONT_CANDIDATES = [
    # macOS
    "/System/Library/Fonts/Supplemental/Georgia.ttf",
    "/System/Library/Fonts/Supplemental/GeorgiaBold.ttf",
    "/Library/Fonts/Georgia.ttf",
    # Linux
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
    # Windows
    "C:/Windows/Fonts/georgia.ttf",
]

def find_font() -> str | None:
    for p in FONT_CANDIDATES:
        if Path(p).exists():
            return p
    return None

def load(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    base = find_font()
    if base is None:
        return ImageFont.load_default()
    # try bold variant next to the regular one
    if bold:
        bold_path = base.replace(".ttf", "Bold.ttf").replace("Regular", "Bold")
        if Path(bold_path).exists():
            base = bold_path
    try:
        return ImageFont.truetype(base, size)
    except Exception:
        return ImageFont.load_default()


# ── Palette ───────────────────────────────────────────────────────────────────

BG       = (13,  13,  26)
WHITE    = (255, 255, 255)
RED      = (255, 77,  109)
PURPLE   = (123, 97,  255)
GRAY     = (170, 170, 204)
DARKLINE = (51,  51,  85)
DIMTEXT  = (85,  85,  119)


# ── Drawing helpers ───────────────────────────────────────────────────────────

def circle(draw: ImageDraw.ImageDraw, cx, cy, r, color, width=2):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=width)

def badge(draw: ImageDraw.ImageDraw, x, y, w, h, text, font):
    draw.rounded_rectangle([x, y, x + w, y + h], radius=6, fill=RED)
    draw.text((x + w // 2, y + h // 2), text, font=font, fill=WHITE, anchor="mm")

def pill_outline(draw: ImageDraw.ImageDraw, x, y, w, h, text, font):
    overlay = Image.new("RGBA", draw._image.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle([x, y, x + w, y + h], radius=6, fill=(*PURPLE, 50))
    od.rounded_rectangle([x, y, x + w, y + h], radius=6, outline=(*PURPLE, 255), width=2)
    draw._image.alpha_composite(overlay)
    draw.text((x + w // 2, y + h // 2), text, font=font, fill=PURPLE, anchor="mm")


# ── Build image ───────────────────────────────────────────────────────────────

W, H = 1200, 800

def build(date_label: str, time_label: str) -> Image.Image:
    img = Image.new("RGBA", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Decorative rings
    circle(draw, 1040, 120, 240, (*RED, 80),    width=3)
    circle(draw, 1040, 120, 160, (*RED, 50),    width=2)
    circle(draw, 160,  700, 180, (*PURPLE, 80), width=3)

    # Badge
    badge(draw, 80, 72, 320, 56, "LIVE MUSIC", load(26, bold=True))

    # Title
    draw.text((80, 190), "NEON",   font=load(108, bold=True), fill=WHITE)
    draw.text((80, 296), "HARBOR", font=load(108, bold=True), fill=RED)
    draw.text((80, 418), f"FAREWELL TOUR {datetime.now().year}", font=load(32), fill=GRAY)

    # Divider
    draw.line([(80, 462), (760, 462)], fill=DARKLINE, width=2)

    # Left column — Date / Time
    draw.text((80, 490), "DATE", font=load(26), fill=PURPLE)
    d_label = date_label[:34] + ("…" if len(date_label) > 34 else "")
    draw.text((80, 526), d_label,    font=load(36), fill=WHITE)

    draw.text((80, 590), "TIME", font=load(26), fill=PURPLE)
    draw.text((80, 626), time_label, font=load(36), fill=WHITE)

    # Right column — Venue
    draw.text((680, 490), "VENUE",              font=load(26), fill=PURPLE)
    draw.text((680, 526), "The Marquee",        font=load(36), fill=WHITE)
    draw.text((680, 576), "1247 N Phantom Ave", font=load(28), fill=GRAY)
    draw.text((680, 612), "Chicago, IL 60614",  font=load(28), fill=GRAY)

    # Ticket pill
    pill_outline(draw, 680, 660, 240, 60, "$35 · $55 · $90", load(28))

    # Footer
    draw.line([(80, 762), (1120, 762)], fill=DARKLINE, width=1)
    draw.text(
        (W // 2, 780),
        "NEONHARBOR.EXAMPLE.COM  ·  ALL AGES WELCOME",
        font=load(20), fill=DIMTEXT, anchor="mm",
    )

    return img.convert("RGB")


# ── CLI ───────────────────────────────────────────────────────────────────────

def parse_args():
    p = argparse.ArgumentParser(
        description="Generate a test event flyer PNG.",
        usage="./gen-test-event.py <days> [-r] [-e] [-o OUTPUT]",
    )
    p.add_argument("days", type=int, help="Days in the future for the event")
    p.add_argument("-r", "--relative", action="store_true", help="Relative date phrasing ('Next Saturday')")
    p.add_argument("-e", "--end",      action="store_true", help="Include an end time (2h after start)")
    p.add_argument("-o", "--output",   default="test-event.png", help="Output path (default: test-event.png)")
    return p.parse_args()


def fmt_date(dt):  return dt.strftime("%A, %B %-d, %Y")
def fmt_time(dt):  return dt.strftime("%-I:%M %p")

def relative_label(dt, days):
    w = dt.strftime("%A")
    if days == 0:  return "Tonight"
    if days == 1:  return "Tomorrow"
    if days < 7:   return f"This {w}"
    if days < 14:  return f"Next {w}"
    return f"In {days} days ({w})"


def main():
    args = parse_args()

    now   = datetime.now().replace(second=0, microsecond=0)
    start = (now + timedelta(days=args.days)).replace(hour=20, minute=0)
    end   = start.replace(hour=22)
    doors = start.replace(hour=19)

    date_label = relative_label(start, args.days) if args.relative else fmt_date(start)
    time_label = (
        f"{fmt_time(start)} — {fmt_time(end)}"
        if args.end
        else f"{fmt_time(start)} — Doors {fmt_time(doors)}"
    )

    img = build(date_label, time_label)
    img.save(args.output, "PNG")

    print(f"✓ {args.output}  ({args.days}d · {'relative' if args.relative else 'absolute'} · end={args.end})")
    print(f"  date: {date_label}")
    print(f"  time: {time_label}")


if __name__ == "__main__":
    main()