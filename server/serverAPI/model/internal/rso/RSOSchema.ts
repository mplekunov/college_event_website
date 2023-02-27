import IAffiliate from "../affiliate/IAffiliate";
import IBaseUniversity from "../university/IBaseUniversity";
import IMember from "../member/IMember";
import IBaseRSO from "../rso/IBaseRSO";
import IRSO from "./IRSO";
import IEvent from "../event/IEvent";
import { ObjectId } from "bson";
import Schema from "../../Schema";

export default class RSOSchema extends Schema implements IRSO {
    members: IMember<RSOMemberType>[];
    events: IEvent[];
    rsoID: ObjectId;
    name: string;
    description: string;

    constructor(
        name: string,
        description: string,
        rsoID: ObjectId,
        events: IEvent[],
        members: IMember<RSOMemberType>[]
    ) {
        super();
        
        this.name = name;
        this.description = description;
        this.rsoID = rsoID;
        this.members = members;
        this.events = events;
    }
}
