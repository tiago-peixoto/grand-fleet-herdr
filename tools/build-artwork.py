#!/usr/bin/env python3
"""Export approved prototype sheets without modifying their source artwork."""
import argparse
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'mods/one-piece/assets'
PORTRAIT_ORIGINS = {
    'brook': (24, 15), 'compote': (26, 18), 'jack': (28, 8),
    'black-maria': (28, 12), 'atmos': (24, 10), 'oden': (26, 9),
    'petermoo': (24, 11), 'mr-momora': (22, 13), 'amande': (21, 13),
    'perospero': (23, 13), 'mont-d-or': (23, 10), 'smoothie': (28, 12),
}


def im(*args):
    return subprocess.check_output(['magick', *map(str, args)])


def js_round(value):
    return int(value + .5)


def extract_boxes(path, rows, worker=False, split=None):
    width, height = map(int, im('identify', '-format', '%w %h', path).split())
    alpha = im(path, '-alpha', 'extract', '-depth', '8', 'gray:-')
    bands = []
    if worker:
        for y in range(height):
            if sum(a > 160 for a in alpha[y*width:(y+1)*width]) < 8:
                continue
            if bands and y-bands[-1][1] <= 8:
                bands[-1][1] = y
            else:
                bands.append([y, y])
        if len(bands) != 9:
            raise ValueError(f'Expected nine worker animation rows, found {len(bands)}')
    boxes = []
    for row in range(rows):
        if worker:
            y0, y1 = bands[row][0], bands[row][1]+1
        elif split:
            y0, y1 = split[row], split[row+1]
        else:
            y0, y1 = js_round(row*height/rows), js_round((row+1)*height/rows)
        for col in range(4):
            x0, x1 = js_round(col*width/4), js_round((col+1)*width/4)
            left, right, top, bottom = x1, x0, y1, y0
            for y in range(y0, y1):
                for x in range(x0, x1):
                    if alpha[y*width+x] > 160:
                        left, right = min(left, x), max(right, x)
                        top, bottom = min(top, y), max(bottom, y)
            if right < left:
                raise ValueError(f'Empty frame: {path}, row {row}, column {col}')
            boxes.append((left, top, right-left+1, bottom-top+1))
    return boxes


def row_gaps(path, rows):
    # Poses can cross a sheet's equal thirds, so move each row line to the nearest empty pixel row.
    width, height = map(int, im('identify', '-format', '%w %h', path).split())
    alpha = im(path, '-alpha', 'extract', '-depth', '8', 'gray:-')
    filled = [any(a > 160 for a in alpha[y*width:(y+1)*width]) for y in range(height)]
    split = [0]
    for row in range(1, rows):
        third = js_round(row*height/rows)
        if not filled[third]:
            split.append(third)
            continue
        above = next(y for y in range(third, -1, -1) if not filled[y])
        below = next(y for y in range(third, height) if not filled[y])
        split.append(above if third-above < below-third else below)
    return split + [height]


def export(sheet, boxes, size, limit, animations, output, flag=False):
    scale = limit / max(max(w, h) for _, _, w, h in boxes)
    with tempfile.TemporaryDirectory() as directory:
        frames = []
        for index, (x, y, w, h) in enumerate(boxes):
            dw, dh = js_round(w*scale), js_round(h*scale)
            dx, dy = 2 if flag else js_round((size-dw)/2), size-3-dh
            frame = Path(directory) / f'{index}.png'
            im('-size', f'{size}x{size}', 'xc:none', '(', sheet,
               '-crop', f'{w}x{h}+{x}+{y}', '+repage', '-sample', f'{dw}x{dh}!', ')',
               '-geometry', f'+{dx}+{dy}', '-compose', 'Over', '-composite',
               '-strip', '-define', 'png:exclude-chunks=date,time', f'PNG32:{frame}')
            frames.append(frame)
        animate(frames, animations, output)


def animate(frames, animations, output):
    for name, order, delays in animations:
        (output / f'{name}.png').write_bytes(frames[order[0]].read_bytes())
        args = []
        for index, delay in zip(order, delays, strict=True):
            args += ['(', str(frames[index]), '-set', 'delay', str(delay), ')']
        # GIF has binary alpha; PNG keeps the source's partial transparency.
        im(*args, '-channel', 'A', '-threshold', '50%', '+channel',
           '-background', 'none', '-set', 'dispose', 'Background', '+dither',
           '-loop', '0', '-strip', output / f'{name}.gif')


