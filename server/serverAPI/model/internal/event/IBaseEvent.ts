import { ObjectId } from "bson";
import IHost from "../../external/host/IHost";
import ILocation from "../location/ILocation";

export default interface IBaseEvent {
    eventID: ObjectId;
    host: IHost;
    name: string;
    category: string;
    description: string;
    date: Date;
    location: ILocation;
    email: string;
    phone: string;
}
