import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Categories from "./components/Categories";
import CreateCategory from "./components/CreateCategory";
import CategoryDetail from "./components/CategoryDetail.jsx";
import AddItem from "./components/AddItemFlow";
import Profile from "./components/Profile";
import "./App.css";
import "./styles/variables.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Sidebar from "./components/Sidebar.jsx";
import "./firebaseConfig";
import ItemView from "./components/ItemView";
import ReRankFlow from "./components/ReRankFlow";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import EditCategory from "./components/EditCategory";
import ForgotPassword from "./components/ForgotPassword";

// Context Providers
import { LikedCategoriesProvider } from "./context/LikedCategoriesContext";
import { TagProvider } from "./context/TagContext";
import { FollowProvider } from "./context/FollowContext";

/**
 * App component is the main entry point for the application.
 * It sets up routing for different components using React Router.
 */
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="App">
      <LikedCategoriesProvider>
        <TagProvider>
          <FollowProvider>
            <Router>
              <div className="App-layout">
                {/* Sidebar */}
                <Sidebar
                  sidebarOpen={sidebarOpen}
                  toggleSidebar={toggleSidebar}
                />

                {/* Main content area */}
                <div className="main-content">
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
                    <Route
                      path="/categories/:categoryId"
                      element={<CategoryDetail />}
                    />
                    <Route
                      path="/categories/:categoryId/edit"
                      element={<EditCategory />}
                    />
                    <Route
                      path="/categories/:categoryId/add-item"
                      element={
                        <ProtectedRoute>
                          <AddItem />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/categories/:categoryId/item/:itemId"
                      element={<ItemView />}
                    />
                    <Route
                      path="/categories/:categoryId/items/:itemId/rerank"
                      element={
                        <ProtectedRoute>
                          <ReRankFlow />
                        </ProtectedRoute>
                      }
                    />
                    {/* Route for viewing profiles (own or others') */}
                    <Route path="/profile/:userId?" element={<Profile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                  </Routes>
                </div>
              </div>
            </Router>
          </FollowProvider>
        </TagProvider>
      </LikedCategoriesProvider>
    </div>
  );
}

export default App;
