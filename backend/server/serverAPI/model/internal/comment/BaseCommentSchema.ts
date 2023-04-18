import { ObjectId } from 'bson';
import Schema from '../../Schema';
import IBaseComment from './IBaseComment';
import { IsNotEmpty, IsString } from 'class-validator';

export default class BaseCommentSchema extends Schema {
    @IsString()
    @IsNotEmpty()
    content: string;

    eventID: ObjectId;
    userID: ObjectId;

    constructor(content: string, userID: ObjectId, eventID: ObjectId) {
        super();

        this.content = content;
        this.userID = userID;
        this.eventID = eventID;
    }
}