import { ObjectId } from "bson";
import IImage from "../image/IImage";
import IBaseUniversity from "./IBaseUniversity";

export default interface IUniversity extends IBaseUniversity {
    universityID: ObjectId;
    pictures: Array<IImage>;
}