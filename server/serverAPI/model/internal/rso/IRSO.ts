import IEvent from "../event/IEvent";
import IMember from "../member/IMember";
import IBaseRSO from "./IBaseRSO";

export default interface IRSO extends IBaseRSO {
    members: Array<IMember<RSOMemberType>>;
    events: Array<IEvent>;
}
