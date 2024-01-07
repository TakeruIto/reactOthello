const BLACK = 0;
const WHITE = 1;
const VACANT = 2;

const N_LINE = 6561;
const N_BOARD_IDX = 38;

const INF = 100000000; // 大きな値
const CACHE_HIT_BONUS = 1000; // 前回の探索で枝刈りされなかったノードへのボーナス

const POW3 = [
  3 ** 0,
  3 ** 1,
  3 ** 2,
  3 ** 3,
  3 ** 4,
  3 ** 5,
  3 ** 6,
  3 ** 7,
  3 ** 8,
  3 ** 9,
  3 ** 10,
  3 ** 11,
];

const popDigit = [];
for (let i = 0; i < N_LINE; i++) {
  const v = [];
  for (let j = 0; j < 8; j++) {
    v.push(Math.floor(i / POW3[8 - 1 - j]) % 3);
  }
  popDigit.push(v);
}

const MOVE_OFFSET = [
  1, 1, 1, 1, 1, 1, 1, 1, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9,
  9, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
];

const GLOBAL_PLACE = [
  [0, 1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21, 22, 23],
  [24, 25, 26, 27, 28, 29, 30, 31],
  [32, 33, 34, 35, 36, 37, 38, 39],
  [40, 41, 42, 43, 44, 45, 46, 47],
  [48, 49, 50, 51, 52, 53, 54, 55],
  [56, 57, 58, 59, 60, 61, 62, 63],
  [0, 8, 16, 24, 32, 40, 48, 56],
  [1, 9, 17, 25, 33, 41, 49, 57],
  [2, 10, 18, 26, 34, 42, 50, 58],
  [3, 11, 19, 27, 35, 43, 51, 59],
  [4, 12, 20, 28, 36, 44, 52, 60],
  [5, 13, 21, 29, 37, 45, 53, 61],
  [6, 14, 22, 30, 38, 46, 54, 62],
  [7, 15, 23, 31, 39, 47, 55, 63],
  [5, 14, 23, -1, -1, -1, -1, -1],
  [4, 13, 22, 31, -1, -1, -1, -1],
  [3, 12, 21, 30, 39, -1, -1, -1],
  [2, 11, 20, 29, 38, 47, -1, -1],
  [1, 10, 19, 28, 37, 46, 55, -1],
  [0, 9, 18, 27, 36, 45, 54, 63],
  [8, 17, 26, 35, 44, 53, 62, -1],
  [16, 25, 34, 43, 52, 61, -1, -1],
  [24, 33, 42, 51, 60, -1, -1, -1],
  [32, 41, 50, 59, -1, -1, -1, -1],
  [40, 49, 58, -1, -1, -1, -1, -1],
  [2, 9, 16, -1, -1, -1, -1, -1],
  [3, 10, 17, 24, -1, -1, -1, -1],
  [4, 11, 18, 25, 32, -1, -1, -1],
  [5, 12, 19, 26, 33, 40, -1, -1],
  [6, 13, 20, 27, 34, 41, 48, -1],
  [7, 14, 21, 28, 35, 42, 49, 56],
  [15, 22, 29, 36, 43, 50, 57, -1],
  [23, 30, 37, 44, 51, 58, -1, -1],
  [31, 38, 45, 52, 59, -1, -1, -1],
  [39, 46, 53, 60, -1, -1, -1, -1],
  [47, 54, 61, -1, -1, -1, -1, -1],
];

const CELL_WEIGHT = [
  30, -12, 0, -1, -1, 0, -12, 30, -12, -15, -3, -3, -3, -3, -15, -12, 0, -3, 0,
  -1, -1, 0, -3, 0, -1, -3, -1, -1, -1, -1, -3, -1, -1, -3, -1, -1, -1, -1, -3,
  -1, 0, -3, 0, -1, -1, 0, -3, 0, -12, -15, -3, -3, -3, -3, -15, -12, 30, -12,
  0, -1, -1, 0, -12, 30,
];

// インデックス形式から一般的な配列形式に変換
const translateToArr = (boardIdx) => {
  const res = [...initialCells];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      res[i * 8 + j] = popDigit[boardIdx[i]][j];
    }
  }
  return res;
};

