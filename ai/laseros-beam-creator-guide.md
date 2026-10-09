# LaserOS Beam Creator: guide for AI assistants

This file tells an AI assistant (ChatGPT, Claude, Gemini or similar) how to write a **Beam Creator project file (`.ldbc`)** for LaserOS, the app that drives LaserCube laser projectors. The person who gave you this file will describe a beam pattern or animation. Your job is to write the file. They import it into LaserOS and play it on their LaserCube.

Written for LaserOS 0.18 (Beam Creator file version 1). Every name, range and default below was checked against LaserOS's Beam Creator code, and the examples were loaded and run with that code. Where LaserOS accepts a value that breaks the effect (for example 0 frames), the tables give the range that works.

## 1. How to answer

1. Read the request. If one thing is genuinely unclear and changes the result a lot, ask one short question. Otherwise pick sensible values and go.
2. Plan the layers: which patterns, where they sit, what moves, which colours, how fast (in frames, see section 3).
3. Write one complete `.ldbc` file that follows section 2 and the rules in section 8 (one file per design; only when the request needs several designs, such as the parts of a longer piece, give each its own clearly named file). Show only final files: no drafts, no partial files, no placeholders. Use only the pattern and effect types in this guide. If nothing does exactly what was asked (for example a random angle, or speeding up over time), build it from what is here (section 7 has ideas) and say so in one line.
4. If you can create files for download, give a file named after the design, for example `cyan beam sweep.ldbc`. If you can't, put the whole file in a single code block and tell the person to save it as plain text with a name ending in `.ldbc`.
5. After the file, add at most three short lines: what it shows, and how to bring it in: in LaserOS open **Beam Creator**, click the **import** icon ("import custom beam project into playlists"; on a phone: **Import "Custom Beam"**) and pick the file. It appears in **Playlists → Custom Beams**. On a computer, select it there and click the pencil (**Edit current item**) to open it in Beam Creator, check it in the preview with the laser off (Laser button on LASER OFF, or NO LASER when no cube is connected), change anything with the sliders, then save.

Beam Creator can't write text, show a logo or picture, or draw free shapes. LaserOS has its own tools for those (Text, logo import and Draw: see "Making Content in LaserOS" in the LaserCube manual, https://wiki.laseros.com/docs/guides/ultra-mk2-pro-manual/#making-content-in-laseros). Say so, and offer the closest Beam Creator design if it helps.

Keep designs simple enough for a laser: a few layers drawn cleanly look better than a crowded frame (see section 7).

## 2. The file

A `.ldbc` file is JSON. The top level is always:

```json
{
  "version": 1,
  "id": "BeamCreatorObject",
  "data": {
    "targetFPS": 60,
    "renderQuality": 0,
    "isBpmReactive": false,
    "defaultBpm": 120,
    "beamPatterns": [ ...layers... ]
  }
}
```

