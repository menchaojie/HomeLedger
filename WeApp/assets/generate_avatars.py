from PIL import Image, ImageDraw

def create_default_avatar(filename, size=120):
    """创建一个默认头像"""
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # 绘制圆形背景
    draw.ellipse([0, 0, size, size], fill=(76, 175, 80, 255))  # 主题色 #4CAF50
    
    # 绘制用户图标
    # 头部（白色圆形）
    head_size = size * 0.4
    head_x = (size - head_size) / 2
    head_y = size * 0.2
    draw.ellipse([head_x, head_y, head_x + head_size, head_y + head_size], fill=(255, 255, 255, 255))
    
    # 身体（白色半圆形）
    body_width = size * 0.6
    body_height = size * 0.4
    body_x = (size - body_width) / 2
    body_y = head_y + head_size - 5
    draw.pieslice([body_x, body_y, body_x + body_width, body_y + body_height], 0, 180, fill=(255, 255, 255, 255))
    
    img.save(filename, 'PNG')
    print(f"Created: {filename}")

def create_family_avatar(filename, size=120):
    """创建一个家庭默认头像"""
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # 绘制圆形背景
    draw.ellipse([0, 0, size, size], fill=(76, 175, 80, 255))  # 主题色 #4CAF50
    
    # 绘制房子图标
    # 屋顶（白色三角形）
    roof_points = [
        (size * 0.5, size * 0.2),  # 顶部
        (size * 0.3, size * 0.4),  # 左下
        (size * 0.7, size * 0.4)   # 右下
    ]
    draw.polygon(roof_points, fill=(255, 255, 255, 255))
    
    # 房子主体（白色矩形）
    house_width = size * 0.5
    house_height = size * 0.4
    house_x = (size - house_width) / 2
    house_y = size * 0.4
    draw.rectangle([house_x, house_y, house_x + house_width, house_y + house_height], fill=(255, 255, 255, 255))
    
    # 门（主题色矩形）
    door_width = size * 0.15
    door_height = size * 0.25
    door_x = (size - door_width) / 2
    door_y = house_y + house_height - door_height
    draw.rectangle([door_x, door_y, door_x + door_width, door_y + door_height], fill=(76, 175, 80, 255))
    
    img.save(filename, 'PNG')
    print(f"Created: {filename}")

# 创建默认头像
create_default_avatar('default-avatar.png')
create_default_avatar('default-avatar-large.png', size=200)
create_family_avatar('default-family-avatar.png')

print("All avatar images generated successfully!")
print("Files created:")
print("- default-avatar.png (120x120)")
print("- default-avatar-large.png (200x200)")
print("- default-family-avatar.png (120x120)")