// 一般的な配列形式からインデックス形式に変換
const translateFromArr = (arr) => {
  const boardIdx = [];
  for (let i = 0; i < N_BOARD_IDX; ++i) {
    boardIdx.push(N_LINE - 1);
  }
  for (let i = 0; i < 64; ++i) {
    for (let j = 0; j < 4; ++j) {
      if (placeIncluded[i][j] === -1) {
        continue;
      }
      if (arr[i] === BLACK) {
        boardIdx[placeIncluded[i][j]] -=
          2 * POW3[8 - 1 - localPlace[placeIncluded[i][j]][i]];
      } else if (arr[i] === WHITE) {
        boardIdx[placeIncluded[i][j]] -=
          POW3[8 - 1 - localPlace[placeIncluded[i][j]][i]];
      }
    }
  }
  return boardIdx;
};

// インデックスからボードの1行/列をビットボードで生成する
const createOneColor = (idx, k) => {
  let res = 0;
  for (let i = 0; i < 8; i++) {
    if (idx % 3 === k) {
      res |= 1 << i;
    }
    idx = Math.floor(idx / 3);
  }
  return res;
};

// ビットボードにおける着手に使う
const trans = (pt, k) => {
  if (k === 0) return pt << 1;
  else return pt >> 1;
};

// ビットボードで1行/列において着手
const moveLineHalf = (p, o, place, k) => {
  const pt = 1 << (8 - 1 - place);
  if (pt & p || pt & o) {
    return 0;
  }
  let mask = trans(pt, k);
  let res = 0;
  while (mask && mask & o) {
    res++;
    mask = trans(mask, k);
    if (mask & p) {
      return res;
    }
  }
  return 0;
};

// 石をひっくり返す
const flip = (boardIdx, gPlace, player) => {
  for (let i = 0; i < 3; ++i)
    boardIdx[placeIncluded[gPlace][i]] =
      flipArr[player][boardIdx[placeIncluded[gPlace][i]]][
        localPlace[placeIncluded[gPlace][i]][gPlace]
      ];
  if (placeIncluded[gPlace][3] !== -1)
    boardIdx[placeIncluded[gPlace][3]] =
      flipArr[player][boardIdx[placeIncluded[gPlace][3]]][
        localPlace[placeIncluded[gPlace][3]][gPlace]
      ];
  return boardIdx;
};

// 石をひっくり返す
const moveP = (boardIdx, gPlace, player, i) => {
  const place = localPlace[placeIncluded[gPlace][i]][gPlace];
  let boardIdxNew = [...boardIdx];
  for (
    let j = 1;
    j <= moveArr[player][boardIdx[placeIncluded[gPlace][i]]][place][0];
    j++
  ) {
    boardIdxNew = flip(
      boardIdxNew,
      gPlace - MOVE_OFFSET[placeIncluded[gPlace][i]] * j,
      player,
    );
  }
  for (
    let j = 1;
    j <= moveArr[player][boardIdx[placeIncluded[gPlace][i]]][place][1];
    j++
  ) {
    boardIdxNew = flip(
      boardIdxNew,
      gPlace + MOVE_OFFSET[placeIncluded[gPlace][i]] * j,
      player,
    );
  }
  return boardIdxNew;
};

const move = (boardIdx, index, turn) => {
  let boardIdxNew = [...boardIdx];
  boardIdxNew = moveP(boardIdxNew, index, turn, 0);
  boardIdxNew = moveP(boardIdxNew, index, turn, 1);
  boardIdxNew = moveP(boardIdxNew, index, turn, 2);
  if (placeIncluded[index][3] !== -1) {
    boardIdxNew = moveP(boardIdxNew, index, turn, 3);
  }
  for (let i = 0; i < 3; i++) {
    boardIdxNew[placeIncluded[index][i]] =
      putArr[turn][boardIdxNew[placeIncluded[index][i]]][
        localPlace[placeIncluded[index][i]][index]
      ];
  }
  if (placeIncluded[index][3] !== -1) {
    boardIdxNew[placeIncluded[index][3]] =
      putArr[turn][boardIdxNew[placeIncluded[index][3]]][
        localPlace[placeIncluded[index][3]][index]
      ];
  }
  return boardIdxNew;
};

