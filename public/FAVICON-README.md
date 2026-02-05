# Favicon Files

This directory contains favicon files for the site. The following files are included or need to be added:

## Included Files

- **favicon.svg** - SVG favicon (supports dark mode via CSS media query)
- **favicon.ico** - Legacy ICO format for older browsers

## Files to Add (Production)

Before deploying to production, you should add the following files:

### apple-touch-icon.png

- **Size**: 180x180 pixels
- **Format**: PNG (no transparency)
- **Purpose**: Used by iOS devices when adding the site to the home screen

### Recommended Additional Files

For comprehensive favicon support, consider generating a full set using a tool like [RealFaviconGenerator](https://realfavicongenerator.net/):

- `favicon-16x16.png` - 16x16 favicon for browser tabs
- `favicon-32x32.png` - 32x32 favicon for browser tabs
- `android-chrome-192x192.png` - Android home screen icon
- `android-chrome-512x512.png` - Android splash screen
- `site.webmanifest` - Web app manifest for PWA support

## Usage in HTML

The following links should be added to the `<head>` section of your pages:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

These are already configured in the SEO component template.
