import { NavLink } from "react-router-dom";
import icon from "./icons/svg/icon.png";

function Brand() {
  return (
    <div className="brand">
      <NavLink to="/" className="brand-link">
        <img src={icon} alt="Logo" className="brand-icon" />
        <span className="brand-text">Remote-Shell</span>
      </NavLink>
    </div>
  );
}

export default Brand;