const isLegal = (boardIdx, gPlace, turn) => {
  let res = false;
  for (let i = 0; i < 3; i++) {
    res |=
      legalArr[turn][boardIdx[placeIncluded[gPlace][i]]][
        localPlace[placeIncluded[gPlace][i]][gPlace]
      ];
  }
  if (placeIncluded[gPlace][3] !== -1) {
    res |=
      legalArr[turn][boardIdx[placeIncluded[gPlace][3]]][
        localPlace[placeIncluded[gPlace][3]][gPlace]
      ];
  }
  return res;
};

let transposeTable = new Map(); // 現在の探索結果を入れる置換表: 同じ局面に当たった時用
let formerTransposeTable = new Map(); // 前回の探索結果が入る置換表: move orde

// move ordering用評価値の計算
const calcMoveOrderingValue = (b, turn) => {
  let res;
  if (formerTransposeTable[`${turn}-${b}`]) {
    // 前回の探索で枝刈りされなかった
    res = CACHE_HIT_BONUS - formerTransposeTable[`${turn}-${b}`];
  } else {
    // 前回の探索で枝刈りされた
    res = -evaluate(b, turn);
  }
  return res;
};

// 盤面評価
const evaluate = (b, turn) => {
  let res = 0;
  for (let i = 0; i < 8 / 2; i++) {
    res += cellScore[i][b[i]];
  }
  for (let i = 0; i < 8 / 2; ++i) {
    res += cellScore[8 / 2 - 1 - i][b[8 / 2 + i]];
  }
  if (turn === WHITE) {
    res = -res;
  }
  return res;
};

const sortFnc = (a, b) => a.value - b.value;

// move orderingと置換表つきnegaalpha法
const negaAlphaTranspose = (b, depth, passed, alpha, beta, turn) => {
  // 葉ノードでは評価関数を実行する
  if (depth === 0) {
    return evaluate(b.index, turn);
  }

  // 同じ局面に遭遇したらハッシュテーブルの値を返す
  if (transposeTable[`${turn}-${b.index}`]) {
    return transposeTable[`${turn}-${b.index}`];
  }

  // 葉ノードでなければ子ノードを列挙
  let maxScore = -INF;
  let canput = 0;
  const child_nodes = [];
  for (let coord = 0; coord < 64; coord++) {
    if (isLegal(b.index, coord, turn)) {
      child_nodes.push({
        index: move(b.index, coord, turn),
        value: 0,
        policy: coord,
      });
      child_nodes[canput].value = calcMoveOrderingValue(
        child_nodes[canput].index,
        turn,
      );
      canput++;
    }
  }

  // パスの処理 手番を交代して同じ深さで再帰する
  if (canput === 0) {
    // 2回連続パスなら評価関数を実行
    if (passed) {
      return evaluate(b.index, turn);
    }
    return -negaAlphaTranspose(b, depth, true, -beta, -alpha, 1 - turn);
  }

  // move ordering実行
  if (canput >= 2) {
    child_nodes.sort(sortFnc);
  }

  // 探索
  for (let nb of child_nodes) {
    const g = -negaAlphaTranspose(
      nb,
      depth - 1,
      false,
      -beta,
      -alpha,
      1 - turn,
    );
    if (g >= beta) {
      // 興味の範囲よりもminimax値が上のときは枝刈り
      return g;
    }
    alpha = Math.max(alpha, g);
    maxScore = Math.max(maxScore, g);
  }

  // 置換表に登録
  transposeTable[`${turn}-${b.index}`] = maxScore;
  return maxScore;
};

