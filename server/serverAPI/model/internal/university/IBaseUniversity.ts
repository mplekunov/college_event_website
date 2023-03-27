import IBaseLocation from "../location/IBaseLocation";

export default interface IBaseUniversity {
    name: string;
    description: string;
    location: IBaseLocation;
    numStudents: number;
}