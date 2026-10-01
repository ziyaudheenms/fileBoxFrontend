// In FileBox we are using DEXIE DB for handling all our indexed DB operations.
// source :- https://dexie.org/docs/Tutorial/React
// Dexie Db is a production grade indexedDB wrapper for Browser.
//Documenting some things here in the code so that i can sort of revise , revisit ect, for understanding the code in future.


// SETTING UP THE DEXIE INDEXEDDB FOR FILEBOX -> SESSION DATA STORAGE
import { Dexie, type Table } from "dexie"

// we have to define a table schema
export interface securityKeySessionDB {
    id: string,    // id is the key which that we use to mention
    payload?: any // will the encrypted payload which we will store in the indexedDB
} 


class FileBoxSessionDB extends Dexie {
    // we have to define a table schema
    securityKeySessionDB!: Table<securityKeySessionDB, string> // id is the primary key   -> secuityKeySessionDB is the table name and string is the type of primary key

    constructor() {
        super("filebox_dexie_session_db")  // name of the databse used internally by dexie

        this.version(1).stores({
            securityKeySessionDB: "id" // this operations mentions that the 'id' will be considered as the primary key for the table 'securityKeySessionDB'
        });
    }
}

export const fileBoxSessionDB = new FileBoxSessionDB() // exporting the instance of the class so that we can use it in other files