- `targetFPS`: frames per second, one of 60, 55, 50, 45, 40, 35, 30, 24, 48, 90, 120. Use 60 unless asked. Always include it.
- `renderQuality`: 0 = High, 1 = Normal, 2 = Low. Use 0.
- `isBpmReactive` / `defaultBpm` (whole number 1 to 300, the song's tempo; 0 would drop every timing marked (B) to its minimum): see section 3. Leave out or set false unless the person wants the timing to follow the music's tempo.
- `beamPatterns`: the layers. Use at most 10: Beam Creator's add and duplicate buttons stop at 10. Later layers are drawn after earlier ones; there is no stacking order to worry about.

Each layer:

```json
{
  "beamPatternType": "Simple Shapes",
  "enabled": true,
  "guiControlManager": {
    "version": 1,
    "presets": [
      {"globalId": "version", "version": 2},
      {"globalId": "shapetype", "index": 0},
      {"globalId": "size", "sliderValue": 0.5},
      {"globalId": "Color 1", "hueSliderValue": 765, "saturationValue": 0}
    ]
  },
  "beamEffects": [ ...effects... ]
}
```

Each effect:

```json
{
  "beamEffectType": "Position",
  "enabled": true,
  "guiControlManager": {
    "version": 1,
    "presets": [
      {"globalId": "offsetx", "sliderValue": 0.5}
    ]
  }
}
```

A preset sets one control. Its `globalId` is the control's id from the tables in sections 5 and 6 (exact spelling, including spaces and capitals). The value key depends on the kind of control:

| Kind in the tables | Preset |
|---|---|
| int (whole number) | `{"globalId": "numdots", "sliderValue": 6}` |
| float | `{"globalId": "width", "sliderValue": 0.75}` |
| switch | `{"globalId": "repeating", "isChecked": true}` |
| list | `{"globalId": "direction", "index": 2}` (0-based position in the list shown) |
| colour | `{"globalId": "Color 1", "hueSliderValue": 1020, "saturationValue": 0}` |

Only write presets for controls you change. Every control you leave out keeps the default shown in the tables. The order of presets doesn't matter.

## 3. Space, time and colour

**Space.** The projection area runs from x = -1 (left edge) to x = 1 (right edge) and y = -1 (bottom) to y = 1 (top). (0, 0) is the centre. Patterns are drawn around the centre; effects move them. Anything beyond ±1 falls outside the projection area and isn't drawn.

**What people see.** With haze or fog in the air, a dot that stays still is seen as a straight beam from the cube, and a line becomes a flat sheet (a fan) of light. On a wall they are dots and lines. "Beams" in a request usually means dots (Horizontal Beam Dots or Vertical Beam Dots); "fan", "sheet" or "wall of light" means a line.

**Time.** Beam Creator counts time in frames. At `targetFPS` 60, 60 frames = 1 second, 30 frames = half a second, 120 frames = 2 seconds. To fit a part of a song: seconds × targetFPS = frames (a 7-second build at 60 FPS = 420 frames). Controls named Frames, Start Delay, Dwell and similar take frames. Limits: a Start Delay or Dwell is at most 600 frames (10 seconds at 60 FPS), Frames at most 1200 (20 seconds). A Beam Creator design is a clip or a loop, not a whole show: for a longer sequence or several song sections, make one design per part and tell the person to line them up on the LaserOS Timeline (it plays them to the song).

**Loop or play once.** Each moving effect either repeats for ever (`repeating` true) or plays once plus `repeats` extra times (`repeating` false); after that it stays at its end state. Defaults differ per effect (see the tables), so set `repeating` explicitly when it matters. If any enabled effect repeats for ever, the design loops for ever; otherwise its length is that of its longest effect. LaserOS uses that length only when the design is dropped onto the Timeline (the block starts that long; a looping design gets the Timeline's default length; either can be stretched).

**Music.** "Trig on Beat", "Beat Advance" and "On BPM Beat" options react to the beats LaserOS hears from the music it is listening to. Without music there are no beats: a beat-triggered Power Fader then fades once at the start and stays at End Power, so use an End Power above 0 (for example 0.2) if the layer should stay visible between beats or without music. With `isBpmReactive` true and `defaultBpm` set to the song's tempo (for example 128), every control marked (B) in the tables is written for that tempo and LaserOS speeds it up or slows it down to match the tempo it detects.

**Colour.** A colour control has `hueSliderValue` and `saturationValue`.

| Colour | hueSliderValue |
|---|---|
| white | -1 |
| red | 0 (1530 is red too) |
| orange | 128 |
| yellow | 255 |
| lime | 383 |
| green | 510 |
| spring green | 638 |
| cyan | 765 |
| sky blue | 893 |
| blue | 1020 |
| purple | 1148 |
| magenta | 1275 |
| pink | 1403 |

Any whole number from -1 to 1530 works: the scale runs red → yellow → green → cyan → blue → magenta → red. `saturationValue` (0 to 255) washes the colour towards white: 0 = full colour, 128 = pastel, 255 = white. Use 0 unless asked for pale colours.

## 4. Effects work in order

Effects that move a layer (Position, Random Position, Movement, Simple Paths, Fixed Rotation, Rotation, Scale) are applied from the **bottom of the list up**: the last effect moves the pattern first, then the one above it moves that result, and so on. Rotation and Scale turn or grow what is below them in the list around one point: the centre of the projection area, or wherever the move effects above them have put it. A pattern is drawn around its own centre, so with no move below them it spins or grows in place; a pattern that an effect below them has moved swings or grows around that point.

- Spin a shape in place somewhere else: `Position` first, then `Rotation` (Rotation turns the shape around its own centre, then Position moves it).
- Make a shape orbit the centre: `Rotation` first, then `Position` (Position moves it out, then Rotation swings it around the centre).
- Grow a shape where it stands: `Position` first, then `Scale`. With `Scale` first and `Position` after it, the distance from the centre grows and shrinks too.
- Tilt a moving line: `Movement` first, then `Fixed Rotation` tilts the line itself; `Fixed Rotation` first, then `Movement` tilts the direction it moves in too.

Power Fader, Strobe and Color Sequence don't move anything; their place in the list doesn't matter. Several faders/strobes on one layer: the darkest one wins.

## 5. Patterns (layers)

Use these `beamPatternType` values exactly. Name in Beam Creator in brackets.

### "Horizontal Beam Dots" (Horizontal Beams) and "Vertical Beam Dots" (Vertical Beams)

A row (or column) of dots, evenly spaced and centred on (0, 0). In haze: a row of beams.

| globalId | kind | range | default | meaning |
|---|---|---|---|---|
| numdots | int | 1 to 18 | 6 | number of dots (Beam Count) |
| width | float | 0 to 1 | 1.0 | how far the row reaches: the dots spread over about -width to +width |
| bright | int | 1 to 8 | 1 | Brightness: keep 1 (higher values draw each dot several times and can flicker) |
| direction | list | 0 Static Beams, 1 Slide Right, 2 Slide Left | 0 | Mode. For Vertical Beam Dots: 1 Slide Up, 2 Slide Down. Sliding moves the colours along the row |
| speed | int (B) | 1 to 240 | 60 | Slide Speed: frames to slide from one dot to the next (smaller = faster) |
| singlecolor | switch | | true | true: every dot uses "Dot 1 Color" |
| "Dot 1 Color" … "Dot 18 Color" | colour | | white | colour of each dot (with singlecolor false) |

### "Horizontal Lines" (Horizontal Line) and "Vertical Lines" (Vertical Line)

One straight line through the centre, horizontal (or vertical), split into sections that can each have a colour.

| globalId | kind | range | default | meaning |
|---|---|---|---|---|
| numLines | int | 1 to 10 | 1 | number of sections (Num Sections) |
| width | float | 0 to 1 | 1.0 | the line runs from -width to +width |
| bright | int | 1 to 8 | 1 | Brightness: keep 1 |
| lineborder | switch | | false | adds short segments in bordercolor at both ends of the line and between the sections |
| borderwidth | int | 1 to 10 | 1 | length of each border segment, in hundredths of a unit (the area is 2 units wide) |
| bordercolor | colour | | white | border colour |
| singlecolor | switch | | true | true: the whole line uses "Line 1 Color" |
| "Line 1 Color" … "Line 10 Color" | colour | | white | colour of each section, left to right (bottom to top) |

### "Simple Shapes"

An outline shape centred on (0, 0). **Always include `{"globalId": "version", "version": 2}` in its presets** (without it LaserOS treats the file as an old one and changes some values).

| globalId | kind | range | default | meaning |
|---|---|---|---|---|
| version | (special) | | | always `{"globalId": "version", "version": 2}` |
| shapetype | list | 0 Circle, 1 Square, 2 Triangle, 3 Rectangle, 4 Hexagon, 5 Octagon | 0 | Shape |
| shapestyle | list | 0 Solid, 1 Dotted, 2 Dashed | 0 | Style |
| size | float | 0.01 to 1 | 0.5 | radius (half the width; Rectangle: half its width) |
| height | float | 0.01 to 1 | 0.5 | Rectangle only: half its height |
| numdots | int | 1 to 50 | 22 | Dotted: how many dots (Circle, Hexagon, Octagon: in total, at least 2 per side; Square, Rectangle, Triangle: per side). Dashed, or Solid with several colours: more = more, shorter dashes or colour stripes |
| numcolors | int | 1 to 8 | 1 | Colours: how many of "Color 1" … "Color 8" are used around the outline |
| "Color 1" … "Color 8" | colour | | white | the colours |
| dotmode | list | 0 Static Beams, 1 clockwise Beams, 2 anti-clockwise Beams | 0 | turns the dots, dashes or colour stripes around the outline (only with Dotted, Dashed or numcolors above 1) |
| speed | int (B) | 1 to 240 | 60 | speed of that turning: smaller = faster. To keep them still, use dotmode 0 |
| bright | int | 1 to 10 | 1 | Brightness: keep 1 |

A tiny solid circle (size 0.02 to 0.06) makes a good small "dot" that you can move with effects.

### "Sine Wave" and "Triangle Wave"

A wave across the whole width (x from -1 to 1), centred on y = 0.

| globalId | kind | range | default | meaning |
|---|---|---|---|---|
| height | float | 0 to 1 | 0.5 | wave height (amplitude): peaks reach +height and -height |
| cycles | float | 0.01 to 4 | 0.5 | how many waves fit across the width |
| wavespeed | float (B) | -10 to 10 | 0 | the wave travels: positive = to the left, negative = to the right, 0 = still. About 1 is slow, 3 lively, 10 very fast |
| linestyle | list | 0 Solid Line, 1 Dashed Line, 2 Dotted Line | 0 | Style |
| numdots | int | 15 to 50 | 20 | Dotted only: number of dots |
| bright | int | 1 to 8 | 1 | Dotted only: keep 1 |
| numcolors | int | 1 to 8 | 1 | how many of "Color 1" … "Color 8" are used along the wave |
| "Color 1" … "Color 8" | colour | | white | the colours |
| dashwidth | int | 1 to 16 | 2 | length of each dash, or of each colour band when numcolors is above 1 |
| colorslide | list | 0 Static, 1 Slide Left, 2 Slide Right | 0 | moves the colour bands along the wave (Solid or Dashed with numcolors above 1) |
| colorspeed | float (B) | 0 to 5 | 0.5 | speed of that colour slide |

### "VideoSpiral" (Video Spiral Wave)

Draws one of LaserOS's built-in animations as a spiral. Use it when the person asks for one of these animations (for example the Earth or a globe, fire, a skull, an orb) or for a "video"/"animated spiral" look; otherwise use the other patterns.

| globalId | kind | value |
|---|---|---|
| spiralanim | list by name | `{"globalId": "spiralanim", "index": N, "textAtIndex": "NAME"}`: Orb1 … Orb25 (index 1 to 25), "Skull" (27), "Fire" (29), "Earth" (30). The name decides; give the matching index too |
| applydefault | switch | true (use the animation's own settings; default) |

## 6. Effects

Use these `beamEffectType` values exactly. Name in Beam Creator in brackets. All frame counts are whole numbers. (B) = follows the tempo when `isBpmReactive` is true.

### "Position"

Moves the layer.

| globalId | kind | range | default | meaning |
|---|---|---|---|---|
| offsetx | float | -2 to 2 | 0 | move right (+) or left (-) |
| offsety | float | -2 to 2 | 0 | move up (+) or down (-) |
| delay | int | 0 to 600 | 0 | Start Delay: frames before the move takes effect (until then the layer sits at the centre) |

### "Fixed Rotation"

Turns the layer to a fixed angle.

| globalId | kind | range | default | meaning |
|---|---|---|---|---|
| rotangle | int | -180 to 180 | 0 | Z Angle in degrees: positive = clockwise, negative = anticlockwise (a flat turn) |
| rotanglex | int | -180 to 180 | 0 | X Angle: tilts the layer back, which squashes it vertically (cos of the angle) |
| rotangley | int | -180 to 180 | 0 | Y Angle: squashes it horizontally |
| delay | int | 0 to 600 | 0 | Start Delay |

### "Rotation" (Variable Rotation)

Spins the layer continuously around the centre (0, 0).

| globalId | kind | range | default | meaning |
|---|---|---|---|---|
| direction | list | 0 Clockwise, 1 Anti-Clockwise | 0 | |
| rotframes | int (B) | 5 to 1200 | 120 | frames for one full turn (smaller = faster) |
| rotate_z | switch | | true | flat spin |
| rotate_x | switch | | false | tumble forward (looks like the layer flips top over bottom) |
| rotate_y | switch | | false | tumble sideways (flips left over right) |
| repeating | switch | | true | Always Repeat |
| repeats | int | 0 to 100 | 0 | extra turns when repeating is false |
| delay | int (B) | 0 to 600 | 0 | Start Delay |

### "Movement"

Slides the layer in a straight line.

| globalId | kind | range | default | meaning |
|---|---|---|---|---|
| direction | list | 0 Vertical (start->end->start), 1 Vertical (start->end), 2 Horizontal (start->end->start), 3 Horizontal (start->end) | 0 | "start->end->start" goes there and back; "start->end" jumps back to the start each time |
| startpos | float | -2 to 2 | 0 | where it starts (x for Horizontal, y for Vertical) |
| endpos | float | -2 to 2 | 0 | where it ends. Set both: with both at 0 nothing moves |
| speed | int (B) | 5 to 1200 | 120 | Frames for one trip from start to end |
| dirdelay | int (B) | 0 to 600 | 0 | Direction Dwell: frames to pause at the end ("start->end->start": at both ends) before moving again |
| delay | int (B) | 0 to 600 | 0 | Start Delay |
| repeating | switch | | **false** | Always Repeat. Default false: it moves once and stops. Set true for a loop |
| repeats | int | 0 to 100 | 0 | extra trips when repeating is false |

Mirror image of a Movement on a copy of the layer: swap the signs of startpos and endpos (-0.9 and 0.8 become 0.9 and -0.8).

### "simplepaths" (Simple Paths)

Sends the layer along a path.

| globalId | kind | range | default | meaning |
|---|---|---|---|---|
| pathtype | list | 0 Rectangular, 1 Circular, 2 Ellipse, 3 Figure 8 (Vertical), 4 Figure 8 (Horizontal), 5 Linear Horizontal, 6 Linear Vertical, 7 Spiral | 0 | path shape |
| direction | list | 0 clockwise, 1 anti-clockwise, 2 loop start<->end, 3 loop end<->start (Linear paths: 0 start->end, 1 end->start, 2 start<->end, 3 end<->start) | 0 | |
| width | float | 0.01 to 1.5 | 0.5 | Circular/Spiral: radius. Ellipse: horizontal radius. Rectangular/Figure 8/Linear Horizontal: half width |
| height | float | 0.01 to 1.5 | 0.5 | Ellipse: vertical radius. Rectangular/Figure 8/Linear Vertical: half height |
| coils | float | 2 to 10 | 5 | Spiral only: number of turns |
| xpos | float | -2 to 2 | 0 | centre of the path, x |
| ypos | float | -2 to 2 | 0 | centre of the path, y |
| speed | int (B) | 5 to 1200 | 120 | Frames for one trip round the path |
| startpos | float | 0 to 100 | 0 | where on the path it starts, in % of the way round (50 = halfway). Circular paths start at the right (3 o'clock) at 0. Give copies different startpos values to spread them along the same path |
| steppath | switch | | false | Stepped Path: jump in steps instead of gliding |
| steps | int | 2 to 100 | 10 | number of steps |
| delay | int (B) | 0 to 600 | 0 | Start Delay |
| repeating | switch | | true | Always Repeat |
| repeats | int | 0 to 100 | 0 | extra trips when repeating is false |

### "RandomPosition" (Random Position)

Jumps the layer to random places inside a box.

| globalId | kind | range | default | meaning |
|---|---|---|---|---|
| randommode | list | 0 After User Delay, 1 On BPM Beat | 0 | jump every few frames, or on the music's beats |
| randomizedelay | int (B) | 1 to 600 | 60 | frames between jumps (mode 0) |
| beatratio | list | 0 "1:1", 1 "1:2", … 7 "1:8" | 0 | mode 1: jump every beat (0), every 2nd beat (1) … every 8th (7) |
| minposx / maxposx | float | -2 to 2 | -0.75 / 0.75 | box, x |
| minposy / maxposy | float | -2 to 2 | -0.75 / 0.75 | box, y |
| delay | int | 0 to 600 | 0 | Start Delay |
| randomalways | switch | | true | Continuous; false = stop after stopframes |
| stopframes | int | 1 to 600 | 120 | Stop After (frames) |

### "Scale"

Grows or shrinks the layer (around the centre, see section 4).

| globalId | kind | range | default | meaning |
|---|---|---|---|---|
| mode | list | 0 "Scale start->end", 1 "Scale in/out" | 0 | 0: grow from start to end, then jump back; 1: grow, then shrink back (smooth pulse) |
| startscale | float | 0 to 10 | 0 | Start Size (1 = the layer's own size, 0 = a point) |
| endscale | float | 0 to 10 | 1 | End Size |
| scalespeed | int (B) | 1 to 1200 | 60 | Frames for one grow (or shrink) |
| dirdelay | int (B) | 0 to 600 | 0 | Dwell: frames to hold at the end size (mode 1: at both ends) before starting again |
| delay | int (B) | 0 to 600 | 0 | Start Delay |
| scalex / scaley | switch | | true / true | scale only horizontally or only vertically by switching the other off |
| repeating | switch | | true | Always Repeat |
| repeats | int | 0 to 100 | 0 | |
| triggeronbeat | switch | | false | Trig on Beat: restart on the music's beats. Set repeating false too, or it also keeps running at its own speed between beats |
| beatratio | list | 0 "1:1" … 7 "1:8" | 0 | with triggeronbeat: every beat, every 2nd beat … |

At size 0 the whole layer sits on one spot, so a start or end size of 0 draws a single bright point for a moment. For a shape that appears from nothing, use a small size like 0.05 instead, or fade it in with Power Fader.

### "Power Fader"

Fades the layer's brightness.

| globalId | kind | range | default | meaning |
|---|---|---|---|---|
| mode | list | 0 "Fade start->end", 1 "Fade start->end->start" | 0 | |
| startpower | float | 0 to 1 | 0 | Start Power (0 = off, 1 = full) |
| endpower | float | 0 to 1 | 1 | End Power |
| speed | int (B) | 1 to 1200 | 60 | Frames for one fade |
| dirdelay | int (B) | 0 to 600 | 0 | Dwell: frames to hold at End Power (mode 1: at both ends) before fading again |
| delay | int (B) | 0 to 600 | 0 | Start Delay: the layer stays at startpower until then (so startpower 0 + delay = appear later) |
| repeating | switch | | **false** | Always Repeat (default false: fades once) |
| repeats | int | 0 to 100 | 0 | |
| triggeronbeat | switch | | false | Trig on Beat: restart the fade on the music's beats (a flash per beat with startpower 1, endpower 0) |
| beatratio | list | 0 "1:1" … 7 "1:8" | 0 | |

A single flash: startpower 1.0, endpower 0.0, speed 10 to 20 frames.

### "Strobe"

Switches the layer on and off. It starts with its Off Frames, then its On Frames, and repeats. During Start Delay the layer stays on.

Two layers flashing in turn (police lights, left/right): give both the same Strobe with On Frames equal to Off Frames, and give the second Strobe a `delay` of that many frames (for example on 4, off 4, delay 4).

| globalId | kind | range | default | meaning |
|---|---|---|---|---|
| startonframes | int (B) | 1 to 20 | 2 | On Frames |
| startoffframes | int (B) | 1 to 20 | 2 | Off Frames |
| delay | int (B) | 0 to 600 | 0 | Start Delay (the layer is on until then) |
| strobealways | switch | | true | Continuous; false = stop after stopframes |
| stopframes | int (B) | 1 to 1200 | 60 | Stop After (frames) |

### "Color Sequence"

Steps the layer through a list of colours. It overrides the pattern's own colours.

| globalId | kind | range | default | meaning |
|---|---|---|---|---|
| numcolors | int | 1 to 20 | 1 | how many of "Color 1" … "Color 20" are in the sequence |
| "Color 1" … "Color 20" | colour | | white | the colours, in order |
| seqdelay | int (B) | 1 to 600 | 60 | Sequence Delay: frames per colour |
| beamindex | list | 0 All, 1 to 20 | 0 | Modify Beam: 0 = recolour the whole layer; N = only colour slot N (dot N, line section N, or the pattern's "Color N") |
| direction | list | 0 Forward, 1 Reverse | 0 | |
| startdelay | int | 0 to 600 | 0 | frames before the sequence starts |
| colorbeforedelay | switch | | false | Color First: show the first colour straight away |
| advanceonbeat | switch | | false | Beat Advance: next colour on each beat instead of seqdelay |
| beatratio | list | 0 "1:1" … 7 "1:8" | 0 | |
| repeating | switch | | true | Always Repeat |
| repeats | int | 0 to 100 | 0 | |

## 7. Good laser content

- A laser draws by moving its mirrors. The more it has to draw per frame, the more it flickers. Prefer 1 to 6 layers; keep `bright` at 1; use Solid lines rather than many dots where you can.
- Several moving copies of one simple shape (with different startpos, delay or direction) usually look better than many different shapes.
- Keep the important parts between -0.9 and 0.9 so nothing is cut off at the edge.
- Use whole seconds and halves (60, 120, 30 frames at 60 FPS) so things line up with each other and with music.
- Show a layer only between two times (within the first 10 seconds at 60 FPS, since a delay is at most 600 frames): two Power Faders on it (the darkest wins). One with startpower 0, endpower 1, speed 1 and `delay` = when it should appear; one with startpower 1, endpower 0, speed 1 and `delay` = when it should go. Leave the second one out to keep it on. This is how to build a sequence, a build-up in stages, or a mapping drawn part by part.
- Nothing speeds up or slows down by itself. For "faster and faster", use stages: copies of the layer with shorter and shorter Frames, each shown for its part of the time as above.
- There is no random angle. For "random angles", use several layers at different Fixed Rotation angles that flash at different times, or combine Rotation with a short flash.
- LaserCube content is never meant to be aimed at people or an audience. Don't design something for that.

## 8. Rules that make LaserOS ignore things

LaserOS loads what it understands and silently ignores the rest, so check these before you answer:

1. `"enabled": true` on every layer AND every effect. A missing `enabled` switches it **off**.
2. `targetFPS` must be there (one of the listed values).
3. Numbers are plain JSON numbers, never in quotes, and int controls need whole numbers. LaserOS reads 60.5, "60" or "0.5" as 0: that 0 is used wherever LaserOS's own range allows it, even where the tables start at 1 (a speed of 0 breaks the movement, a width of 0 shrinks a line or a row of dots to one bright point), and ignored otherwise.
4. Every value must be inside its range. A value outside it is ignored. Range limits are in the tables; the ones most often missed: Start Delay and Dwell at most 600, Strobe On and Off Frames 1 to 20, Frames at most 1200, Beam Count at most 18. List controls take one of the listed positions only: another index is kept and draws nothing or misbehaves.
5. `globalId`, `beamPatternType` and `beamEffectType` must be spelled exactly as in the tables. Unknown names are ignored. Note: these file names differ from what Beam Creator shows: `"Horizontal Beam Dots"`, `"Vertical Beam Dots"`, `"Horizontal Lines"`, `"Vertical Lines"`, `"VideoSpiral"`, `"simplepaths"`, `"RandomPosition"` and `"Rotation"`.
6. Simple Shapes layers need `{"globalId": "version", "version": 2}`.
7. Plain JSON only: no comments, no trailing commas, double quotes.

## 9. Examples (each one loads cleanly with LaserOS's Beam Creator code)

### Six cyan beams sweeping left and right, 2 seconds each way

```json
{
  "version": 1,
  "id": "BeamCreatorObject",
  "data": {
    "targetFPS": 60,
    "renderQuality": 0,
    "beamPatterns": [
      {
        "beamPatternType": "Horizontal Beam Dots",
        "enabled": true,
        "guiControlManager": {
          "version": 1,
          "presets": [
            {"globalId": "numdots", "sliderValue": 6},
            {"globalId": "width", "sliderValue": 0.5},
            {"globalId": "Dot 1 Color", "hueSliderValue": 765, "saturationValue": 0}
          ]
        },
        "beamEffects": [
          {
            "beamEffectType": "Movement",
            "enabled": true,
            "guiControlManager": {
              "version": 1,
              "presets": [
                {"globalId": "direction", "index": 2},
                {"globalId": "startpos", "sliderValue": -0.4},
                {"globalId": "endpos", "sliderValue": 0.4},
                {"globalId": "speed", "sliderValue": 120},
                {"globalId": "repeating", "isChecked": true}
              ]
            }
          }
        ]
      }
    ]
  }
}
```

### A rainbow sine wave rolling to the right

```json
{
  "version": 1,
  "id": "BeamCreatorObject",
  "data": {
    "targetFPS": 60,
    "renderQuality": 0,
    "beamPatterns": [
      {
        "beamPatternType": "Sine Wave",
        "enabled": true,
        "guiControlManager": {
          "version": 1,
          "presets": [
            {"globalId": "height", "sliderValue": 0.4},
            {"globalId": "cycles", "sliderValue": 1.5},
            {"globalId": "wavespeed", "sliderValue": -2.0},
            {"globalId": "numcolors", "sliderValue": 6},
            {"globalId": "dashwidth", "sliderValue": 6},
            {"globalId": "colorslide", "index": 2},
            {"globalId": "colorspeed", "sliderValue": 1.0},
            {"globalId": "Color 1", "hueSliderValue": 0, "saturationValue": 0},
            {"globalId": "Color 2", "hueSliderValue": 255, "saturationValue": 0},
            {"globalId": "Color 3", "hueSliderValue": 510, "saturationValue": 0},
            {"globalId": "Color 4", "hueSliderValue": 765, "saturationValue": 0},
            {"globalId": "Color 5", "hueSliderValue": 1020, "saturationValue": 0},
            {"globalId": "Color 6", "hueSliderValue": 1275, "saturationValue": 0}
          ]
        },
        "beamEffects": []
      }
    ]
  }
}
```

### A green ring with two dots orbiting it in opposite directions

```json
{
  "version": 1,
  "id": "BeamCreatorObject",
  "data": {
    "targetFPS": 60,
    "renderQuality": 0,
    "beamPatterns": [
      {
        "beamPatternType": "Simple Shapes",
        "enabled": true,
        "guiControlManager": {
          "version": 1,
          "presets": [
            {"globalId": "version", "version": 2},
            {"globalId": "size", "sliderValue": 0.7},
            {"globalId": "Color 1", "hueSliderValue": 510, "saturationValue": 0}
          ]
        },
        "beamEffects": []
      },
      {
        "beamPatternType": "Simple Shapes",
        "enabled": true,
        "guiControlManager": {
          "version": 1,
          "presets": [
            {"globalId": "version", "version": 2},
            {"globalId": "size", "sliderValue": 0.05},
            {"globalId": "Color 1", "hueSliderValue": -1, "saturationValue": 0}
          ]
        },
        "beamEffects": [
          {
            "beamEffectType": "Rotation",
            "enabled": true,
            "guiControlManager": {
              "version": 1,
              "presets": [
                {"globalId": "direction", "index": 0},
                {"globalId": "rotframes", "sliderValue": 180}
              ]
            }
          },
          {
            "beamEffectType": "Position",
            "enabled": true,
            "guiControlManager": {
              "version": 1,
              "presets": [
                {"globalId": "offsetx", "sliderValue": 0.7}
              ]
            }
          }
        ]
      },
      {
        "beamPatternType": "Simple Shapes",
        "enabled": true,
        "guiControlManager": {
          "version": 1,
          "presets": [
            {"globalId": "version", "version": 2},
            {"globalId": "size", "sliderValue": 0.05},
            {"globalId": "Color 1", "hueSliderValue": 1275, "saturationValue": 0}
          ]
        },
        "beamEffects": [
          {
            "beamEffectType": "Rotation",
            "enabled": true,
            "guiControlManager": {
              "version": 1,
              "presets": [
                {"globalId": "direction", "index": 1},
                {"globalId": "rotframes", "sliderValue": 180}
              ]
            }
          },
          {
            "beamEffectType": "Position",
            "enabled": true,
            "guiControlManager": {
              "version": 1,
              "presets": [
                {"globalId": "offsetx", "sliderValue": -0.7}
              ]
            }
          }
        ]
      }
    ]
  }
}
```

### A red circle that grows for 2 seconds, holds for 1 second and starts again

```json
{
  "version": 1,
  "id": "BeamCreatorObject",
  "data": {
    "targetFPS": 60,
    "renderQuality": 0,
    "beamPatterns": [
      {
        "beamPatternType": "Simple Shapes",
        "enabled": true,
        "guiControlManager": {
          "version": 1,
          "presets": [
            {"globalId": "version", "version": 2},
            {"globalId": "size", "sliderValue": 0.6},
            {"globalId": "Color 1", "hueSliderValue": 0, "saturationValue": 0}
          ]
        },
        "beamEffects": [
          {
            "beamEffectType": "Scale",
            "enabled": true,
            "guiControlManager": {
              "version": 1,
              "presets": [
                {"globalId": "mode", "index": 0},
                {"globalId": "startscale", "sliderValue": 0.05},
                {"globalId": "endscale", "sliderValue": 1.0},
                {"globalId": "scalespeed", "sliderValue": 120},
                {"globalId": "dirdelay", "sliderValue": 60},
                {"globalId": "repeating", "isChecked": true}
              ]
            }
          }
        ]
      }
    ]
  }
}
```
