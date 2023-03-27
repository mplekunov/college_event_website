import { IsNumber, IsString } from "class-validator";
import Schema from "../../Schema";
import IBaseLocation from "./IBaseLocation";

export default class BaseLocationSchema extends Schema implements IBaseLocation {
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
