# Student Habit Tracker

A modern, web-based habit tracker designed specifically for college students. Built with React and Tailwind CSS, featuring a dark mode interface that reduces eye strain.

## Features

- **Dark Mode Interface**: Easy on the eyes during late-night study sessions
- **Daily Habit Tracking**: Track your daily habits with large, accessible toggle controls
- **Progress Visualization**: See your daily completion percentage with a visual progress bar
- **Streak Counter**: Maintain your motivation with a fire streak counter
- **Weekly Overview**: Visualize your weekly progress with a completion grid
- **Add New Habits**: Easily add new habits with customizable categories
- **Undo Functionality**: Quickly undo accidental habit toggles
- **Local Storage**: Your habits are saved in your browser

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd student-habit-tracker
   ```

3. Install dependencies:
   ```
   npm install
   ```

### Running the Application

To start the development server:

```
npm start
```

The application will be available at `http://localhost:3000`

### Building for Production

To create a production build:

```
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Header.js          # Application header with welcome message
│   ├── ProgressBar.js     # Visual progress bar component
│   ├── StreakCounter.js   # Fire streak visualization
│   ├── HabitCard.js       # Individual habit card with toggle
│   ├── WeeklyGrid.js      # Weekly completion visualization
│   ├── AddHabitButton.js  # Floating add habit button
│   └── UndoBanner.js      # Undo functionality banner
├── App.js                 # Main application component
└── index.js               # Entry point
```

## Design Principles

This application follows Human-Computer Interaction (HCI) principles:

- **Fitts's Law**: Large, easily clickable habit toggle controls
- **Visibility of System Status**: Clear progress indicators and streak counter
- **User Control and Freedom**: Undo functionality for accidental actions
- **Consistency**: Unified dark mode color scheme and component styling
- **Error Prevention**: Clear visual feedback for all interactions

## Technologies Used

- React.js
- Tailwind CSS
- localStorage for data persistence

## Customization

You can customize the color scheme by modifying the `tailwind.config.js` file and the colors in `src/index.css`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.