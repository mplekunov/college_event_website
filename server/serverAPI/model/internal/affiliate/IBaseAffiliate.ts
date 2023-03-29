import { ObjectId } from "bson";

export default interface IBaseAffiliate {
    organizationID: ObjectId;
    organizationName: string;
}
