# Lil Action - Standalone Quiz Plugin

A lightweight, standalone JavaScript quiz system that can be embedded on any website. Fully configurable with custom colors, questions, and destination URLs.

## Features

- 🎨 **Fully customizable theming** - Primary, secondary, background, and text colors
- 📱 **Responsive design** - Works perfectly on all devices
- 🚀 **Zero dependencies** - No jQuery, React, or other frameworks needed
- 📊 **Progress tracking** - Visual progress bar for quiz completion
- 🎯 **Facebook Pixel integration** - Optional tracking support
- 💾 **Standalone** - Works on any website, WordPress or otherwise
- 🎪 **Multiple quizzes per page** - Support for unlimited quiz instances

## Quick Start

### Multiple Quizzes on One Page

You can add multiple quizzes on the same page. Each container must have:

- **Unique ID** (can be any unique identifier)
- **Class `la-action-container`** (used by the script to find containers)
- **Class `la-wrapper`** (optional, for styling)

```html
<!-- Quiz 1 -->
<div
  id="my-first-quiz"
  class="la-action-container la-wrapper"
  data-config="{...}"
></div>

<!-- Quiz 2 -->
<div
  id="my-opener"
  class="la-action-container la-wrapper"
  data-config="{...}"
></div>

<!-- Quiz 3 -->
<div
  id="product-selector"
  class="la-action-container la-wrapper"
  data-config="{...}"
></div>
```

**Note:** If duplicate IDs are detected, only the first one will be displayed.

### 1. Include the script via jsDelivr CDN

```html
<script
  src="https://cdn.jsdelivr.net/gh/joetituslink/lil-action@latest/lil-action.min.js"
  defer
></script>
```

**Note:** For local development, download the file and use:

```html
<script src="lil-action.js" defer></script>
```

### 2. Add the container

**Important:** Each quiz must have a unique ID and the class `la-action-container`.

```html
<div
  id="my-unique-quiz-id"
  class="la-action-container la-wrapper"
  data-config='{
  "destination": "https://example.com/thank-you",
  "color": "#3b82f6",
  "secColor": "#64748b",
  "bgColor": "#f8fafc",
  "textColor": "#1e293b",
  "quiz": {
    "title": "Tell Us About Yourself",
    "subtitle": "Help us personalize your experience",
    "questions": [
      {
        "question": "What motivates you?",
        "options": ["Option 1", "Option 2", "Option 3"]
      }
    ],
    "completeLabel": "Finish Quiz",
    "completionTitle": "Quiz Complete!",
    "completionMessage": "Great job! Click below to continue.",
    "continueButton": "Continue"
  }
}'
></div>
```

## Configuration Options

### Required Fields

- `quiz.title` (string) - Main quiz title
- `quiz.subtitle` (string) - Quiz subtitle
- `quiz.questions` (array) - Array of question objects
- `quiz.completeLabel` (string) - Label for final button
- `quiz.completionTitle` (string) - Title shown after completion
- `quiz.completionMessage` (string) - Message shown after completion
- `quiz.continueButton` (string) - Button text to continue

### Optional Fields

- `destination` (string) - URL to redirect after completion (optional)
- `color` (string) - Primary color hex code for buttons and progress bar (default: `#000000`)
- `secColor` (string) - Secondary color hex code for borders and backgrounds (default: `#6b7280`)
- `bgColor` (string) - Container background color hex code (default: `#ffffff`)
- `textColor` (string) - Primary text color hex code (default: `#111827`)

### Question Format

Each question object should have:

```javascript
{
  "question": "Your question text here",
  "options": ["Option 1", "Option 2", "Option 3"]
}
```

## Example

See `index.html` for a complete working example.

## Customization

### Colors

The quiz supports full theming with primary, secondary, background, and text colors:

```html
data-config='{ "color": "#ef4444", "secColor": "#fca5a5", "bgColor": "#fef2f2",
"textColor": "#991b1b" }'
<!-- Red theme -->

data-config='{ "color": "#10b981", "secColor": "#6ee7b7", "bgColor": "#f0fdf4",
"textColor": "#166534" }'
<!-- Green theme -->

data-config='{ "color": "#8b5cf6", "secColor": "#c4b5fd", "bgColor": "#faf5ff",
"textColor": "#7c3aed" }'
<!-- Purple theme -->
```

### Styling

All CSS classes are prefixed with `la-` to avoid conflicts. Customize by adding your own CSS:

```css
.la-wrapper {
  max-width: 600px; /* Adjust width */
}

.la-card {
  background: #f9fafb; /* Change background */
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Minification

To create the minified version (`lil-action.min.js`), use any JavaScript minifier:

- **Online:** Use [Terser](https://terser.org/) or [JSCompress](https://jscompress.com/)
- **NPM:** `npm install -g terser && terser lil-action.js -o lil-action.min.js`
- **VS Code:** Install "Minify" extension

The CDN URL points to the minified version for better performance.

## License

MIT License - Feel free to use in any project.

## Changelog

### v1.1.0

- Added full theming support with background and text colors
- Added secColor configuration for secondary colors
- Added multiple quiz instances per page support
- Enhanced Facebook Pixel events (ViewContent, CompleteRegistration, Lead)
- Fixed containerId scope issues

### v1.0.0

- Initial release
- Custom color support
- Responsive design
- Facebook Pixel integration
- Progress tracking
