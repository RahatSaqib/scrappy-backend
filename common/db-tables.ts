
/**
 * Query for Creating properties Table
 */

const createPropertyTable = `CREATE TABLE properties (
        id int NOT NULL AUTO_INCREMENT,
        name varchar(100),
        state varchar(100),
        createdDatetimeStamp datetime DEFAULT CURRENT_TIMESTAMP,
        lastModified datetime ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    );`

/**
* Query for Creating providers Table
*/

const createProvidersTable = `CREATE TABLE providers (
        id int NOT NULL AUTO_INCREMENT,
        name varchar(100),
        address varchar(255),
        city varchar(50),
        country varchar(50),
        phone varchar(20),
        type varchar(255),
        zipcode varchar(20),
        capacity varchar(20),
        state varchar(50),
        property_id int,
        createdDatetimeStamp datetime DEFAULT CURRENT_TIMESTAMP,
        lastModified datetime ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (property_id) REFERENCES properties(id)
    );`

/**
* Query for Creating files Table
*/

const createFilesTable = `CREATE TABLE files (
        id int NOT NULL AUTO_INCREMENT,
        name varchar(100),
        file_key varchar(255),
        file_size varchar(20),
        file_url text,
        property_id int,
        createdDatetimeStamp datetime DEFAULT CURRENT_TIMESTAMP,
        lastModified datetime ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (property_id) REFERENCES properties(id)
    );`



export default {
    createPropertyTable,
    createProvidersTable,
    createFilesTable
}