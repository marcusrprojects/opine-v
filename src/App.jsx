import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./components/Home";
import Categories from "./components/Categories";
import CreateCategory from './components/CreateCategory';
import CategoryDetail from './components/CategoryDetail.jsx';
import AddItem from './components/AddItem';
import Profile from "./components/Profile";
import "./App.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import "./firebaseConfig";


/**
 * App component is the main entry point for the application.
 * It sets up routing for different components using React Router.
 * Users can navigate between Home, Categories, Profile, Login, and Signup.
 * It also includes routes for category management (creating and viewing categories, adding items).
 */
function App() {
  return (
    <div className="App">
      <Router>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </nav>
        <div className="App-router">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/create-category" element={<CreateCategory />} />
            <Route path="/categories/:categoryId" element={<CategoryDetail />} />
            <Route path="/categories/:categoryId/add-item" element={<AddItem />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
