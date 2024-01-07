import { createStore } from "redux";
import gameInfo from "../reducers/gameInfo";

const store = createStore(gameInfo);

export default store;
