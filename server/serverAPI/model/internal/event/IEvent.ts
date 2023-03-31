import { ObjectId } from "bson";
import IBaseEvent from "./IBaseEvent";

export default interface IEvent extends IBaseEvent {
    eventID: ObjectId;
}
