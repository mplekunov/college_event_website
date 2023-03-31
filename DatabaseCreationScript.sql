CREATE TABLE Location(
    locationID varchar(50) PRIMARY KEY NOT NULL,
    address varchar(100) NOT NULL,
    longitude float NOT NULL,
    latitude float NOT NULL
);

CREATE TABLE University(
    universityID varchar(50) PRIMARY KEY NOT NULL,
    name varchar(100) NOT NULL,
    description varchar(500) NOT NULL,
    locationID varchar(50) NOT NULL,
    numStudents int NOT NULL,
    FOREIGN KEY (locationID) REFERENCES Location(locationID)
);

CREATE TABLE User(
    userID varchar(50) PRIMARY KEY NOT NULL,
    firstName varchar(50) NOT NULL,
    lastName varchar(50) NOT NULL,
    lastSeen bigint NOT NULL,
    userLevel int NOT NULL,
    username varchar(50) NOT NULL,
    password varchar(256) NOT NULL,
    email varchar(100) NOT NULL
);

CREATE INDEX name_index ON University(name);

CREATE TABLE University_Members(
    umID int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    universityID varchar(50) NOT NULL,
    userID varchar(50) NOT NULL,
    universityName varchar(100) NOT NULL,
    FOREIGN KEY (universityID) REFERENCES University(universityID) ON DELETE CASCADE,
    FOREIGN KEY (universityName) REFERENCES University(name) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES User(userID) ON DELETE CASCADE
);

CREATE TABLE RSO(
    rsoID varchar(50) PRIMARY KEY NOT NULL,
    name varchar(100) NOT NULL,
    description varchar(500) NOT NULL
);

CREATE INDEX name_index ON RSO(name);

CREATE TABLE RSO_Members(
    rsomID int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    rsoID varchar(50) NOT NULL,
    userID varchar(50) NOT NULL,
    rsoName varchar(100) NOT NULL,
    memberType int NOT NULL,
    FOREIGN KEY (rsoID) REFERENCES RSO(rsoID) ON DELETE CASCADE,
    FOREIGN KEY (rsoName) REFERENCES RSO(name) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES User(userID) ON DELETE CASCADE
);

CREATE TABLE Event(
    eventID varchar(50) PRIMARY KEY NOT NULL,
    hostID varchar(50) NOT NULL,
    hostType int NOT NULL,
    name varchar(100) NOT NULL,
    category varchar(50) NOT NULL,
    description varchar(500) NOT NULL,
    locationID varchar(50) NOT NULL,
    date bigint NOT NULL,
    email varchar(100) NOT NULL,
    phone varchar(20) NOT NULL,
    FOREIGN KEY (locationID) REFERENCES Location(locationID) ON DELETE CASCADE
);

CREATE TABLE Comment(
    commentID varchar(50) PRIMARY KEY NOT NULL,
    eventID varchar(50) NOT NULL,
    userID varchar(50) NOT NULL,
    content varchar(500) NOT NULL,
    FOREIGN KEY (eventID) REFERENCES Event(eventID) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES User(userID) ON DELETE CASCADE
);