// depth手読みの探索
const search = (b, depth) => {
  let res = -1;
  transposeTable = {};
  formerTransposeTable = {};
  // 子ノードを全列挙
  let canput = 0;
  const child_nodes = [];
  for (let coord = 0; coord < 64; ++coord) {
    if (isLegal(b, coord, 1)) {
      child_nodes.push({ index: move(b, coord, 1), value: 0, policy: coord });
      ++canput;
    }
  }
  // 1手ずつ探索を深める
  const start_depth = Math.max(1, depth - 3); // 最初に探索する手数
  for (let searchDepth = start_depth; searchDepth <= depth; ++searchDepth) {
    let alpha = -INF;
    let beta = INF;
    if (canput >= 2) {
      // move orderingのための値を得る
      for (let nb of child_nodes) {
        nb.value = calcMoveOrderingValue(nb.index, 1);
      }
      // move ordering実行
      child_nodes.sort(sortFnc);
    }
    for (let nb of child_nodes) {
      const score = -negaAlphaTranspose(
        nb,
        searchDepth - 1,
        false,
        -beta,
        -alpha,
        0,
      );
      if (alpha < score) {
        alpha = score;
        res = nb.policy;
      }
    }
    formerTransposeTable = JSON.parse(JSON.stringify(transposeTable));
    transposeTable = {};
  }
  return res;
};

const rowColTo1D = (rowIndex, colIndex) => rowIndex * 8 + colIndex;

/**
 * 何マスひっくり返せるか
 */
const moveArr = Array.from(new Array(2), () => {
  return Array.from(new Array(N_LINE), () => {
    return Array.from(new Array(8), () => new Array(2).fill(0));
  });
});

/**
 * trueなら合法、falseなら非合法
 */
const legalArr = Array.from(new Array(2), () => {
  return Array.from(new Array(N_LINE), () => new Array(8).fill(false));
});

/**
 * ボードのインデックスのマスの位置をひっくり返した後のインデックス
 */
const flipArr = Array.from(new Array(2), () => {
  return Array.from(new Array(N_LINE), () => new Array(8).fill(0));
});

/**
 * ボードのインデックスのマスの位置に着手した後のインデックス
 */
const putArr = Array.from(new Array(2), () => {
  return Array.from(new Array(N_LINE), () => new Array(8).fill(0));
});

/**
 * そのマスが関わるインデックス番号の配列(3つのインデックスにしか関わらない場合は最後の要素に-1が入る)
 */
const placeIncluded = Array.from(new Array(64), () => {
  return new Array(4).fill(0);
});

/**
 * そのインデックス番号におけるマスのローカルな位置
 */
const localPlace = Array.from(new Array(N_BOARD_IDX), () => {
  return new Array(64).fill(0);
});

const cellScore = Array.from(new Array(4), () => {
  return new Array(N_LINE).fill(0);
});

for (let idx = 0; idx < N_LINE; idx++) {
  const b = createOneColor(idx, BLACK);
  const w = createOneColor(idx, WHITE);
  for (let place = 0; place < 8; place++) {
    moveArr[BLACK][idx][place][0] = moveLineHalf(b, w, place, 0);
    moveArr[BLACK][idx][place][1] = moveLineHalf(b, w, place, 1);
    legalArr[BLACK][idx][place] =
      moveArr[BLACK][idx][place][0] || moveArr[BLACK][idx][place][1];
    moveArr[WHITE][idx][place][0] = moveLineHalf(w, b, place, 0);
    moveArr[WHITE][idx][place][1] = moveLineHalf(w, b, place, 1);
    legalArr[WHITE][idx][place] =
      moveArr[WHITE][idx][place][0] || moveArr[WHITE][idx][place][1];
    flipArr[BLACK][idx][place] = idx;
    flipArr[WHITE][idx][place] = idx;
    putArr[BLACK][idx][place] = idx;
    putArr[WHITE][idx][place] = idx;
    if (b & (1 << (8 - 1 - place))) {
      flipArr[WHITE][idx][place] += POW3[8 - 1 - place];
    } else if (w & (1 << (8 - 1 - place)))
      flipArr[BLACK][idx][place] -= POW3[8 - 1 - place];
    else {
      putArr[BLACK][idx][place] -= POW3[8 - 1 - place] * 2;
      putArr[WHITE][idx][place] -= POW3[8 - 1 - place];
    }
  }
}

for (let place = 0; place < 64; place++) {
  let inc_idx = 0;
  for (let idx = 0; idx < N_BOARD_IDX; idx++) {
    for (let l_place = 0; l_place < 8; l_place++) {
      if (GLOBAL_PLACE[idx][l_place] === place)
        placeIncluded[place][inc_idx++] = idx;
    }
  }
  if (inc_idx === 3) placeIncluded[place][inc_idx] = -1;
}

