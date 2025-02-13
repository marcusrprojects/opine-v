import PropTypes from "prop-types";
import "../../styles/Panel.css";
import "../../styles/Button.css";

const Panel = ({ children }) => {
  return <div className="panel">{children}</div>;
};

Panel.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Panel;
