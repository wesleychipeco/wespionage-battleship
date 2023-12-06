import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 3rem;
`;

export const Directions = styled.p`
  margin: 1rem 0 1rem 0;
`;

export const BodyContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const OuterContainer = styled.div`
  background-color: #15afbd;
  width: 45rem;
  height: 45rem;

  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border: 0.5rem black solid;
`;

export const EachRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  height: 100%;
`;

export const EachSquare = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;
  border: 0.1rem black solid;

  &:hover {
    cursor: ${(props) => (props.disablehover === "true" ? "auto" : "pointer")};
    background-color: ${(props) =>
      props.disablehover === "true" ? "" : "#70b2b8"};
  }
`;

export const PegCircle = styled.div`
  width: 25%;
  height: 25%;
  border-radius: 100%;

  background-color: #15bdb1;
  border: 0.01rem white solid;
`;

export const HeaderText = styled.p`
  font-size: 1.25rem;
  margin: 0;
  padding: 0;
`;

export const SelectedContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  height: 40%;

  margin-left: 2rem;
`;

export const SelectedTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SelectedSquareHeader = styled.h4`
  font-size: 2.5rem;
  margin: 0 0 2rem 0;
  padding: 0;
`;

export const SelectedSquareText = styled.p`
  font-size: 2rem;
  margin: 0;
  padding: 0;
  text-decoration: underline;
`;

export const SubmitButton = styled.div`
  width: 10rem;
  height: 4rem;
  background-color: #508d69;
  border-radius: 1rem;

  font-size: 2rem;
  font-weight: 700;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }
`;
