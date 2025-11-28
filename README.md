# WorldPin 🌍📍

**Pin your journeys on a living globe.**

![WorldPin Preview](preview.png)

WorldPin is an immersive 3D travel log application that allows you to track your adventures on an interactive globe. Share your journey with friends, view their maps, and keep your memories alive with photos and detailed descriptions.

## ✨ Features

*   **Interactive 3D Globe**: Powered by MapLibre GL JS, offering a stunning and responsive 3D experience.
*   **Pin Your Memories**: Add markers to locations you've visited, complete with photos, dates, and ratings.
*   **Friendship System**: Search for users, send friend requests, and build your network of fellow travelers.
*   **Social Exploration**: View your friends' globes in read-only mode to see where they've been.
*   **Real-time Notifications**: Get instant alerts for new friend requests.
*   **Customizable Maps**: Switch between Dark, Light, Satellite, and Street views to suit your style.
*   **Privacy Mode**: Toggle privacy settings to control visibility (coming soon).
*   **Secure Authentication**: Robust login and signup system powered by Supabase.

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS, Lucide React (Icons)
*   **Map Engine**: MapLibre GL JS
*   **Backend & Database**: Supabase (PostgreSQL, Auth, Realtime, Storage)
*   **State Management**: React Context API

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Kush-Modi/WorldPin.git
    cd WorldPin
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

## 📸 Screenshots

*(Add more screenshots here if available)*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
