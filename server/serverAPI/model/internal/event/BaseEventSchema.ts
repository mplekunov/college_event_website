import Schema from "../../Schema";
import IBaseLocation from "../location/IBaseLocation";
import { IsEmail, IsInt, IsNotEmpty, IsPhoneNumber, IsPositive, IsString, ValidateNested } from "class-validator";
import IBaseEvent from './IBaseEvent';
import { ObjectId } from "bson";

export default class BaseEventSchema extends Schema implements IBaseEvent {
    @IsString()
    @IsNotEmpty()
    name: string;

    hostID: ObjectId;

    hostType: HostType;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsPositive()
    @IsInt()
    date: number;

    @ValidateNested()
    location: IBaseLocation;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @IsPhoneNumber("US")
    phone: string;

    constructor(
        name: string,
        hostID: ObjectId,
        hostType: HostType,
        category: string,
        description: string,
        date: number,
        location: IBaseLocation,
        email: string,
        phone: string
    ) {
        super();

        this.name = name;
        this.hostID = hostID;
        this.hostType = hostType;
        this.category = category;
        this.description = description;
        this.date = date;
        this.location = location;
        this.email = email;
        this.phone = phone;
    }
}
