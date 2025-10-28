# Lil Action - Standalone Quiz Plugin

A lightweight, standalone JavaScript quiz system that can be embedded on any website. Fully configurable with custom colors, questions, and destination URLs.

## Features

- 🎨 **Customizable colors** - Set your own primary color theme
- 📱 **Responsive design** - Works perfectly on all devices
- 🚀 **Zero dependencies** - No jQuery, React, or other frameworks needed
- 📊 **Progress tracking** - Visual progress bar for quiz completion
- 🎯 **Facebook Pixel integration** - Optional tracking support
- 💾 **Standalone** - Works on any website, WordPress or otherwise

## Quick Start

### 1. Include the script

```html
<script src="lil-action.js" defer></script>
```

### 2. Add the container

```html
<div
  id="la-action-container"
  class="la-wrapper"
  data-config='{
  "enabled": true,
  "destination": "https://example.com/thank-you",
  "color": "#3b82f6",
  "quiz": {
    "enabled": true,
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

- `enabled` (boolean) - Enable/disable the quiz
- `quiz.enabled` (boolean) - Enable/disable quiz functionality
- `quiz.title` (string) - Main quiz title
- `quiz.subtitle` (string) - Quiz subtitle
- `quiz.questions` (array) - Array of question objects
- `quiz.completeLabel` (string) - Label for final button
- `quiz.completionTitle` (string) - Title shown after completion
- `quiz.completionMessage` (string) - Message shown after completion
- `quiz.continueButton` (string) - Button text to continue

### Optional Fields

- `destination` (string) - URL to redirect after completion (optional)
- `color` (string) - Primary color hex code (default: `#000000`)

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

The quiz automatically generates hover and lighter shades from your primary color:

```html
data-config='{"color": "#ef4444"}'
<!-- Red theme -->
data-config='{"color": "#10b981"}'
<!-- Green theme -->
data-config='{"color": "#8b5cf6"}'
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

## License

MIT License - Feel free to use in any project.

## Changelog

### v1.0.0

- Initial release
- Custom color support
- Responsive design
- Facebook Pixel integration
- Progress tracking
