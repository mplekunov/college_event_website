import { ObjectId } from "bson";
import IAffiliate from "../../../internal/affiliate/IAffiliate";
import IMember from "../../../internal/member/IMember";
import RSOSchema from "../../../internal/rso/RSOSchema";

export default class RSORegisterRequestSchema extends RSOSchema {
    constructor(
        name: string,
        description: string,
        rsoID: ObjectId,
        members: IMember<RSOMemberType>[]
    ) {
        super(name, description, rsoID, [], members);
    }
}
