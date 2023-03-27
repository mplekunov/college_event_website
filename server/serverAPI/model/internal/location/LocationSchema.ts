import { IsNumber, IsString } from "class-validator";
import Schema from "../../Schema";
import ILocation from "./ILocation";

export default class LocationSchema extends Schema implements ILocation {
    @IsString()
    address: string;

    @IsNumber()
    longitude: number;

    @IsNumber()
    latitude: number;

    constructor(address: string, longitude: number, latitude: number) {
        super();

        this.address = address;
        this.longitude = longitude;
        this.latitude = latitude;
    }
}
