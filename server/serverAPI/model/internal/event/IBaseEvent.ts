import { ObjectId } from 'bson';
import IBaseLocation from '../location/IBaseLocation';

export default interface IBaseEvent {
    name: string;
    hostID: ObjectId;
    hostType: HostType;
    category: string;
    description: string;
    date: number;
    location: IBaseLocation;
    email: string;
    phone: string;
}
