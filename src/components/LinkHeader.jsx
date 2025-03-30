import PropTypes from "prop-types";
import LinkIcon from "./LinkIcon";
import "../styles/LinkHeader.css";

/**
 * LinkHeader renders a header element (default <h2>) with a clickable link icon.
 * The icon is determined by the URL: if it contains "wikipedia.org", it shows the Wikipedia icon;
 * otherwise, it shows the globe icon.
 *
 * Props:
 * - title: The header text.
 * - link: The URL for the anchor.
 * - headerTag: The HTML tag to use for the header (default: "h2").
 * - linkTitle: The title attribute for the anchor.
 * - iconVisible: Whether the icon should be visible.
 */
const LinkHeader = ({
  title,
  link,
  HeaderTag = "h2",
  linkTitle = "Reference Link",
  iconVisible = true,
}) => {
  return (
    <div className="link-header">
      <HeaderTag>{title}</HeaderTag>
      {link && (
        <LinkIcon link={link} title={linkTitle} iconVisible={iconVisible} />
      )}
    </div>
  );
};

LinkHeader.propTypes = {
  title: PropTypes.string.isRequired,
  link: PropTypes.string,
  HeaderTag: PropTypes.string,
  linkTitle: PropTypes.string,
  iconVisible: PropTypes.bool,
};

export default LinkHeader;
