import { useCallback, useEffect, useState } from "react";
import { returnMongoCollection } from "./database";
import * as S from "./Grid.styles";

const rowHeaders = ["0", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const columnHeaders = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const underlineText = "___";

const GAME_NUMBER = 1;

const PATROL_BOAT_HITS = 2;
const SUBMARINE_HITS = 3;
const BATTLESHIP_HITS = 4;
const AIRCRAFT_CARRIER_HITS = 5;

export const Grid = () => {
  const [selectedSquare, setSelectedSquare] = useState(underlineText);
  const [numberOfShots, setNumberOfShots] = useState(0);
  const [shipPositions, setShipPositions] = useState({});
  const [shipHits, setShipHits] = useState({});
  const [shotHistory, setShotHistory] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const collection = await returnMongoCollection("battleship");
      const data = await collection.find({ game: `${GAME_NUMBER}` });
      console.log("data", data);

      const rawShotHistory = data?.[0]?.shotHistory ?? [];
      setShipPositions(data?.[0]?.shipPositions ?? {});
      setShipHits(data?.[0]?.shipHits ?? {});
      setShotHistory(rawShotHistory);
      setNumberOfShots(rawShotHistory.length);
    };

    loadData();
  }, []);

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

  const checkForHit = useCallback(() => {
    // console.log("SHIP POSITOINS", shipPositions);
    // console.log("sel square", selectedSquare);
    for (const shipName in shipPositions) {
      const shipLocationsArray = shipPositions[shipName];
      if (shipLocationsArray.includes(selectedSquare)) {
        return shipName;
      }
    }
    return "";
  }, [selectedSquare, shipPositions]);

  const checkForSunk = useCallback(
    (shipName) => {
      if (shipName.length === 0) {
        return false;
      }

      // console.log("before: ", shipHits[shipName]);
      shipHits[shipName].push(selectedSquare);
      // console.log("after: ", shipHits[shipName]);

      const lengthOfShipHits = shipHits[shipName].length;
      let hitsNeededToSink;
      switch (shipName) {
        case "patrolBoat":
          hitsNeededToSink = PATROL_BOAT_HITS;
          break;
        case "submarine":
        case "destroyer":
          hitsNeededToSink = SUBMARINE_HITS;
          break;
        case "battleship":
          hitsNeededToSink = BATTLESHIP_HITS;
          break;
        case "aircraftCarrier":
          hitsNeededToSink = AIRCRAFT_CARRIER_HITS;
          break;
        default:
          console.error("Ship name does not match up!");
          hitsNeededToSink = 999;
          break;
      }

      return lengthOfShipHits >= hitsNeededToSink;
    },
    [shipHits, selectedSquare]
  );

  const submitSquare = useCallback(async () => {
    // check that square hasn't already been taken
    const isInShotHistoryArray = shotHistory.filter((eachShot) => {
      return eachShot.selectedSquare === selectedSquare;
    });
    if (isInShotHistoryArray.length > 0) {
      console.warn("ALREADY TOOK THIS SHOT");
      setSelectedSquare(underlineText);
      return;
    }

    // check for hit vs miss
    const hitShipName = checkForHit();
    console.log("HIT SHIP NAME:", hitShipName);
    const isSunk = checkForSunk(hitShipName);
    console.log("isSunk", isSunk);

    if (isSunk) {
      // TODO do stuff if sunk
    }

    // TODO add shot to history in db
    const isHit = hitShipName.length > 0;
    const shotHistoryObject = {
      timestamp: new Date().toISOString(),
      selectedSquare,
      isHit,
      hitShipName,
      isSunk,
    };
    shotHistory.push(shotHistoryObject);
    setNumberOfShots(numberOfShots + 1);
    const collection = await returnMongoCollection("battleship");
    const { modifiedCount } = await collection.updateOne(
      { game: `${GAME_NUMBER}` },
      {
        $set: { shipHits },
        $push: { shotHistory: shotHistoryObject },
      }
    );
    if (modifiedCount === 1) {
      console.log("Successfully saved shot");
    }

    // clear selectedSquare
    setSelectedSquare(underlineText);
  }, [selectedSquare, numberOfShots, shotHistory]);

  return (
    <S.Container>
      <S.Title>Florin vs Guilder Battleship!!!</S.Title>
      <S.Directions>Select a square, take the shot!</S.Directions>

      <S.BodyContainer>
        <S.NumberOfShotsContainer>
          <S.SelectedSquareHeader>Number of Shots</S.SelectedSquareHeader>
          <S.SelectedSquareText>{numberOfShots}</S.SelectedSquareText>
        </S.NumberOfShotsContainer>
        <S.OuterContainer>
          {columnHeaders.map((eachRow, rowIndex) => {
            const isFirstRow = rowIndex === 0;
            return (
              <S.EachRow key={eachRow}>
                {rowHeaders.map((eachColumn, columnIndex) => {
                  const isFirstColumn = columnIndex === 0;

                  // determine if square has been hit or miss and assign hitOrMiss variable
                  const isInShotHistoryArray = shotHistory.filter(
                    (eachShot) => {
                      return (
                        eachShot.selectedSquare ===
                        `${rowHeaders[rowIndex]}${columnHeaders[columnIndex]}`
                      );
                    }
                  );
                  let isHitOrMiss = "";
                  if (isInShotHistoryArray.length === 1) {
                    console.log("isInShotHistoryArray", isInShotHistoryArray);
                    if (isInShotHistoryArray[0].isHit) {
                      isHitOrMiss = "hit";
                    } else {
                      isHitOrMiss = "miss";
                    }
                  }

                  return (
                    <S.EachSquare
                      key={eachColumn}
                      disablehover={(
                        isFirstRow ||
                        isFirstColumn ||
                        isHitOrMiss.length > 0
                      ).toString()}
                      isHitOrMiss={isHitOrMiss}
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
// tts voice (https://www.npmjs.com/package/@google-cloud/text-to-speech)
// siren sound
