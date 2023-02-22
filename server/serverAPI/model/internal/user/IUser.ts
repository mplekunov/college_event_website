import IAffiliate from "../affiliate/IAffiliate";
import IMember from "../member/IMember";
import IBaseRSO from "../rso/IBaseRSO";
import IBaseUser from "./IBaseUser";
import IContactInformation from "./IContactInformation";
import ICredentials from "./ICredentials";

export default interface IUser extends IBaseUser, ICredentials, IContactInformation {
    userID: number;

    organizationsAffiliation: Array<IAffiliate<IBaseRSO, IMember<RSOMemberType>>>;
}
