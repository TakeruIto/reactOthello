import { useSelector } from "react-redux";

function Footer() {
  const cntBlack = useSelector((state) => state.cntBlack);
  const cntWhite = useSelector((state) => state.cntWhite);

  const resetState = () => {
    window.location.reload();
  };

  return (
    <div>
      <div className="flex h-[48px] items-center justify-center bg-[#392467]">
        <div className="flex">
          <div className="flex w-[128px] items-center justify-center">
            <div
              className={"h-[20px] w-[20px] rounded-[50%] bg-[#5D3587]"}
            ></div>
            <div className="m-2 text-[#FFD1E3]">{cntBlack}</div>
          </div>
          <div className="flex w-[128px] items-center justify-center">
            <div
              className={"h-[20px] w-[20px] rounded-[50%] bg-[#FFD1E3]"}
            ></div>
            <div className="m-2 text-[#FFD1E3]">{cntWhite}</div>
          </div>
        </div>
      </div>
      <div className="flex h-[48px] items-center justify-center bg-[#392467]">
        <button
          className="h-[30px] w-[60px] items-center justify-center bg-[#FFD1E3]"
          onClick={resetState}
        >
          <h2 className="flex justify-center font-bold">RESET</h2>
        </button>
      </div>
    </div>
  );
}

export default Footer;
