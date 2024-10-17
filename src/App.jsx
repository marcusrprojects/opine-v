import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Categories from "./components/Categories";
import Profile from "./components/Profile";
import "./App.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import "./firebaseConfig";

function App() {
  return (
    <div className="App">
      <Router>
        <div className="App-router">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
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
