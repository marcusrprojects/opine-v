import PropTypes from 'prop-types';

const LoadingComponent = ({ message = "Loading..." }) => (
  <div className="loading-screen">
    <p>{message}</p>
  </div>
);

LoadingComponent.propTypes = {
  message: PropTypes.string,
};

export default LoadingComponent;