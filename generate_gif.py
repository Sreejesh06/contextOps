import math
from PIL import Image, ImageDraw, ImageFont

def ease_in_out(t):
    return t * t * (3 - 2 * t)

def draw_frame(t, width=1200, height=600):
    # Draw at 2x for antialiasing
    scale = 2
    w, h = width * scale, height * scale
    img = Image.new("RGB", (w, h), "#0a0a0c")
    draw = ImageDraw.Draw(img)
    
    # ContextOps colors
    bg = (10, 10, 12)
    node_bg = (20, 20, 25)
    border = (40, 40, 50)
    text_color = (200, 200, 210)
    
    # Sources (PagerDuty, Datadog, GitHub)
    sources = [
        {"y": h*0.25, "color": (255, 60, 60), "label": "PagerDuty"},
        {"y": h*0.5, "color": (160, 60, 255), "label": "Datadog"},
        {"y": h*0.75, "color": (200, 200, 200), "label": "GitHub"},
    ]
    
    src_x = w * 0.2
    center_x = w * 0.5
    center_y = h * 0.5
    out_x = w * 0.8
    out_y = h * 0.5
    
    # Draw connections
    for src in sources:
        draw.line([(src_x, src["y"]), (center_x, center_y)], fill=border, width=4*scale)
        
    draw.line([(center_x, center_y), (out_x, out_y)], fill=border, width=4*scale)
    
    # Animate data particles flowing
    # Cycle length is 1.0 (loop)
    # Particles from sources to center: t=0 to t=0.5
    # Particles from center to out: t=0.5 to t=1.0
    
    for src in sources:
        # We can have continuous particles flowing
        p_t = (t * 2) % 1.0
        # Eased progress
        progress = ease_in_out(p_t)
        px = src_x + (center_x - src_x) * progress
        py = src["y"] + (center_y - src["y"]) * progress
        
        # Draw particle
        r = 8 * scale
        draw.ellipse([px-r, py-r, px+r, py+r], fill=src["color"])
        
    # Particle to output
    p_t_out = ((t + 0.5) * 2) % 1.0
    out_progress = ease_in_out(p_t_out)
    px_o = center_x + (out_x - center_x) * out_progress
    py_o = center_y + (out_y - center_y) * out_progress
    draw.ellipse([px_o-8*scale, py_o-8*scale, px_o+8*scale, py_o+8*scale], fill=(0, 255, 150))
    
    # Draw nodes
    def draw_node(x, y, radius, label, color):
        draw.ellipse([x-radius, y-radius, x+radius, y+radius], fill=node_bg, outline=color, width=4*scale)
        # We simulate text by a small bar or if we can't load a font, just abstract
        draw.line([(x-radius*0.6, y+radius+20*scale), (x+radius*0.6, y+radius+20*scale)], fill=text_color, width=4*scale)
    
    # Draw source nodes
    r_src = 30 * scale
    for src in sources:
        draw_node(src_x, src["y"], r_src, src["label"], src["color"])
        
    # Draw center node (ContextOps)
    r_center = 50 * scale + (math.sin(t * math.pi * 2) * 5 * scale) # Pulsing
    draw_node(center_x, center_y, r_center, "ContextOps AI", (0, 150, 255))
    
    # Draw output node (Resolution)
    draw_node(out_x, out_y, r_src, "Resolution", (0, 255, 150))
    
    # Downscale
    img = img.resize((width, height), Image.Resampling.LANCZOS)
    return img

def main():
    frames = []
    fps = 20
    duration = 3.0 # seconds
    num_frames = int(fps * duration)
    
    for i in range(num_frames):
        t = i / num_frames
        frames.append(draw_frame(t))
        
    frames[0].save(
        "project.gif",
        save_all=True,
        append_images=frames[1:],
        duration=1000//fps,
        loop=0,
        optimize=True
    )

if __name__ == "__main__":
    main()
