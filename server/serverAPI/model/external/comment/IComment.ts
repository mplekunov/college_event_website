import { ObjectId } from "bson";

export default interface IComment {
    content: string;
    userID: ObjectId;
}