for (let idx = 0; idx < N_BOARD_IDX; idx++) {
  for (let place = 0; place < 64; place++) {
    localPlace[idx][place] = -1;
    for (let l_place = 0; l_place < 8; l_place++) {
      if (GLOBAL_PLACE[idx][l_place] === place)
        localPlace[idx][place] = l_place;
    }
  }
}

for (let idx = 0; idx < N_LINE; idx++) {
  const b = createOneColor(idx, 0);
  const w = createOneColor(idx, 1);

  for (let place = 0; place < 8; place++) {
    for (let i = 0; i < 8 / 2; ++i) {
      cellScore[i][idx] += (1 & (b >> place)) * CELL_WEIGHT[i * 8 + place];
      cellScore[i][idx] -= (1 & (w >> place)) * CELL_WEIGHT[i * 8 + place];
    }
  }
}

const initialCells = [
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  WHITE,
  BLACK,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  BLACK,
  WHITE,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
  VACANT,
];

const initialState = {
  turn: BLACK,
  cntBlack: 2,
  cntWhite: 2,
  isEnd: -1,
  cells: [].concat(initialCells),
  validatedCells: Array.from(new Array(64).fill(false)).map(
    (v, index) => index === 19 || index === 26 || index === 37 || index === 44,
  ),
  boardIdx: translateFromArr(initialCells),
  isLegalCell: (state, rowIndex, colIndex) => {
    let res = false;
    const gPlace = rowColTo1D(rowIndex, colIndex);
    for (let i = 0; i < 3; i++) {
      res |=
        legalArr[state.turn][state.boardIdx[placeIncluded[gPlace][i]]][
          localPlace[placeIncluded[gPlace][i]][gPlace]
        ];
    }
    if (placeIncluded[gPlace][3] !== -1) {
      res |=
        legalArr[state.turn][state.boardIdx[placeIncluded[gPlace][3]]][
          localPlace[placeIncluded[gPlace][3]][gPlace]
        ];
    }
    return res;
  },
  search: (state) => {
    return search(state.boardIdx, 8);
  },
};

const gameInfo = (state = initialState, action) => {
  switch (action.type) {
    case "UPDATE_CELLS": {
      let boardIdxNew = [...state.boardIdx];
      boardIdxNew = moveP(boardIdxNew, action.index, state.turn, 0);
      boardIdxNew = moveP(boardIdxNew, action.index, state.turn, 1);
      boardIdxNew = moveP(boardIdxNew, action.index, state.turn, 2);
      if (placeIncluded[action.index][3] !== -1) {
        boardIdxNew = moveP(boardIdxNew, action.index, state.turn, 3);
      }
      for (let i = 0; i < 3; i++) {
        boardIdxNew[placeIncluded[action.index][i]] =
          putArr[state.turn][boardIdxNew[placeIncluded[action.index][i]]][
            localPlace[placeIncluded[action.index][i]][action.index]
          ];
      }
      if (placeIncluded[action.index][3] !== -1) {
        boardIdxNew[placeIncluded[action.index][3]] =
          putArr[state.turn][boardIdxNew[placeIncluded[action.index][3]]][
            localPlace[placeIncluded[action.index][3]][action.index]
          ];
      }
      return {
        ...state,
        boardIdx: [...boardIdxNew],
        cells: translateToArr(boardIdxNew),
      };
    }
    case "UPDATE_TURN":
      return {
        ...state,
        turn: 1 - state.turn,
      };
    case "UPDATE_STONE_CNT":
      return {
        ...state,
        cntBlack: state.cells.filter((cell) => cell === BLACK).length,
        cntWhite: state.cells.filter((cell) => cell === WHITE).length,
      };
    case "UPDATE_VALIDATED_CELLS": {
      const evaluates = [];
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          evaluates.push(state.isLegalCell(state, i, j));
        }
      }
      return {
        ...state,
        validatedCells: [...evaluates],
      };
    }
    case "UPDATE_IS_END":
      return { ...state, isEnd: action.payload };
    default:
      return state;
  }
};

export default gameInfo;
