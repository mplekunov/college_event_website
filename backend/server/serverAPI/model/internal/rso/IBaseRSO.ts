import { ObjectId } from "bson";
import IMember from "../member/IMember";
import { RSOMemberType } from "../rsoMember/RSOMemberType";

export default interface IBaseRSO {
    name: string;
    description: string;
    members: Array<IMember<RSOMemberType>>;
    universityID: ObjectId;
}