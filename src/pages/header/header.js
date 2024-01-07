import logo from "logo.svg";
import styles from "./header.module.scss";
import { useSelector } from "react-redux";

function Header() {
  const turn = useSelector((state) => state.turn);
  const isEnd = useSelector((state) => state.isEnd);
  const cntBlack = useSelector((state) => state.cntBlack);
  const cntWhite = useSelector((state) => state.cntWhite);
  return (
    <div>
      <div className="flex h-[48px] items-center justify-center bg-[#392467]">
        <div className="flex">
          <img src={logo} className={styles.img} alt="logo" />
          <div>
            <h1 className="text-5xl font-bold">OTHELLO</h1>
          </div>
          <img src={logo} className={styles.img} alt="logo" />
        </div>
      </div>
      <div className="h-[24px] bg-[#392467] text-[#FFD1E3]">
        {isEnd === 1 ? (
          turn === 0 ? (
            "相手が置ける手がありませんでした"
          ) : (
            "あなたが置ける手がありませんでした"
          )
        ) : (
          <div></div>
        )}
      </div>
      <div className="flex h-[24px] items-center justify-center bg-[#392467]">
        {isEnd < 2 ? (
          <div className="flex">
            <div
              className={`h-[20px] w-[20px] rounded-[50%] ${
                turn === 0 ? "bg-[#5D3587]" : "bg-[#FFD1E3]"
              }`}
            ></div>
            <div className="text-[#FFF]">
              {turn === 0 ? "あなたの番です" : "相手の番です"}
            </div>
            <div
              className={`h-[20px] w-[20px] rounded-[50%] ${
                turn === 0 ? "bg-[#5D3587]" : "bg-[#FFD1E3]"
              }`}
            ></div>
          </div>
        ) : (
          <div className="flex text-[#FFF]">
            <div>
              {cntBlack > cntWhite
                ? "あなたの勝ちです"
                : cntWhite > cntBlack
                  ? "相手の勝ちです"
                  : "引き分けです"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
