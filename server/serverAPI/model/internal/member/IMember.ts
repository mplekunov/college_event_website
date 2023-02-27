import { ObjectId } from "bson";

export default interface IMember<T> {
    userID: number;
    organizationID: ObjectId;
    memberType: T;
}
