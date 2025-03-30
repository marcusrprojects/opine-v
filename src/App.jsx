import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Feed from "./components/Feed";
import Categories from "./components/Categories";
import CreateCategory from "./components/CreateCategory";
import CategoryDetail from "./components/CategoryDetail";
import AddItem from "./components/AddItemFlow";
import Profile from "./components/Profile";
import "./App.css";
import "./styles/variables.css";
import AuthForm from "./components/AuthForm";
import Sidebar from "./components/Sidebar";
import "./firebaseConfig";
import ItemView from "./components/ItemView";
import ReRankFlow from "./components/ReRankFlow";
import ProtectedRoute from "./components/ProtectedRoute";
import EditCategory from "./components/EditCategory";
import ForgotPassword from "./components/ForgotPassword";
import FollowList from "./components/FollowList";
import EditProfile from "./components/EditProfile";
import { AuthFormMode, FollowListMode } from "./enums/ModeEnums";

// Context Providers
import { UserDataProvider } from "./context/UserDataContext";
import { UserCacheProvider } from "./context/UserCacheContext";

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
      <UserCacheProvider>
        <UserDataProvider>
          <Router
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <div className="App-layout">
              {/* Sidebar */}
              <Sidebar
                sidebarOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
              />

              {/* Main content area */}
              <div className="main-content">
                <Routes>
                  <Route exact path="/" element={<Feed />} />
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
                    path="/categories/:categoryId/items/:itemId"
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
                  <Route path="/profile/:uid?" element={<Profile />} />
                  <Route
                    path="/login"
                    element={<AuthForm mode={AuthFormMode.LOGIN} />}
                  />
                  <Route
                    path="/signup"
                    element={<AuthForm mode={AuthFormMode.SIGNUP} />}
                  />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/profile/:uid/followers"
                    element={<FollowList mode={FollowListMode.FOLLOWERS} />}
                  />
                  <Route
                    path="/profile/:uid/following"
                    element={<FollowList mode={FollowListMode.FOLLOWING} />}
                  />
                  <Route path="/profile/edit" element={<EditProfile />} />
                </Routes>
              </div>
            </div>
          </Router>
        </UserDataProvider>
      </UserCacheProvider>
    </div>
  );
}

export default App;
