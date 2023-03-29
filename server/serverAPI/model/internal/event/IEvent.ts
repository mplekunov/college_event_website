import IComment from "../comment/IComment";
import IBaseEvent from "./IBaseEvent";

export default interface IEvent extends IBaseEvent {
    rating: number;
    comments: Array<IComment>;
}
