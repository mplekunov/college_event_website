import { ObjectId } from "bson";
import ILocation from "../location/ILocation";

export default interface IBaseUniversity {
    universityID: ObjectId;
    name: string;
    description: string;
    location: ILocation;
    numStudents: number;
}