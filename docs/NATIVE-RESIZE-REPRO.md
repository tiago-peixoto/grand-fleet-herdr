# Native repaint reproduction

Herdr App 0.1.15 intermittently loses static text after zooming a mod pane or restoring its grid.
The defect also occurs in the minimal panel below, without artwork, terminal output, or polling.
This narrows the investigation to native layout and repaint behavior but does not establish the runtime cause.

## Reproduce

Create a disposable mod with this main.js and a mod.json containing `{"place":"none"}`.
Open the mod as a tab, then split a personal terminal beside it.
Use the pane header to zoom the mod and restore its grid.
Static text can disappear while the colored rectangle remains visible.
Clicking the panel's interactive rectangle requests a repaint and restores its text.
The defect also occurred when the mod already held focus before zooming.

```js
import { View, div } from 'gpui-kit';
import { v_flex } from 'gpui-base';

export default class Probe extends View {
  render() {
    return v_flex().size_full().bg('#142329').p(18).gap(12)
      .child(div().text_color('#ffffff').child('Static text must survive resizing'))
      .child(div().id('button').h(30).bg('#e8bd70')
        .on_click((_event, cx) => cx.notify()).child('Interactive text'));
  }
}
```

## Investigation limits

Removing the inspection editor did not eliminate the defect.
A stable root identifier with on_size_change calling cx.notify did not reliably eliminate it in the minimal panel.
The attempted window.refresh callback failed because window was undefined in that handler.
The application log records this error, although herdr-app status reported no errors.
That attempt does not establish whether the runtime supports a useful refresh operation elsewhere.
Deferring notification by 50 milliseconds after on_size_change also failed when enlarging the pane.
Application logs confirmed that the resize callback ran.
Changing text element identifiers on each resize did not resolve the enlargement failure.
These attempts used a disposable probe and were not added to the production mod.
None of these diagnostic changes establishes a fix.
The production mod does not use a repeated window-wide refresh workaround.

## Source investigation

The public v0.1.15 guide matches the installed guide byte for byte.
Its sample renders ordinary text without a resize callback.
The documented callback reports geometry changes and does not establish an extra repaint obligation for mods.

[ScriptView](https://github.com/herdrdev/herdr-app/blob/v0.1.15/vendor/gpui-kit/crates/shell/src/view.rs) separates JavaScript snapshots from native drawing.
A native redraw can reuse a snapshot without calling the JavaScript render method.
Counting JavaScript renders therefore cannot establish whether native drawing occurred.
The [native cache](https://github.com/herdrdev/herdr-app/blob/v0.1.15/vendor/gpui-pre/src/view.rs#L462-L525) requires matching bounds, clipping bounds, and text style before reuse.
Changed geometry must rebuild the subtree.

The next diagnostic must compare cache decisions, text layout, and glyph emission across successful, failed, and click-restored frames.
No instrumented failing frame has been captured.
The evidence does not yet identify a specific cache, clipping, or graphics defect.

Upstream commit d6f6106cec444f82c1d59bd8a25f107990ec0d85 is 47 commits beyond v0.1.15.
Comparison found no changes in the inspected native text, view-cache, scene, or Metal rendering files.
The newer terminal glyph-centering change affects terminal rendering rather than ordinary mod text.
No matching upstream fix was identified.

The native shot command renders the previously recorded scene without repeating layout.
During the window-capture outage, a shot still showed remote-worker after live state selected the newly recovered secondmate inspection.
That stale scene cannot verify the current layout or diagnose a new resize attempt.
Current visual verification requires native presentation to resume.

## Independent header correction

A separate header defect used the focused pane to decide whether to offer Restore grid.
A personal terminal can retain focus while another pane is zoomed.
The header now selects a zoomed pane in the active tab before falling back to the focused pane.
A regression test covers that selection, and the native header successfully restored the two-pane grid.
That correction does not resolve disappearing text.
