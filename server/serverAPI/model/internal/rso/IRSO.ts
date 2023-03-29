import { ObjectId } from "bson";
import IBaseEvent from "../event/IBaseEvent";
import IMember from "../member/IMember";
import { RSOMemberType } from "../rsoMember/RSOMemberType";
import IBaseRSO from "./IBaseRSO";

export default interface IRSO extends IBaseRSO {
    rsoID: ObjectId;
}
