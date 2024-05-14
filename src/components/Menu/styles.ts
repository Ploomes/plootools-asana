import styled from "styled-components";

export const MenuWrapper = styled.nav`
  display: flex;
  gap: 1rem;
  background: ${({ theme })=> theme.primary};
  padding: 0.75rem;
  ul {
    padding: 0;
    margin: 0;
  }
  li {
    list-style: none;
  }
  a {
    text-decoration: none;
    color: #fff;
    &.active {
      color: ${({ theme })=> theme.active};
    }
  }
`;