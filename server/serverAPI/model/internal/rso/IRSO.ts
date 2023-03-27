import IBaseEvent from "../event/IBaseEvent";
import IMember from "../member/IMember";
import { RSOMemberType } from "../rsoMember/RSOMemberType";
import IBaseRSO from "./IBaseRSO";

export default interface IRSO extends IBaseRSO {
    members: Array<IMember<RSOMemberType>>;
}
