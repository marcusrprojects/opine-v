import PropTypes from 'prop-types';

const LoadingComponent = ({ message }) => (
  <div className="loading-screen">
    <p>{message || "Loading..."}</p>
  </div>
);

LoadingComponent.propTypes = {
  message: PropTypes.string,
};

LoadingComponent.defaultProps = {
  message: "Loading...",
};

export default LoadingComponent;