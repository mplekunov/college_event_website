import { ObjectId } from "bson";
import { IsInt, IsPositive, IsString, ValidateNested } from "class-validator";
import Schema from "../../Schema";
import ILocation from "../location/ILocation";
import IBaseUniversity from "./IBaseUniversity";

export default class BaseUniversityShema extends Schema implements IBaseUniversity {
    universityID: ObjectId;
    
    @IsString()
    name: string;

    @IsString()
    description: string;

    @ValidateNested()
    location: ILocation;

    @IsPositive()
    @IsInt()
    numStudents: number;

    constructor(universityID: ObjectId, name: string, description: string, location: ILocation, numStudents: number) {
        super();

        this.universityID = universityID;
        this.name = name;
        this.description = description;
        this.location = location;
        this.numStudents = numStudents;
    }
}
