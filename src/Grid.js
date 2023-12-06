import { useCallback, useState } from "react";
import * as S from "./Grid.styles";

const rowHeaders = ["0", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const columnHeaders = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const underlineText = "___";

export const Grid = () => {
  const [selectedSquare, setSelectedSquare] = useState(underlineText);

  const clickedSquare = useCallback(
    (isHeader, row, column) => {
      if (isHeader) {
        return;
      }
      setSelectedSquare(`${row}${column}`);
    },
    [setSelectedSquare]
  );

  const squareContent = useCallback(
    (isFirstRow, isFirstColumn, columnHeader, rowHeader) => {
      if (isFirstRow && isFirstColumn) {
        return <S.HeaderText></S.HeaderText>;
      } else if (isFirstRow) {
        return <S.HeaderText>{columnHeader}</S.HeaderText>;
      } else if (isFirstColumn) {
        return <S.HeaderText>{rowHeader}</S.HeaderText>;
      } else {
        return (
          <>
            <S.PegCircle />
            {`${rowHeader}${columnHeader}`}
          </>
        );
      }
    },
    []
  );

  const submitSquare = useCallback(() => {
    // check for hit vs miss
    // add shot to history in db
    // clear selectedSquare
    setSelectedSquare(underlineText);
  }, [selectedSquare]);

  return (
    <S.Container>
      <S.Title>Florin vs Guilder Battleship!!!</S.Title>
      <S.Directions>Select a square, take the shot!</S.Directions>

      <S.BodyContainer>
        <S.OuterContainer>
          {columnHeaders.map((eachRow, rowIndex) => {
            const isFirstRow = rowIndex === 0;
            return (
              <S.EachRow key={eachRow}>
                {rowHeaders.map((eachColumn, columnIndex) => {
                  const isFirstColumn = columnIndex === 0;
                  return (
                    <S.EachSquare
                      key={eachColumn}
                      disablehover={(isFirstRow || isFirstColumn).toString()}
                      onClick={() =>
                        clickedSquare(
                          isFirstRow || isFirstColumn,
                          rowHeaders[rowIndex],
                          columnHeaders[columnIndex]
                        )
                      }
                    >
                      {squareContent(
                        isFirstRow,
                        isFirstColumn,
                        columnHeaders[columnIndex],
                        rowHeaders[rowIndex]
                      )}
                    </S.EachSquare>
                  );
                })}
              </S.EachRow>
            );
          })}
        </S.OuterContainer>
        <S.SelectedContainer>
          <S.SelectedTextContainer>
            <S.SelectedSquareHeader>Selected Square</S.SelectedSquareHeader>
            <S.SelectedSquareText>{selectedSquare}</S.SelectedSquareText>
          </S.SelectedTextContainer>
          <S.SubmitButton onClick={submitSquare}>SUBMIT</S.SubmitButton>
        </S.SelectedContainer>
      </S.BodyContainer>
    </S.Container>
  );
};

// TODO
// hook up to realm and mongodb (pull initial grid. Never changes)
// submit button
// number of shots tracker
// hit or miss determination
// tts voice (https://www.npmjs.com/package/@google-cloud/text-to-speech)
// siren sound
