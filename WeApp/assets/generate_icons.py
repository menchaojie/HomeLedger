from PIL import Image, ImageDraw

def create_icon(filename, color, shape_type):
    """创建一个 81x81 像素的图标"""
    size = 81
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    if shape_type == 'home':
        # 绘制房子图标
        # 屋顶
        draw.polygon([(40, 10), (10, 40), (70, 40)], fill=color)
        # 房子主体
        draw.rectangle([15, 40, 65, 70], fill=color)
        # 门
        draw.rectangle([32, 50, 48, 70], fill=(255, 255, 255, 255))
    
    elif shape_type == 'swap':
        # 绘制交换/交易图标
        # 上方箭头（向右）
        draw.polygon([(20, 25), (50, 25), (45, 20)], fill=color)
        draw.polygon([(50, 25), (45, 30), (20, 30)], fill=color)
        # 下方箭头（向左）
        draw.polygon([(60, 55), (30, 55), (35, 50)], fill=color)
        draw.polygon([(30, 55), (35, 60), (60, 60)], fill=color)
        # 中间横线
        draw.rectangle([20, 38, 60, 43], fill=color)
    
    elif shape_type == 'user':
        # 绘制用户图标
        # 头部（圆形）
        draw.ellipse([28, 10, 52, 34], fill=color)
        # 身体（半圆形）
        draw.pieslice([15, 35, 65, 75], 0, 180, fill=color)
    
    img.save(filename, 'PNG')
    print(f"Created: {filename}")

# 创建普通状态图标（灰色）
create_icon('home.png', (153, 153, 153, 255), 'home')
create_icon('swap.png', (153, 153, 153, 255), 'swap')
create_icon('user.png', (153, 153, 153, 255), 'user')

# 创建选中状态图标（主题色 #4CAF50）
create_icon('home-active.png', (76, 175, 80, 255), 'home')
create_icon('swap-active.png', (76, 175, 80, 255), 'swap')
create_icon('user-active.png', (76, 175, 80, 255), 'user')

print("All icons generated successfully!")
