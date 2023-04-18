import { ObjectId } from "bson";
import IBaseLocation from "./IBaseLocation";

export default interface ILocation extends IBaseLocation {
    locationID: ObjectId;
}
