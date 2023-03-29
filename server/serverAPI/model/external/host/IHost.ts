import { ObjectId } from "bson";

export default interface IHost {
    hostID: ObjectId;
    hostType: HostType;
}
