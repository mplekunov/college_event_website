import { ObjectId } from "bson";
import IBaseComment from "./IBaseComment";

export default interface IComment extends IBaseComment {
    commentID: ObjectId;
    username: string;
}
