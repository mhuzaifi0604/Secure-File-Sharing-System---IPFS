import { useContext } from "react";
import IPFS from "./Ethcontext";

const useEth = () => useContext(IPFS);

export default useEth;