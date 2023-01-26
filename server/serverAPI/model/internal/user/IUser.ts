import IBaseUser from "./IBaseUser";
import IContactInformation from "./IContactInformation";
import ICredentials from "./ICredentials";

export default interface IUser extends IBaseUser, ICredentials, IContactInformation {
    isVerified: boolean;    
}
