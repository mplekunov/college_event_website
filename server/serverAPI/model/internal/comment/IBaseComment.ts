import { ObjectId } from "bson";

export default interface IBaseComment {
    content: string;
    eventID: ObjectId;
    userID: ObjectId;
}