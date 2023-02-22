import ILocation from "../location/ILocation";

export default interface IEvent {
    name: string;
    category: string;
    description: string;
    eventType: EventType;
    date: Date;
    location: ILocation;
    email: string;
    phone: string;
}
