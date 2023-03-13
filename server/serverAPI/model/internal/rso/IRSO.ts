import IBaseEvent from "../event/IBaseEvent";
import IMember from "../member/IMember";
import IBaseRSO from "./IBaseRSO";

export default interface IRSO extends IBaseRSO {
    members: Array<IMember<RSOMemberType>>;
}
