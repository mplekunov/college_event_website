import IBaseUniversity from "./IBaseUniversity";
import Schema from "../../Schema";
import IBaseLocation from "../location/IBaseLocation";
import { IsInt, IsNotEmpty, IsPositive, IsString, ValidateNested } from "class-validator";

export default class BaseUniversitySchema extends Schema implements IBaseUniversity {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @ValidateNested()
    location: IBaseLocation;

    @IsPositive()
    @IsInt()
    numStudents: number;

    constructor(name: string, description: string, location: IBaseLocation, numStudents: number) {
        super();

        this.name = name;
        this.description = description;
        this.location = location;
        this.numStudents = numStudents;
    }
}
