import styles from "./cell.module.scss";
import React from "react";

function Cell({ cellType, validated, updateCell, rowIndex, colIndex }) {
  return (
    <div
      className={`flex h-[48px] w-[48px] items-center justify-center border border-[#FFD1E3] ${
        validated
          ? "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600 to-blue-600"
          : ""
      }`}
      onClick={() => updateCell(rowIndex, colIndex)}
    >
      <div>
        <div
          className={
            cellType === 0
              ? styles.flipBlack
              : cellType === 1
                ? styles.flipWhite
                : styles.flipNone
          }
        ></div>
      </div>
    </div>
  );
}

export default Cell;
