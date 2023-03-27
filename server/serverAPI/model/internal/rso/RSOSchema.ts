import IAffiliate from "../affiliate/IAffiliate";
import IBaseUniversity from "../university/IBaseUniversity";
import IMember from "../member/IMember";
import IBaseRSO from "../rso/IBaseRSO";
import IRSO from "./IRSO";
import IBaseEvent from "../event/IBaseEvent";
import { ObjectId } from "bson";
import Schema from "../../Schema";
import { RSOMemberType } from "../rsoMember/RSOMemberType";

export default class RSOSchema extends Schema implements IRSO {
    members: IMember<RSOMemberType>[];
    rsoID: ObjectId;
    name: string;
    description: string;

    constructor(
        name: string,
        description: string,
        rsoID: ObjectId,
        members: IMember<RSOMemberType>[]
    ) {
        super();
        
        this.name = name;
        this.description = description;
        this.rsoID = rsoID;
        this.members = members;
    }
}
