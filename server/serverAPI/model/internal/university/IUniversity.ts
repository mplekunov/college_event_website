import IImage from "../image/IImage";
import IBaseUniversity from "./IBaseUniversity";

export default interface IUniversity extends IBaseUniversity {
    pictures: Array<IImage>;
}