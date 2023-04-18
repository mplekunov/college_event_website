import { ObjectId } from "bson";

export default interface IExternalMember<T> {
    memberType: T,
    userID: ObjectId
}
