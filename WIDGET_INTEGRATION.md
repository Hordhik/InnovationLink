# 📱 Widget Integration Guide

## 🚀 Easy Website Integration Options

### Option 1: Standalone Widget Page
Use `widget.html` as a complete page or in an iframe:

```html
<iframe 
    src="http://localhost:3000/widget.html" 
    width="100%" 
    height="600"
    frameborder="0"
    style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</iframe>
```

### Option 2: Embeddable JavaScript Widget
Add this to any website:

```html
<!-- 1. Add the container div where you want the widget -->
<div id="startup-updates-widget"></div>

<!-- 2. Include the widget script -->
<script src="http://localhost:3000/startup-widget.js"></script>
```

### Option 3: React/Vue Component Integration
For modern frameworks, fetch data and build custom components:

```javascript
// Fetch events data
const response = await fetch('http://localhost:8000/events');
const data = await response.json();
// Use data.events in your component
```

## 🎨 Customization Options

### JavaScript Widget Configuration
Modify the widget by changing `WIDGET_CONFIG` in `startup-widget.js`:

```javascript
const WIDGET_CONFIG = {
    apiBase: 'https://your-api-domain.com', // Your production API URL
    containerId: 'startup-updates-widget',   // Container element ID
    maxEvents: 10,                          // Max events to display
    autoRefresh: true,                      // Auto-refresh every 5 minutes
    refreshInterval: 300000,                // Refresh interval (ms)
    theme: 'light'                          // 'light' or 'dark'
};
```

### CSS Customization
Override widget styles by adding custom CSS:

```css
/* Change widget colors */
.startup-widget-embed {
    border: 2px solid #your-brand-color;
}

.startup-widget-header {
    background: linear-gradient(135deg, #your-color1, #your-color2);
}

/* Customize event cards */
.startup-widget-event {
    background-color: #f9f9f9;
    border-radius: 8px;
    margin: 10px 0;
    padding: 15px;
}
```

## 📐 Responsive Design Features

### ✅ Mobile Optimized
- Automatically adapts to screen sizes
- Touch-friendly buttons and controls
- Optimized text sizes for readability
- Stacked layouts on mobile devices

### ✅ Breakpoints Covered
- **Desktop**: > 1024px - Full layout with grid
- **Tablet**: 768px - 1024px - Adjusted spacing
- **Mobile Landscape**: 480px - 768px - Single column
- **Mobile Portrait**: < 480px - Compact layout
- **Small Devices**: < 320px - Minimal layout

### ✅ Cross-Browser Support
- Chrome, Firefox, Safari, Edge
- iOS Safari, Android Chrome
- Internet Explorer 11+ (with polyfills)

## 🔧 Integration Examples

### WordPress Integration
Add to your theme's `functions.php`:

```php
function add_startup_widget_shortcode() {
    return '<div id="startup-updates-widget"></div>
            <script src="http://localhost:3000/startup-widget.js"></script>';
}
add_shortcode('startup_widget', 'add_startup_widget_shortcode');
```

Use shortcode: `[startup_widget]`

### Shopify Integration
Add to your theme template:

```liquid
<!-- In your theme template file -->
<div class="startup-widget-section">
    <div id="startup-updates-widget"></div>
</div>

<script src="http://localhost:3000/startup-widget.js"></script>
```

### Static Site (HTML)
Simple integration:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Website</title>
</head>
<body>
    <main>
        <h1>Your Website Content</h1>
        
        <!-- Startup Widget -->
        <section class="updates-section">
            <div id="startup-updates-widget"></div>
        </section>
    </main>
    
    <script src="http://localhost:3000/startup-widget.js"></script>
</body>
</html>
```

## ⚡ Performance Optimization

### Lazy Loading
Load the widget only when needed:

```html
<div id="startup-updates-widget" style="min-height: 400px;"></div>

<script>
// Load widget when section comes into view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const script = document.createElement('script');
            script.src = 'http://localhost:3000/startup-widget.js';
            document.head.appendChild(script);
            observer.disconnect();
        }
    });
});

observer.observe(document.getElementById('startup-updates-widget'));
</script>
```

### Caching
The widget automatically:
- Caches API responses for 5 minutes
- Updates only when new data is available
- Uses minimal bandwidth with optimized requests

## 🎯 Innovation Link Integration

### For Innovation Link Website
Add to your main page or dedicated updates section:

```html
<!-- Full-width section -->
<section class="startup-updates-section">
    <div class="container">
        <h2>Latest Startup & Government Updates</h2>
        <div id="startup-updates-widget"></div>
    </div>
</section>

<!-- Custom styling for your brand -->
<style>
.startup-updates-section {
    background: #f8f9fa;
    padding: 60px 0;
}

.startup-updates-section .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Override widget colors to match Innovation Link branding */
.startup-widget-embed .startup-widget-header {
    background: linear-gradient(135deg, #your-primary-color, #your-secondary-color);
}
</style>

<script src="http://localhost:3000/startup-widget.js"></script>
```

## 🌐 Production Deployment

### Update API URL
Before going live, update the API URL in:

1. **widget.html** - Change `apiBase` to your production URL
2. **startup-widget.js** - Update `WIDGET_CONFIG.apiBase`
3. **index.html** - Update `API_BASE` constant

### CORS Configuration
Ensure your API allows requests from your website domain.

### SSL/HTTPS
Make sure both your API and widget are served over HTTPS in production.

---

**🎉 Your widget is now fully responsive and ready for any website integration!**