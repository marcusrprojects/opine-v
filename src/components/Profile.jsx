import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/useAuth';
import CategoryCollection from './CategoryCollection';
import { useNavigate } from 'react-router-dom';
import "../styles/Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const [likedCategories, setLikedCategories] = useState([]);
  const [ownCategories, setOwnCategories] = useState([]);
  const [tagMap, setTagMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserCategories = async () => {
      if (!user) return;

      const likedQuery = query(collection(db, 'categories'), where('likedBy', 'array-contains', user.uid));
      const createdQuery = query(collection(db, 'categories'), where('createdBy', '==', user.uid));

      const [likedSnapshot, createdSnapshot] = await Promise.all([
        getDocs(likedQuery),
        getDocs(createdQuery),
      ]);

      setLikedCategories(likedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setOwnCategories(createdSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    const fetchTags = async () => {
      const tagSnapshot = await getDocs(collection(db, 'tags'));
      const tagList = tagSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().name;
        return acc;
      }, {});
      setTagMap(tagList);
    };

    fetchTags();
    fetchUserCategories();
  }, [user]);

  if (!user) {
    return (
      <div className="login-prompt">
        <h2>Profile</h2>
        <p>Please log in or sign up to view your categories and liked categories.</p>
        <div className="auth-buttons">
          <button className="login-button" onClick={() => navigate('/login')}>Log In</button>
          <button className="signup-button" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>{user?.displayName || 'Profile'}</h2>
      <p>{user?.email}</p>
      <div>
        <h3>Your Categories</h3>
        <CategoryCollection categories={ownCategories} tagMap={tagMap} />
      </div>
      <div>
        <h3>Liked Categories</h3>
        <CategoryCollection categories={likedCategories} tagMap={tagMap} />
      </div>
    </div>
  );
};

export default Profile;