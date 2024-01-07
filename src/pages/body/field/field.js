import Cell from "../cell/cell";
import React from "react";
import { useSelector, useDispatch } from "react-redux";

function Field() {
  const cells = useSelector((state) => state.cells);
  const turn = useSelector((state) => state.turn);
  const validatedCells = useSelector((state) => state.validatedCells);
  const isEnd = useSelector((state) => state.isEnd);
  const search = useSelector((state) => {
    return () => state.search(state);
  });

  const dispatch = useDispatch();

  const myTurn = (rowIndex, colIndex) => {
    if (turn === 0 && validatedCells[rowIndex * 8 + colIndex]) {
      updateCell(rowIndex, colIndex);
    }
  };

  const getRowColIndex = () => {
    const coord = search();
    return [Math.floor(coord / 8), coord % 8];
    // const extrctFrom = validatedCells
    //   .map((data, index) => {
    //     return { idx: index, flg: data };
    //   })
    //   .filter((data) => data.flg);
    // if (extrctFrom.length === 0) {
    //   return [-1, -1];
    // }
    // const idx = extrctFrom[Math.floor(Math.random() * extrctFrom.length)].idx;
    // return [Math.floor(idx / 8), idx % 8];
  };

  const yourTurn = () => {
    const [rowIndex, colIndex] = getRowColIndex();
    if (rowIndex >= 0 && colIndex >= 0) {
      updateCell(rowIndex, colIndex);
    } else {
      dispatch({
        type: "UPDATE_TURN",
      });
      dispatch({
        type: "UPDATE_VALIDATED_CELLS",
      });
    }
  };

  const updateCell = async (rowIndex, colIndex) => {
    await dispatch({
      type: "UPDATE_CELLS",
      index: rowIndex * 8 + colIndex,
      payload:
        cells[rowIndex * 8 + colIndex] === 2
          ? turn
          : 1 - cells[rowIndex * 8 + colIndex],
    });
    await dispatch({
      type: "UPDATE_STONE_CNT",
    });
    await dispatch({
      type: "UPDATE_TURN",
    });
    await dispatch({
      type: "UPDATE_VALIDATED_CELLS",
    });
  };

  React.useEffect(() => {
    console.log(
      turn,
      isEnd,
      validatedCells,
    );
    if (-1 < isEnd && isEnd < 2) {
      if (!validatedCells.some((v) => v)) {
        dispatch({
          type: "UPDATE_IS_END",
          payload: isEnd + 1,
        });
        dispatch({
          type: "UPDATE_TURN",
        });
        dispatch({
          type: "UPDATE_VALIDATED_CELLS",
        });
      } else {
        dispatch({
          type: "UPDATE_IS_END",
          payload: 0,
        });
      }
      if (turn === 1) {
        setTimeout(() => {
          yourTurn();
        }, 3000);
      }
    } else {
      console.log(
        "kita"
      );
      dispatch({
        type: "UPDATE_IS_END",
        payload: isEnd + 1,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validatedCells]);

  return (
    <div>
      <div className="border-2 border-[#FFD1E3]">
        {(() => {
          const row = [];
          for (let i = 0; i < 8; i++) {
            row.push(
              <div className="flex items-center justify-center" key={i}>
                {(() => {
                  const c = [];
                  for (let j = 0; j < 8; j++) {
                    c.push(
                      <Cell
                        key={`${i}-${j}`}
                        cellType={cells[i * 8 + j]}
                        rowIndex={i}
                        colIndex={j}
                        validated={validatedCells[i * 8 + j]}
                        updateCell={myTurn}
                      ></Cell>,
                    );
                  }
                  return c;
                })()}
              </div>,
            );
          }
          return row;
        })()}
      </div>
    </div>
  );
}

export default Field;
