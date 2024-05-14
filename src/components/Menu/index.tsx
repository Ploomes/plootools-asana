import { NavLink } from "react-router-dom";
import { MenuWrapper } from "./styles";

function Menu() {
  return(
    <MenuWrapper>
      <li>
        <NavLink to={"/"}>Changelog</NavLink>
      </li>
      <li>
        <NavLink to={"/hostset"}>Hostset</NavLink>
      </li>
    </MenuWrapper>
  );
};

export default Menu;