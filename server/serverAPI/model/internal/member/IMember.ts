export default interface IMember<T> {
    userID: number;
    organizationID: number;
    memberType: T;
}
