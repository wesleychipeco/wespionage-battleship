import { useCallback, useEffect, useState } from "react";
import { capitalize } from "lodash";
import { returnMongoCollection } from "./database";
import * as S from "./Grid.styles";
import Speech from "speak-tts";
import AlarmSound from "./Boat_Alarm_Alert.mp3";

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
  const [shipsRemaining, setShipsRemaining] = useState([]);
  const [shotHistory, setShotHistory] = useState([]);
  const [abortState, setAbortState] = useState(false);

  const alarmAudio = new Audio(AlarmSound);

  useEffect(() => {
    const loadData = async () => {
      const collection = await returnMongoCollection("battleship");
      const data = await collection.find({ game: `${GAME_NUMBER}` });
      console.log("initial data", data);

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
        return <S.HeaderText header>{columnHeader}</S.HeaderText>;
      } else if (isFirstColumn) {
        return <S.HeaderText header>{rowHeader}</S.HeaderText>;
      } else {
        return (
          <>
            <S.PegCircle />
            {/* {`${rowHeader}${columnHeader}`} */}
          </>
        );
      }
    },
    []
  );

  const checkForHit = useCallback(() => {
    // console.log("SHIP POSITOINS", shipPositions);
    // console.log("selected square", selectedSquare);
    for (const shipName in shipPositions) {
      const shipLocationsArray = shipPositions[shipName];
      if (shipLocationsArray.includes(selectedSquare)) {
        return shipName;
      }
    }
    return "";
  }, [selectedSquare, shipPositions]);

  const checkForSunk = useCallback(
    (shipName, wasShipHit = false) => {
      if (shipName.length === 0) {
        return false;
      }

      if (wasShipHit) {
        // console.log("before shipHits: ", shipHits[shipName]);
        shipHits[shipName].push(selectedSquare);
        // console.log("after shipHits: ", shipHits[shipName]);
      }

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
    if (isInShotHistoryArray.length > 0 || selectedSquare === underlineText) {
      console.warn("ALREADY TOOK THIS SHOT");
      setSelectedSquare(underlineText);
      return;
    }

    // check for hit vs miss
    const hitShipName = checkForHit();
    // console.log("HIT SHIP NAME:", hitShipName);
    const isSunk = checkForSunk(hitShipName, true);

    const speech = new Speech();
    speech.init({
      volume: 1,
      voice: "Microsoft David - English (United States)",
    });

    const hOrM = hitShipName.length === 0 ? "Miss." : "Hit!";
    const ifSunk = isSunk ? `${hitShipName} sunk.` : "";
    const textText = `${hOrM} ${ifSunk}`;

    speech.speak({
      text: textText,
    });

    // Save shotHistory to DB
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

    // check if all are sunk
    let numberOfShipsSunk = 0;
    const newShipsRemaining = [];
    for (const eachShip in shipHits) {
      const didThisShipSink = checkForSunk(eachShip);
      // console.log("each ship", eachShip);
      // console.log("did this ship sink", didThisShipSink);
      if (didThisShipSink) {
        numberOfShipsSunk++;
      } else {
        newShipsRemaining.push(eachShip);
      }
    }
    setShipsRemaining(newShipsRemaining);
    // console.log("ship sink", eachShip, didThisShipSink);
    // console.log("Number of ships sunk: ", numberOfShipsSunk);
    if (numberOfShipsSunk === 5) {
      setTimeout(() => {
        alarmAudio.play();
        setAbortState(true);
      }, 3000);
    }
  }, [selectedSquare, numberOfShots, shotHistory]);

  return (
    <S.Container>
      {abortState && (
        <S.AbortStateContainer>
          <S.AbortText>RED ALERT!!!</S.AbortText>
        </S.AbortStateContainer>
      )}
      <S.Title>Florin vs Guilder Battleship!!!</S.Title>
      <S.Directions>Select a square, take the shot!</S.Directions>

      <S.BodyContainer>
        <S.LeftContainer>
          <div>
            <S.SelectedSquareHeader>Ships Remaining:</S.SelectedSquareHeader>
            <S.ShipsRemainingContainer>
              {shipsRemaining.map((eachShip) => {
                return (
                  <S.ShipsRemainingText key={eachShip}>
                    {capitalize(eachShip)}
                  </S.ShipsRemainingText>
                );
              })}
            </S.ShipsRemainingContainer>
          </div>
          <S.SelectedSquareHeader>Number of Shots</S.SelectedSquareHeader>
          <S.SelectedSquareText>{numberOfShots}</S.SelectedSquareText>
        </S.LeftContainer>
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
                    // console.log("isInShotHistoryArray", isInShotHistoryArray);
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
