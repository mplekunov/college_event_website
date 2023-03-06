import { ObjectId } from "bson";

export default interface IMember<T> {
    userID: ObjectId;
    organizationID: ObjectId;
    memberType: T;
}
