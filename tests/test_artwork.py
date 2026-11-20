"""Exercise the exporter and its actual files, with independent source crops."""
import importlib.util
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'tools/build-artwork.py'
ASSETS = ROOT / 'mods/one-piece/assets'
STATES = ('idle', 'working', 'blocked', 'error', 'done')
BANDS = [(41, 175), (218, 404), (447, 610), (653, 793), (820, 1029),
         (1051, 1246), (1298, 1435), (1467, 1667), (1694, 1868)]
RECIPES = {
    'sunny': ('prototype/custom-trial/assets/sunny.png', 128, 116, [0, 1, 2, 3, 2, 1], [52]*6),
    'luffy-idle': ('prototype/custom-trial/assets/luffy.png', 64, 56, list(range(4)), [175, 25, 20, 40]),
    'luffy-working': ('prototype/custom-trial/assets/luffy.png', 64, 56, list(range(4, 8)), [33]*4),
    'flag': ('prototype/flow/assets/straw-hat-flag.png', 32, 28, list(range(4)), [24]*4),
}
for character, start, limit in [('chopper', 0, 44), ('franky', 12, 56), ('pirate', 24, 56)]:
    for state, offset, delay in [('idle', 0, 85), ('working', 4, 22), ('blocked', 8, 70)]:
        RECIPES[f'{character}-{state}'] = (
            'prototype/flow/assets/worker-states-v1.png', 64, limit,
            list(range(start+offset, start+offset+4)), [delay]*4)

APPROVED_PORTRAITS = {
    'crew-shanks': (19, 4), 'crew-kaido': (20, 5), 'crew-lucky-roux': (18, 7),
    'crew-jozu': (18, 4),
    'crew-brook': (24, 15), 'crew-compote': (26, 18), 'crew-jack': (28, 8),
    'crew-black-maria': (28, 12), 'crew-atmos': (24, 10), 'crew-oden': (26, 9),
    'crew-petermoo': (24, 11), 'crew-mr-momora': (22, 13), 'crew-amande': (21, 13),
    'crew-perospero': (23, 13), 'crew-mont-d-or': (23, 10), 'crew-smoothie': (28, 12),
}


def im(*args):
    return subprocess.check_output(['magick', *map(str, args)])


def opaque(rgba):
    return b''.join(rgba[i:i+4] if rgba[i+3] else bytes(4) for i in range(0, len(rgba), 4))


def decoded(path):
    return (im('identify', '-format', '%W %H %T %D\n', path),
            im(path, '-coalesce', '-depth', '8', 'rgba:-'),
            b'NETSCAPE2.0\x03\x01\x00\x00' in path.read_bytes())


def source_boxes(path):
    width, height = map(int, im('identify', '-format', '%w %h', path).split())
    rows = BANDS if 'worker-states' in str(path) else (
        [(0, 444), (444, 887)] if 'luffy' in str(path) else [(0, height)])
    boxes = []
    for top, bottom in rows:
        for col in range(4):
            left = int(col*width/4 + .5)
            right = int((col+1)*width/4 + .5)
            geometry = f'{right-left}x{bottom-top}+{left}+{top}'
            box = im(path, '-crop', geometry, '+repage', '-alpha', 'extract',
                     '-threshold', '62.745098039215686%', '-format', '%@', 'info:').decode()
            w, h, x, y = map(int, re.fullmatch(r'(\d+)x(\d+)\+(\d+)\+(\d+)', box).groups())
            boxes.append((w, h, x+left, y+top))
    return boxes


