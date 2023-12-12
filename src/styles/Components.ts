import styled, { css } from "styled-components";

export const Container = styled.div`${({ theme })=> css`
  width: 300px;
  height: 300px;
`}`;

export const Input = styled.input`${({ theme })=> css`
  border: 1px solid;
  width: 100%;
  padding: 0.5rem;
  border-radius: 5px;
`}`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
  label {
    display: block;
    text-align: left;
  }
`;

export const Button = styled.button`${({ theme })=> css`
  padding: 0.5rem 1rem;
  border: 0;
  cursor: pointer;
  transition: opacity 100ms;
  border-radius: 0.25rem;
  &.primary {
    background-color: ${theme.primary};
    color: ${theme.secondary};
  }
  &:hover {
    opacity: 0.8;
  }
`}`

export const Select = styled.select`${({ theme })=> css`
  border: 1px solid;
  width: 100%;
  padding: 0.5rem;
  border-radius: 5px;
`}`;