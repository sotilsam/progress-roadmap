<div align="center">
  <h1>🗺️ Progress Roadmap</h1>
  <p>A beautifully designed, interactive roadmap and personal task management application built with React, TypeScript, and Vite.</p>
  
  <br />
  <img src="/public/screenshot.png" alt="Progress Roadmap Demo" width="800" />
</div>

## 🌟 Features

- **Interactive Map**: Visualize your journey with a dynamic, connecting node-based roadmap.
- **Global Tasks Panel**: Keep track of your overarching goals and daily tasks in a specialized, persistent panel.
- **Contextual Notes**: Attach detailed notes and sub-tasks to individual roadmap nodes.
- **Neobrutalist UI**: A modern, clean, and striking neobrutalist design system with smooth animations.
- **State Persistence**: Your progress is safely stored in your browser using local storage, ensuring you never lose your data.
- **Responsive Layout**: Designed to work beautifully across all screen sizes.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) (v19)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository**:

   ```bash
   # Replace with your actual repository URL
   git clone https://github.com/yourusername/progress-roadmap.git
   cd progress-roadmap
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:5173` to view the application in action.

## 📁 Project Structure

```text
src/
├── components/          # React components
│   ├── GlobalTasksPanel.tsx # Sidewide tasks manager
│   ├── Map.tsx              # Interactive roadmap visualization
│   ├── NotesPanel.tsx       # Node-specific notes and details
│   └── Sidebar.tsx          # Navigation and roadmap control
├── store/               # Zustand state management
│   └── useRoadmapStore.ts   # Core application state
├── App.tsx              # Main application layout
├── index.css            # Global styles and Tailwind configuration
└── main.tsx             # Application entry point
```

## 🎨 Design

The app leverages a striking **Neobrutalism** aesthetic—characterized by bold typography, high-contrast borders, shadow depth, and vibrant colors, providing an engaging and highly tactile user experience. Smooth transitions and playful animations powered by Framer Motion bring the map to life.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you have ideas for improvements or new features.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
