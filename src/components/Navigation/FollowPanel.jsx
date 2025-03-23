import PropTypes from "prop-types";
import Panel from "./Panel";
import Button from "./Button";
import { FaUserPlus, FaUserMinus, FaHourglassHalf } from "react-icons/fa";
import { FollowStatus } from "../../enums/ModeEnums";

/**
 * FollowPanel allows users to follow/unfollow another user.
 * Handles: follow, unfollow, and pending request state.
 */
const FollowPanel = ({ followStatus, onToggleFollow }) => {
  const isFollowing = followStatus === FollowStatus.FOLLOWING;
  const isPending = followStatus === FollowStatus.PENDING;

  return (
    <Panel>
      {isFollowing ? (
        <Button onClick={onToggleFollow} title="Unfollow" icon={FaUserMinus} />
      ) : isPending ? (
        <Button
          onClick={onToggleFollow}
          title="Cancel Request"
          icon={FaHourglassHalf}
        />
      ) : (
        <Button onClick={onToggleFollow} title="Follow" icon={FaUserPlus} />
      )}
    </Panel>
  );
};

FollowPanel.propTypes = {
  followStatus: PropTypes.oneOf(Object.values(FollowStatus)).isRequired,
  onToggleFollow: PropTypes.func.isRequired,
};

export default FollowPanel;
