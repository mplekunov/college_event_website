import { ObjectId } from "bson";

export default interface IMember<T> {
    userID: ObjectId;
    memberType: T;
}
