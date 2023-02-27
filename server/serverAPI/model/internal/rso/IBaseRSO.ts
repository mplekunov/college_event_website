import { ObjectId } from "bson";

export default interface IBaseRSO {
    rsoID: ObjectId;
    name: string;
    description: string;
}