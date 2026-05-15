from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "game"
SCALE = 4
W = 128 * SCALE
H = 128 * SCALE


def new_canvas():
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


def ellipse_box(cx, cy, rx, ry):
    return (cx - rx, cy - ry, cx + rx, cy + ry)


def draw_avatar(state: str):
    image = new_canvas()
    draw = ImageDraw.Draw(image)

    skin = (194, 148, 118, 255)
    beard = (24, 23, 25, 255)
    hair = (28, 27, 31, 255)
    shirt = (95, 122, 178, 255)
    shirt_shadow = (62, 83, 130, 255)
    jeans = (18, 22, 32, 255)
    shoes = (20, 20, 22, 255)
    tattoo = (151, 52, 53, 200)
    pendant = (108, 78, 46, 255)
    cord = (71, 52, 37, 255)
    glasses = (16, 17, 20, 240)
    light = (245, 241, 232, 255)
    accent = (228, 189, 92, 255)

    if state == "idle":
        body_shift = 0
        arm_shift = 0
        leg_left = [202, 320, 230, 418]
        leg_right = [278, 320, 306, 418]
        torso = [186, 164, 326, 312]
        left_arm = [152, 190, 194, 308]
        right_arm = [318, 188, 360, 308]
    elif state == "run":
        body_shift = -10
        arm_shift = 22
        leg_left = [177, 314, 228, 420]
        leg_right = [280, 304, 334, 420]
        torso = [173, 168, 312, 308]
        left_arm = [138, 194, 202, 296]
        right_arm = [298, 174, 364, 272]
    else:
        body_shift = -4
        arm_shift = 30
        leg_left = [168, 302, 230, 412]
        leg_right = [282, 300, 344, 412]
        torso = [180, 158, 324, 300]
        left_arm = [141, 184, 210, 278]
        right_arm = [302, 182, 372, 280]

    cx = 256 + body_shift

    draw.rounded_rectangle(tuple(torso), radius=44, fill=shirt)
    draw.rounded_rectangle((torso[0] + 12, torso[1] + 10, torso[2] - 14, torso[3] - 12), radius=40, outline=shirt_shadow, width=8)
    draw.rounded_rectangle((cx - 16, torso[1] - 10, cx + 16, torso[1] + 34), radius=14, fill=skin)
    draw.arc((cx - 34, torso[1] + 6, cx + 34, torso[1] + 64), 205, 335, fill=light, width=8)

    draw.rounded_rectangle(tuple(left_arm), radius=28, fill=skin)
    draw.rounded_rectangle(tuple(right_arm), radius=28, fill=skin)
    draw.arc((left_arm[0] + 4, left_arm[1] + 30, left_arm[2] - 10, left_arm[3] - 10), 78, 246, fill=tattoo, width=12)
    draw.arc((right_arm[0] + 6, right_arm[1] + 24, right_arm[2] - 8, right_arm[3] - 6), 280, 74, fill=tattoo, width=12)

    if state == "idle":
        draw.rounded_rectangle((150, 294, 192, 350), radius=18, fill=skin)
        draw.rounded_rectangle((320, 292, 362, 350), radius=18, fill=skin)
    elif state == "run":
        draw.rounded_rectangle((136, 278, 182, 334), radius=18, fill=skin)
        draw.rounded_rectangle((340, 244, 384, 298), radius=18, fill=skin)
    else:
        draw.rounded_rectangle((132, 256, 178, 312), radius=18, fill=skin)
        draw.rounded_rectangle((346, 254, 392, 312), radius=18, fill=skin)

    draw.polygon([(leg_left[0], leg_left[1]), (leg_left[1], leg_left[1] - 16), (leg_left[2], leg_left[3]), (leg_left[0] + 8, leg_left[3])], fill=jeans)
    draw.polygon([(leg_right[0], leg_right[1]), (leg_right[1], leg_right[1] - 18), (leg_right[2], leg_right[3]), (leg_right[0] + 10, leg_right[3])], fill=jeans)

    draw.rounded_rectangle((leg_left[0] - 8, leg_left[3] - 8, leg_left[0] + 58, leg_left[3] + 26), radius=14, fill=shoes)
    draw.rounded_rectangle((leg_right[0] - 6, leg_right[3] - 8, leg_right[0] + 60, leg_right[3] + 26), radius=14, fill=shoes)

    head_box = ellipse_box(cx, 108, 66, 76)
    draw.ellipse(head_box, fill=skin)
    draw.pieslice((cx - 82, 50, cx + 72, 154), 190, 348, fill=hair)
    draw.pieslice((cx - 72, 16, cx + 84, 118), 210, 346, fill=hair)
    draw.polygon([(cx - 26, 20), (cx + 14, 6), (cx + 58, 18), (cx + 34, 54)], fill=hair)
    draw.rounded_rectangle((cx - 70, 108, cx + 70, 178), radius=30, fill=beard)
    draw.ellipse((cx - 44, 72, cx + 44, 144), fill=skin)
    draw.rounded_rectangle((cx - 58, 82, cx + 58, 118), radius=16, fill=glasses)
    draw.rounded_rectangle((cx - 50, 86, cx - 4, 116), radius=12, fill=(22, 24, 28, 245))
    draw.rounded_rectangle((cx + 4, 86, cx + 50, 116), radius=12, fill=(22, 24, 28, 245))
    draw.rectangle((cx - 4, 96, cx + 4, 102), fill=(72, 72, 76, 220))
    draw.line((cx - 14, 136, cx + 18, 136), fill=(110, 56, 46, 255), width=7)
    draw.line((cx - 46, 82, cx - 18, 76), fill=hair, width=8)
    draw.line((cx + 10, 76, cx + 42, 82), fill=hair, width=8)

    draw.line((cx - 10, torso[1] + 4, cx - 18, torso[1] + 110), fill=cord, width=5)
    draw.line((cx + 10, torso[1] + 4, cx + 18, torso[1] + 110), fill=cord, width=5)
    draw.rounded_rectangle((cx - 16, torso[1] + 92, cx + 16, torso[1] + 124), radius=8, outline=pendant, width=6)
    draw.polygon([(cx, torso[1] + 98), (cx + 9, torso[1] + 108), (cx, torso[1] + 118), (cx - 9, torso[1] + 108)], outline=pendant, fill=(0, 0, 0, 0))

    if state == "idle":
        draw.line((154, 300, 196, 336), fill=shirt_shadow, width=20)
        draw.line((324, 300, 284, 336), fill=shirt_shadow, width=20)
        draw.rounded_rectangle((162, 334, 194, 364), radius=14, fill=(181, 84, 66, 255))
        draw.rounded_rectangle((286, 334, 318, 364), radius=14, fill=(181, 84, 66, 255))
    elif state == "run":
        draw.line((150, 278, 204, 318), fill=shirt_shadow, width=20)
        draw.line((316, 248, 356, 286), fill=shirt_shadow, width=20)
        draw.rounded_rectangle((164, 310, 202, 342), radius=14, fill=(181, 84, 66, 255))
        draw.rounded_rectangle((348, 270, 386, 304), radius=14, fill=(181, 84, 66, 255))
    else:
        draw.line((152, 260, 204, 306), fill=shirt_shadow, width=20)
        draw.line((322, 258, 372, 308), fill=shirt_shadow, width=20)
        draw.rounded_rectangle((166, 294, 204, 326), radius=14, fill=(181, 84, 66, 255))
        draw.rounded_rectangle((356, 290, 394, 324), radius=14, fill=(181, 84, 66, 255))

    image = image.filter(ImageFilter.GaussianBlur(radius=0.4))
    image = image.resize((128, 128), Image.Resampling.LANCZOS)
    return image


for state in ("idle", "run", "jump"):
    draw_avatar(state).save(OUT / f"player-{state}.png")
    print(f"saved player-{state}.png")
