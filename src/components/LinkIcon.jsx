import PropTypes from "prop-types";
import { FaGlobe, FaWikipediaW } from "react-icons/fa";
import "../styles/LinkIcon.css";

/**
 * LinkIcon renders an anchor (<a>) with an icon based on the provided link.
 * If the link contains "wikipedia.org" (case‑insensitive), it shows the Wikipedia icon;
 * otherwise, it shows the globe icon. If no link is provided, it defaults to the Wikipedia icon.
 */
const LinkIcon = ({ link, title, iconVisible = true }) => {
  const lowerLink = link?.trim().toLowerCase() || "";
  const isWikipedia = lowerLink.includes("wikipedia.org");
  const IconComponent = link
    ? isWikipedia
      ? FaWikipediaW
      : FaGlobe
    : FaWikipediaW;

  return (
    <div>
      {iconVisible && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          title={title || "Reference Link"}
        >
          <IconComponent className="link-icon" />
        </a>
      )}
    </div>
  );
};

LinkIcon.propTypes = {
  link: PropTypes.string,
  title: PropTypes.string,
  iconVisible: PropTypes.bool,
};

export default LinkIcon;