class ArtworkTests(unittest.TestCase):
    def test_export_contract(self):
        self.assertTrue(SCRIPT.is_file(), 'native artwork exporter is missing')
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)
            subprocess.run([sys.executable, str(SCRIPT), '--output', directory], check=True)
            expected_names = {name+ext for name in RECIPES for ext in ('.gif', '.png')}
            for sheet in (ROOT / 'prototype/crew-artwork').glob('*-study-v1.png'):
                name = sheet.name.removesuffix('-study-v1.png')
                ship = name in ('red-force', 'queen-mama-chanter', 'mammoth',
                                'polar-tang', 'moby-dick', 'oro-jackson', 'victoria-punk')
                names = [f'crew-{name}'] if ship else [f'crew-{name}-{state}' for state in STATES]
                if not ship:
                    portrait = f'portrait-crew-{name}.png'
                    expected_names.add(portrait)
                    expected_names.add(f'lookup/crew-{name}.png')
                    self.assertEqual(im('identify', '-format', '%w %h', output / portrait), b'28 28')
                    self.assertEqual((ASSETS / portrait).read_bytes(), (output / portrait).read_bytes())
                for animation in names:
                    expected_names.update(animation+ext for ext in ('.gif', '.png'))
                    gif = output / (animation+'.gif')
                    size = 128 if ship else 64
                    self.assertEqual(im('identify', '-format', '%w %h\n', gif).decode().splitlines(), [f'{size} {size}']*4)
                    raw = im(gif, '-coalesce', '-depth', '8', 'rgba:-')
                    stride = size*size*4
                    self.assertGreater(len({raw[i:i+stride] for i in range(0,len(raw),stride)}), 1)
                    for ext in ('.gif', '.png'):
                        self.assertEqual(decoded(ASSETS / (animation+ext)), decoded(output / (animation+ext)))
            # The whole approved sheet is decoded once and sliced here, so the expected cell shares no crop rule with the exporter.
            sheet = im(ROOT / 'prototype/flow/assets/machine-islands-v1.png', '-depth', '8', 'rgba:-')
            self.assertEqual(len(sheet), 256*64*4)
            for index in range(8):
                for row, suffix in enumerate(('', '-fog')):
                    island = f'island-{index}{suffix}.png'
                    expected_names.add(island)
                    cell = b''.join(sheet[((row*32+y)*256+index*32)*4:((row*32+y)*256+index*32+32)*4] for y in range(32))
                    self.assertEqual(im(output / island, '-depth', '8', 'rgba:-'), cell)
                    self.assertEqual((ASSETS / island).read_bytes(), (output / island).read_bytes())
            self.assertEqual({str(p.relative_to(output)) for p in output.rglob('*') if p.is_file()}, expected_names)
            before = {str(p.relative_to(output)): p.read_bytes() for p in output.rglob('*') if p.is_file()}
            sources = {}
            for name, (source, size, limit, order, delays) in RECIPES.items():
                with self.subTest(name=name):
                    path = ROOT / source
                    if source not in sources:
                        sources[source] = source_boxes(path)
                    boxes = sources[source]
                    group = boxes[(order[0]//12)*12:(order[0]//12+1)*12] if 'worker' in source else boxes
                    scale = limit / max(max(b[0], b[1]) for b in group)
                    gif, png = output / (name+'.gif'), output / (name+'.png')
                    metadata = im('identify', '-format', '%w %h %T %D\n', gif).decode().splitlines()
                    pixels = size*2 if name == 'flag' else size
                    self.assertEqual(metadata, [f'{pixels} {pixels} {d} Background' for d in delays])
                    self.assertIn(b'NETSCAPE2.0\x03\x01\x00\x00', gif.read_bytes())
                    raw = im(gif, '-coalesce', '-depth', '8', 'rgba:-')
                    stride = pixels*pixels*4
                    frames = [raw[i:i+stride] for i in range(0, len(raw), stride)]
                    self.assertEqual(len(frames), len(order))
                    self.assertGreater(len(set(frames)), 1)
                    for index, source_index in enumerate(order):
                        w, h, x, y = boxes[source_index]
                        dw, dh = int(w*scale+.5), int(h*scale+.5)
                        dx = 2 if name == 'flag' else int((size-dw)/2+.5)
                        dy = size-3-dh
                        expected = im('-size', f'{size}x{size}', 'xc:none', '(', path,
                                      '-crop', f'{w}x{h}+{x}+{y}', '+repage',
                                      '-sample', f'{dw}x{dh}!', ')', '-geometry', f'+{dx}+{dy}',
                                      '-compose', 'Over', '-composite', '-depth', '8', 'rgba:-')
                        if name == 'flag':
                            rows = [expected[y*size*4:(y+1)*size*4] for y in range(size)]
                            expected = b''.join(b''.join(row[x:x+4]*2 for x in range(0, len(row), 4))*2
                                                for row in rows)
                        # A wrong row, column, scale, or disposal leaks into this silhouette.
                        self.assertEqual(frames[index][3::4], bytes(255 if a >= 128 else 0 for a in expected[3::4]))
                        self.assertIn(0, frames[index][3::4])
                        self.assertIn(255, frames[index][3::4])
                        self.assertFalse(any(frames[index][(pixels-3)*pixels*4+3::4]))
                        if index == 0:
                            actual_png = im(png, '-depth', '8', 'rgba:-')
                            self.assertEqual(actual_png, expected)
                    self.assertEqual(decoded(ASSETS / png.name), decoded(png))
                    self.assertEqual(decoded(ASSETS / gif.name), decoded(gif))
            subprocess.run([sys.executable, str(SCRIPT), '--output', directory], check=True)
            self.assertEqual(before, {str(p.relative_to(output)): p.read_bytes() for p in output.rglob('*') if p.is_file()})

    def test_lookup_frames_match_every_decoded_gif_pixel(self):
        sheets = sorted((ASSETS / 'lookup').glob('crew-*.png'))
        self.assertEqual(len(sheets), 155)
        for sheet in sheets:
            raw = im(sheet, '-depth', '8', 'rgba:-')
            self.assertEqual(len(raw), 512*640*4)
            for row, state in enumerate(('idle', 'working', 'done', 'blocked', 'error')):
                frames = im(ASSETS / f'{sheet.stem}-{state}.gif', '-coalesce', '-depth', '8', 'rgba:-')
                self.assertEqual(len(frames), 4*64*64*4)
                for col in range(4):
                    with self.subTest(sheet=sheet.name, state=state, frame=col):
                        cell = b''.join(raw[((row*128+y)*512+col*128)*4:((row*128+y)*512+col*128+128)*4] for y in range(128))
                        frame = frames[col*64*64*4:(col+1)*64*64*4]
                        doubled = b''.join(b''.join(frame[(y*64+x)*4:(y*64+x+1)*4]*2 for x in range(64))*2 for y in range(64))
                        self.assertEqual(cell, doubled)

    def test_gestures_keep_the_approved_pixels(self):
        sheets = sorted((ROOT / 'prototype/crew-artwork').glob('*-gestures-v1.png'))
        self.assertEqual(len(sheets), 155)
        for sheet in sheets:
            name = sheet.name.removesuffix('-gestures-v1.png')
            # The sheet is decoded whole and sliced here, so the expected cells share no crop rule with the exporter.
            raw = im(sheet, '-depth', '8', 'rgba:-')
            self.assertEqual(len(raw), 256*256*4)
            cell = lambda row, col: b''.join(raw[((row*64+y)*256+col*64)*4:((row*64+y)*256+col*64+64)*4] for y in range(64))
            for row, (state, delay) in enumerate([('blocked', 70), ('error', 70), ('done', 85), ('idle', 85)]):
                with self.subTest(name=name, state=state):
                    gif = ASSETS / f'crew-{name}-{state}.gif'
                    self.assertEqual(im('identify', '-format', '%w %h %T %D\n', gif).decode().splitlines(),
                                     [f'64 64 {delay} Background']*4)
                    frames = im(gif, '-coalesce', '-depth', '8', 'rgba:-')
                    for col in range(4):
                        actual = frames[col*64*64*4:(col+1)*64*64*4]
                        self.assertEqual(actual[3::4], cell(row, col)[3::4])
                        # A GIF frame holds 256 colors, so only the idle row, approved from the shipped GIF, keeps every color.
                        if state == 'idle':
                            self.assertEqual(opaque(actual), opaque(cell(row, col)))
                    if state != 'idle':
                        self.assertEqual(im(ASSETS / f'crew-{name}-{state}.png', '-depth', '8', 'rgba:-'), cell(row, 0))

    def test_portraits_match_the_approved_head_crops(self):
        # Crop origins measured for the reviewed mock; a changed crop rule moves these faces.
        for name, (x, y) in APPROVED_PORTRAITS.items():
            with self.subTest(name=name):
                expected = im(ASSETS / f'{name}-working.png', '-crop', f'28x28+{x}+{y}', '+repage', '-depth', '8', 'rgba:-')
                self.assertEqual(im(ASSETS / f'portrait-{name}.png', '-depth', '8', 'rgba:-'), expected)

    def test_crew_frames_hold_one_pose_on_the_baseline(self):
        # A pose crossing its sheet's row line used to leave detached pieces of the
        # next row under sleeping sprites and lift them off the baseline.
        for sheet in sorted((ROOT / 'prototype/crew-artwork').glob('*-study-v1.png')):
            name = sheet.name.removesuffix('-study-v1.png')
            for state in STATES:
                gif = ASSETS / f'crew-{name}-{state}.gif'
                if not gif.exists():
                    continue
                alpha = im(gif, '-coalesce', '-alpha', 'extract', '-depth', '8', 'gray:-')
                for frame in range(len(alpha)//(64*64)):
                    with self.subTest(animation=gif.name, frame=frame):
                        pixels = alpha[frame*64*64:(frame+1)*64*64]
                        rows = [y for y in range(64) if any(pixels[y*64:(y+1)*64])]
                        self.assertEqual(rows, list(range(rows[0], 61)))

    def test_crew_chopper_keeps_the_original_smaller_scale(self):
        for state in STATES:
            alpha = im(ASSETS / f'crew-chopper-{state}.gif', '-coalesce',
                       '-alpha', 'extract', '-depth', '8', 'gray:-')
            for frame in range(len(alpha)//4096):
                with self.subTest(state=state, frame=frame):
                    pixels = alpha[frame*4096:(frame+1)*4096]
                    occupied = [(i % 64, i // 64) for i, a in enumerate(pixels) if a]
                    self.assertLessEqual(max(x for x, _ in occupied)-min(x for x, _ in occupied)+1, 44)
                    self.assertLessEqual(max(y for _, y in occupied)-min(y for _, y in occupied)+1, 44)

    def test_rejects_missing_worker_bands_and_empty_cells(self):
        self.assertTrue(SCRIPT.is_file(), 'native artwork exporter is missing')
        spec = importlib.util.spec_from_file_location('artwork', SCRIPT)
        artwork = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(artwork)
        with tempfile.TemporaryDirectory() as directory:
            sheet = Path(directory) / 'empty.png'
            im('-size', '40x90', 'xc:none', sheet)
            with self.assertRaisesRegex(ValueError, 'nine worker'):
                artwork.extract_boxes(sheet, 9, worker=True)
            with self.assertRaisesRegex(ValueError, 'Empty frame'):
                artwork.extract_boxes(sheet, 1)


if __name__ == '__main__':
    unittest.main()
