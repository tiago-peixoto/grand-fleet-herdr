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
The synchronized failing frames are recorded in the follow-up sections below.
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

## Reproduction after native capture resumed

After unlocking the Mac, native capture and input worked again in Grand Fleet Lab.
Focusing worker inspection reproduced missing header text, worker title, artwork, and part of its status label.
Terminal output and the return button remained visible.
A later native screenshot showed the missing content again without another interaction.
This establishes intermittent presentation failure, but does not identify which rendering stage caused it.
The next comparison should include the failed frame and spontaneous recovery frame.

## Instrumented cache comparison

An isolated source build of v0.1.15 added optional native view-cache logging and a cache-bypass switch.
The diagnostic application used a separate home and the disposable test core.
With cache reuse enabled, enlarging the minimal panel through pane.zoom removed both text labels while retaining its resized rectangle.
Clicking the rectangle restored both labels.
Restarting the diagnostic application with native view-cache reuse disabled reproduced the same missing text after enlargement.
Its log recorded 172 cache decisions, all misses with bypass enabled, through the observed failing frame.
This rules out that cache bypass as a sufficient fix.
It does not rule out other retained layout state or establish the stage that loses text.
The next trace targets script snapshots, text layout, and glyph emission.
No diagnostic runtime change is included in the mod or installer.

## Text trace follow-up

A second diagnostic build traced snapshot replay, text measurement, clipping, and glyph submission.
The saved zoom trace contains 31 paint passes for both labels, including 18 enlarged passes.
Each pass submitted 33 glyph sprites for the static label and 16 for the interactive label.
Bounds, clipping masks, and opacity were valid in those passes.
The native screenshot after enlargement showed both labels.
No missing-label screenshot was synchronized with this trace, so it does not isolate the failure.
Further capture attempts failed with cgWindowNotFound for both isolated applications while their processes remained alive.
No application was restarted to address that capture failure.
The next useful diagnostic correlates a missing-label frame with graphics texture lookup and draw submission.
No production rendering change is justified by this trace.

## Unlocked native trace reproduction

After unlocking, the existing diagnostic process showed both labels in the split view.
Zooming the diagnostic pane reproduced both missing labels while its yellow rectangle remained visible.
The native screenshot came from the application window, not the last-frame command.
The immediately copied trace is saved at .superpowers/native/text-trace-unlocked-missing.log.
Its final text passes have valid bounds, clipping masks, and full opacity.
They submit 33 monochrome glyph sprites for the static label and 16 for the interactive label.
Native view-cache reuse remained disabled.
This narrows the investigation beyond text layout and sprite submission but does not identify the rendering failure.
No runtime workaround is included in the mod.

## Metal drawing trace

A third isolated build logged glyph records, rectangles, drawing batches, and texture lookup.
Restoring the split view retained both labels.
Enlarging the probe then removed both labels while retaining its yellow rectangle.
Clicking the rectangle restored both labels again.
Native screenshots verified each transition.
The failed capture has 240 recorded frames and no missing-texture reports.
Its final frame contains all 49 glyphs across the two labels.
The restored frame contains identical glyph records, including bounds, clipping, opacity, transformation, and atlas coordinates.
Both frames have identical drawing batches.
No later opaque rectangle covers either label in those records.
These observations exclude missing texture lookup and changed drawing order as explanations for this captured failure.
They do not establish whether the texture contents, graphics execution, or frame presentation causes the loss.
The next diagnostic compares numeric glyph coverage in the texture between failed and restored frames.
The trace files remain in .superpowers/native/metal-trace-missing.log and .superpowers/native/metal-trace-restored-frame.log.
Only the isolated diagnostic runtime contains instrumentation.

## Texture coverage comparison

A fourth diagnostic build added numeric coverage measurements for glyph textures in shared memory.
The same split, enlarge, and click sequence reproduced and restored both missing labels.
The failed and restored frames contain identical coverage measurements for all 49 glyphs.
Their complete logged Metal records also match, including glyphs, rectangles, batches, and texture availability.
The saved evidence is .superpowers/native/atlas-trace-missing.log and .superpowers/native/atlas-trace-restored-frame.log.
This comparison does not support empty glyph textures as the cause of the captured failure.
The next investigation must distinguish graphics execution from frame presentation and confirm which frame reaches the screen.
No production fix has been established.

## Presentation and screenshot side effects

The saved presentation trace reports 620 submitted frames, 620 completed command buffers, and 620 presentation callbacks.
Every recorded completion reports Completed while the native capture still shows missing labels.
The evidence is .superpowers/native/present-trace-missing-completed.log.
A subsequent diagnostic build waits for graphics completion after every live draw.
Enlarging the pane still removes both labels.
This rules out that synchronization change as a sufficient fix.

The shot command renders both labels in its offscreen image.
A native capture immediately afterward also shows both labels restored.
Repeating split, enlarge, native capture, shot, and native capture reproduces this recovery.
A read-only ls request between the failed capture and shot leaves both labels missing.
Therefore, shot is not a neutral observation of this failure and cannot provide native acceptance evidence.
The trace is .superpowers/native/sync-trace-shot-recovery.log.

Offscreen rendering recreates the intermediate textures used for paths.
A diagnostic switch tested that operation before every live draw while preserving the completion wait.
The build passed, but split-to-enlarged navigation still removed both labels in the native capture.
The evidence is .superpowers/native/path-reset-missing.log.
Recreating those textures is therefore not sufficient either.
The next investigation should compare uploaded instance data and live drawing output with the offscreen rendering path.
No diagnostic switch is part of the production mod or installer.

## Live drawable pixels and foreground comparison

A subsequent diagnostic copies a small region from the actual live drawable before presentation.
The region starts at pixel 592,192 and measures 512 by 64 pixels, covering the static label.
After graphics completion, the diagnostic counts pixels whose three color components exceed 200.
It does not render an offscreen replacement or invoke shot.
The saved trace contains 149 measurements.
The initial frame contains zero white pixels, and every subsequent measurement contains 3,125 white pixels.
Both labels nevertheless remain absent from the native capture after enlargement.
The trace is .superpowers/native/drawable-readback-missing.log.
This establishes text pixels in the submitted live drawing output, rather than merely valid glyph inputs.
It does not establish what the user sees on the physical display.

Background keyboard input also opened a command palette in the accessibility tree without showing it in the capture.
Raising the diagnostic window and reopening the palette made the palette visible in the capture.
However, foreground input did not eliminate the text discrepancy.
With the window raised, Command-Shift-Return restored the split view with both labels visible.
Repeating that shortcut enlarged the probe and removed both labels from the capture again.
The corresponding live frame, drawable 723, still reported 3,125 white pixels and successful completion and presentation.
The diagnostic window therefore remains available for direct human comparison with the captured result.
Neither a rendering fix nor a capture-tool defect has been established.
Further rendering changes require evidence that distinguishes presentation from capture.
