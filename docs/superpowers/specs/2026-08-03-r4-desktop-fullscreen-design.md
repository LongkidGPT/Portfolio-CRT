# R4 Desktop Fullscreen KV Design

## Objective

Replace the formal desktop homepage's R3 21:9 frame sequence with the supplied R4 16:9 sequence so the KV always fills the desktop viewport. Preserve the verified pointer tracking, five project poses, and page transitions. Mobile remains out of scope.

## Locked Source

- File: `KV首屏/首屏头部转动效果（R4）.mp4`
- SHA-256: `01c513e369a7e7140f87f5a07ac80bca1cf495d9f92c26dc0c212038def98677`
- Dimensions: 1280 × 720
- Aspect ratio: 16:9
- Nominal stream rate: 60/1; average decoded rate: 11580/481 (about 24.075 fps)
- Decoded frames: 193

The asset pipeline must reject a source whose fingerprint, dimensions, or decoded frame count differs from these values.

## Desktop Rendering Rule

The formal desktop homepage uses `cover`, not `contain`:

- the Canvas always fills the complete viewport;
- a 16:9 viewport shows the complete R4 frame;
- non-16:9 viewports crop excess image at the edges and never add letterboxing;
- the visually measured R4 screen center, approximately 61.4% from the left and 47.8% from the top, is used as the crop focus so the character remains visually stable when the viewport ratio changes;
- crop offsets are clamped so the rendered image always covers the Canvas.

This rule prioritizes fullscreen composition over preservation of every source pixel. R4's 1280 × 720 source resolves the aspect-ratio problem, but it cannot provide native 4K pixel density when enlarged beyond its source resolution.

## Interaction and Frame Calibration

R4 retains the 193-frame interaction architecture, but no R3 frame value is trusted blindly. After extraction:

1. generate visual contact sheets for all frames;
2. verify neutral, eight pointer directions, and the five project hover poses against R4;
3. retain existing mapping values only when the R4 images visibly match;
4. update the mapping and its literal regression tests if any R4 pose moved.

Free pointer movement continues to use the verified anchor-relative angle calculation, neutral zone, shortest-path interpolation, and eased frame stepping. Hovering a project continues to override free pointer tracking; leaving the control restores pointer tracking.

## Component Boundary

The shared frame renderer becomes revision-neutral rather than R3-specific. It owns:

- loading and drawing the 193 WebP frames;
- `cover` geometry with a focal anchor;
- pointer tracking, fixed-frame override, reduced-motion handling, and diagnostics;
- the Canvas loading/error/frame data attributes used by automated tests.

Both the formal desktop homepage and `/kv-sync-test` consume this shared renderer in `cover` mode so the diagnostic page represents production behavior. The legacy transparent `SpritePortrait` and its 72-frame assets remain unchanged below 768 px.

## Transition and Layering Constraints

- Keep the existing homepage header, copy, rulers, button artwork, and z-index order.
- Keep the existing 720 ms desktop open transition and its scale, blur, and opacity behavior.
- Keep the existing child-page close transition and route structure.
- Do not modify mobile layout or mobile interaction in this change.

## Verification

Automated coverage must verify:

- R4 manifest identity: 1280 × 720, 193 frames, locked checksum;
- `cover` geometry has no uncovered Canvas area at 16:9, 16:10, 3:2, and 21:9;
- the focal anchor remains stable where cover bounds allow it;
- all frames load with zero errors;
- neutral, cardinal/diagonal pointer targets and five project poses match the calibrated R4 frames;
- desktop navigation transitions still pass;
- widths below 768 px still render the legacy portrait.

Visual acceptance uses at least 1920 × 1080, 1440 × 900, 1440 × 960, and 1470 × 630. Every desktop viewport must be filled with no letterbox bars or stretched pixels.
