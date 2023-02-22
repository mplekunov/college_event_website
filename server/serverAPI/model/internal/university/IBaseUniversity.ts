import ILocation from "../location/ILocation";

export default interface IBaseUniversity {
    name: string;
    description: string;
    location: ILocation;
    numStudents: number;
}