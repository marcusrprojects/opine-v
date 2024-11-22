import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types'; // For prop validation
import { useAuth } from '../context/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); // Get the user state from AuthProvider

  return user ? children : <Navigate to="/login" />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;