def gestures(sheet, name, output):
    # The approved sheets are already drawn on the 64 pixel canvas, so cells are cut without scaling.
    if im('identify', '-format', '%w %h', sheet).split() != [b'256', b'256']:
        raise ValueError(f'Expected a 256x256 gesture sheet: {sheet}')
    with tempfile.TemporaryDirectory() as directory:
        frames = []
        for index in range(16):
            frame = Path(directory) / f'{index}.png'
            im(sheet, '+repage', '-crop', f'64x64+{index % 4 * 64}+{index // 4 * 64}', '+repage',
               '-strip', '-define', 'png:exclude-chunks=date,time', f'PNG32:{frame}')
            frames.append(frame)
        # The fourth row repeats the approved idle loop, which the study sheet already exports.
        animate(frames, [(f'crew-{name}-{state}', range(row*4, row*4+4), [delay]*4)
                         for row, (state, delay) in enumerate([('blocked', 70), ('error', 70), ('done', 85)])],
                output)


def build(output):
    sunny = ROOT / 'prototype/custom-trial/assets/sunny.png'
    luffy = ROOT / 'prototype/custom-trial/assets/luffy.png'
    flag = ROOT / 'prototype/flow/assets/straw-hat-flag.png'
    workers = ROOT / 'prototype/flow/assets/worker-states-v1.png'
    # Validate all source cells before replacing any exported files.
    sunny_boxes = extract_boxes(sunny, 1)
    luffy_boxes = extract_boxes(luffy, 2)
    flag_boxes = extract_boxes(flag, 1)
    worker_boxes = extract_boxes(workers, 9, worker=True)
    output.mkdir(parents=True, exist_ok=True)
    export(sunny, sunny_boxes, 128, 116,
           [('sunny', [0, 1, 2, 3, 2, 1], [52]*6)], output)
    export(luffy, luffy_boxes, 64, 56,
           [('luffy-idle', range(4), [175, 25, 20, 40]),
            ('luffy-working', range(4, 8), [33]*4)], output)
    export(flag, flag_boxes, 32, 28,
           [('flag', range(4), [24]*4)], output, flag=True)
    for index, character in enumerate(('chopper', 'franky', 'pirate')):
        animations = [(f'{character}-{state}', range(row*4, row*4+4), [delay]*4)
                      for row, (state, delay) in enumerate(
                          [('idle', 85), ('working', 22), ('blocked', 70)])]
        export(workers, worker_boxes[index*12:index*12+12], 64,
               44 if character == 'chopper' else 56, animations, output)

    for sheet in sorted((ROOT / 'prototype/crew-artwork').glob('*-study-v1.png')):
        name = sheet.name.removesuffix('-study-v1.png')
        ship = name in ('red-force', 'queen-mama-chanter', 'mammoth',
                        'polar-tang', 'moby-dick', 'oro-jackson', 'victoria-punk')
        boxes = extract_boxes(sheet, 1) if ship else extract_boxes(
            sheet, 3, split=row_gaps(sheet, 3))
        # The sitting row still sets the character's shared scale, but its approved gesture sheet replaces it.
        animations = [(f'crew-{name}', range(4), [52]*4)] if ship else [
            (f'crew-{name}-{state}', range(row*4, row*4+4), [delay]*4)
            for row, (state, delay) in enumerate([('idle', 85), ('working', 22)])]
        limit = 116 if ship else 44 if name == 'chopper' else 56
        export(sheet, boxes, 128 if ship else 64, limit, animations, output)
        if not ship:
            portrait(output / f'crew-{name}-working.png', output / f'portrait-crew-{name}.png',
                     origin=PORTRAIT_ORIGINS.get(name))
            gestures(sheet.with_name(f'{name}-gestures-v1.png'), name, output)
    islands(ROOT / 'prototype/flow/assets/machine-islands-v1.png', output)


def islands(sheet, output):
    if im('identify', '-format', '%w %h', sheet).split() != [b'256', b'64']:
        raise ValueError(f'Expected a 256x64 island sheet: {sheet}')
    for index in range(8):
        for row, suffix in enumerate(('', '-fog')):
            # The sheet carries a stray 32x32 canvas entry that would crop every cell to the first island.
            im(sheet, '+repage', '-crop', f'32x32+{index*32}+{row*32}', '+repage',
               '-strip', '-define', 'png:exclude-chunks=date,time', f'PNG32:{output}/island-{index}{suffix}.png')


def portrait(sprite, output, side=28, origin=None):
    # Tall hats and hair need measured crops to keep the face inside the portrait.
    if origin is None:
        alpha = im(sprite, '-alpha', 'extract', '-depth', '8', 'gray:-')
        opaque = [(i % 64, i // 64) for i, a in enumerate(alpha) if a]
        top = min(y for _, y in opaque)
        band = [x for x, y in opaque if y < top+22]
        x = min(max(round((min(band)+max(band))/2 - side/2), 0), 64-side)
        origin = x, max(top-1, 0)
    x, y = origin
    im(sprite, '-crop', f'{side}x{side}+{x}+{y}', '+repage',
       '-strip', '-define', 'png:exclude-chunks=date,time', f'PNG32:{output}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=OUTPUT)
    build(parser.parse_args().output)
