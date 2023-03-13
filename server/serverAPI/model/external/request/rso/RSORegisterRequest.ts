import { ObjectId } from "bson";
import IMember from "../../../internal/member/IMember";
import RSOSchema from "../../../internal/rso/RSOSchema";
import IExternalMember from "../../member/IExternalMember";

export default class RSORegisterRequestSchema extends RSOSchema {
    constructor(
        name: string,
        description: string,
        rsoID: ObjectId,
        members: IExternalMember<RSOMemberType>[]
    ) {
        let internalMembers: IMember<RSOMemberType>[] = [];
        
        members.forEach((member: IExternalMember<RSOMemberType>) => internalMembers.push({
            memberType: member.memberType,
            userID: member.userID,
            organizationID: rsoID
        }));

        super(name, description, rsoID, internalMembers);
    }
}
