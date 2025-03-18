import PropTypes from "prop-types";
import Panel from "./Panel";
import Button from "./Button";
import { FaUserPlus, FaUserMinus } from "react-icons/fa";

/**
 * FollowPanel allows users to follow/unfollow another user.
 * - Uses consistent styling with other panels.
 */
const FollowPanel = ({ isFollowing, onToggleFollow }) => {
  return (
    <Panel>
      <Button
        onClick={onToggleFollow}
        title={isFollowing ? "Unfollow" : "Follow"}
        icon={isFollowing ? FaUserMinus : FaUserPlus}
      />
    </Panel>
  );
};

FollowPanel.propTypes = {
  isFollowing: PropTypes.bool.isRequired,
  onToggleFollow: PropTypes.func.isRequired,
};

export default FollowPanel;
