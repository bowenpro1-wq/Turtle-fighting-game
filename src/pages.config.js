/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Admin from './pages/Admin';
import Encyclopedia from './pages/Encyclopedia';
import Forge from './pages/Forge';
import Leaderboard from './pages/Leaderboard';
import MiniGames from './pages/MiniGames';
import Multiplayer from './pages/Multiplayer';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Skins from './pages/Skins';
import Game from './pages/Game';
import PublicChat from './pages/PublicChat';
import Friends from './pages/Friends';


export const PAGES = {
    "Admin": Admin,
    "Encyclopedia": Encyclopedia,
    "Forge": Forge,
    "Leaderboard": Leaderboard,
    "MiniGames": MiniGames,
    "Multiplayer": Multiplayer,
    "Profile": Profile,
    "Settings": Settings,
    "Skins": Skins,
    "Game": Game,
    "PublicChat": PublicChat,
    "Friends": Friends,
}

export const pagesConfig = {
    mainPage: "Game",
    Pages: PAGES,
};