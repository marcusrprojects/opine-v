import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Categories from "./components/Categories";
import CreateCategory from './components/CreateCategory';
import CategoryDetail from './components/CategoryDetail.jsx';
import AddItem from './components/AddItemFlow';
import Profile from "./components/Profile";
import "./App.css";
import './styles/variables.css';
import Login from "./components/Login";
import Signup from "./components/Signup";
import Sidebar from "./components/Sidebar.jsx"
import "./firebaseConfig";
import ItemView from './components/ItemView';
import ReRankFlow from './components/ReRankFlow';
import ProtectedRoute from "./components/ProtectedRoute.jsx";


/**
 * App component is the main entry point for the application.
 * It sets up routing for different components using React Router.
 * Users can navigate between Home, Categories, Profile, Login, and Signup.
 * It also includes routes for category management (creating and viewing categories, adding items).
 */
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Manage sidebar state

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="App">
      <Router>
        <div className="App-layout">
          {/* Pass the sidebar state and toggle function as props */}
          <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

          {/* Main content area */}
          <div className={`main-content ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route 
                path="/create-category" 
                element={
                  <ProtectedRoute>
                    <CreateCategory />
                  </ProtectedRoute>
                } 
              />
              <Route path="/categories/:categoryId" element={<CategoryDetail />} />
              <Route 
                path="/categories/:categoryId/add-item" 
                element={
                  <ProtectedRoute>
                    <AddItem />
                  </ProtectedRoute>
                } 
              />
              <Route path="/categories/:categoryId/item/:itemId" element={<ItemView />} />
              <Route 
                path="/categories/:categoryId/items/:itemId/rerank" 
                element={
                  <ProtectedRoute>
                    <ReRankFlow />
                  </ProtectedRoute>
                } 
              />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </div>
        </div>
      </Router>
    </div>
  );
}

export default App;