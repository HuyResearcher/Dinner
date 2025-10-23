# 🍽️ Cuisine Selection Website

A cute, responsive website for dinner planning with Mr. Huy! This interactive flow guides users through cuisine selection with fun animations and data tracking.

## ✨ Features

- **Interactive Button Avoidance**: The "I don't like him" button moves away when you try to click it!
- **Multi-step Flow**: Smooth transitions between selection steps
- **Responsive Design**: Works perfectly on both desktop and mobile
- **Data Monitoring**: Track all user responses with statistics
- **Local Storage**: All data is saved locally in the browser

## 🎯 User Flow

1. **Initial Choice**: Choose between wanting dinner with Mr. Huy or not liking him
2. **Day Selection**: Pick between Saturday or Sunday
3. **Cuisine Choice**: Select from 6 different cuisine options
4. **Confirmation**: View your selection summary

## 📊 Data Monitoring

### How to Access Data:
1. Complete the selection flow
2. Click "View All Responses" button
3. See real-time statistics and all responses

### What Data is Tracked:
- **Total Responses**: Number of completed selections
- **Most Popular Day**: Which day is chosen most often
- **Most Popular Cuisine**: Which cuisine is most selected
- **Individual Responses**: Complete details of each selection

### Data Storage:
- All data is stored in browser's `localStorage`
- Data persists between sessions
- Accessible via browser developer tools: `localStorage.getItem('cuisineResponses')`

### For Developers:
```javascript
// Access stored data
const responses = JSON.parse(localStorage.getItem('cuisineResponses') || '[]');

// Clear all data
localStorage.removeItem('cuisineResponses');

// Export data
const data = JSON.stringify(responses);
```

## 🚀 Getting Started

1. Open `index.html` in any modern web browser
2. No server required - works offline!
3. All files must be in the same directory

## 📱 Responsive Design

- **Desktop**: Full-width layout with hover effects
- **Tablet**: Optimized grid layout
- **Mobile**: Single-column layout with touch-friendly buttons

## 🎨 Design Features

- Modern gradient backgrounds
- Smooth animations and transitions
- Cute emoji icons
- Glass-morphism effects
- Mobile-first responsive design

## 🔧 Technical Details

- **HTML5**: Semantic structure
- **CSS3**: Flexbox, Grid, Animations
- **Vanilla JavaScript**: No dependencies
- **Local Storage**: Data persistence
- **Progressive Enhancement**: Works without JavaScript

## 📈 Analytics Integration

To integrate with external analytics (Google Analytics, etc.):

```javascript
// Add to script.js in the saveResponse() method
gtag('event', 'cuisine_selection', {
    'event_category': 'engagement',
    'event_label': response.cuisine,
    'value': 1
});
```

## 🎉 Fun Features

- Button avoidance animation
- Smooth step transitions
- Loading animations
- Keyboard navigation support
- Touch-friendly mobile interface

Enjoy your dinner planning! 🍽️✨
