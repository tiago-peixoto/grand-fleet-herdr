# Approved terminal simplification

The captain approved this decision on 2026-11-14, including direct typing into worker terminals.
This replaces the inspection-only design in historical prototypes and plans.

- Each crewmate has one actual Herdr terminal.
- Clicking a crewmate focuses that terminal and accepts typing directly.
- Machines, ships, and character artwork remain in the sidebar.
- Ships only collapse or expand their characters.
- Personal terminals are ordinary Herdr terminals.
- Add terminal opens a tab on the same machine in the selected crewmate's original folder.
- Normal Herdr splits inherit the current folder, as documented by Herdr.
- Herdr owns the tab bar, terminal rendering, grids, resizing, zoom, closing, and reconnection.
- The mod adds crewmate identity to terminal headers without custom close confirmations or arrangement presets.

Existing parked terminals are adopted into native panes without launching another worker.
Their previous workspace is reused when available, preserving adjacent personal terminals.
The obsolete inspection pane closes only after the actual terminal has a pane in that tab.
A legacy inspection pane provides an Open terminal action until selected.
Old placeholder cleanup remains available only for leftovers from older versions.
Compatibility close shortcuts now forward to Herdr's native close commands.

Herdr's installed `hc --skill` documents JSON `cwd` as the launch folder and `foreground.cwd` as the current folder.
The installed `herdr.d.ts` documents `tab.new {space, folder}` and `pane.split {pane, direction}`.
These APIs preserve remote machine selection through the destination workspace.
