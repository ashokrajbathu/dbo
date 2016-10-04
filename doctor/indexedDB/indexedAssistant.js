var COMPAT_ENVS = [
    ['Firefox', ">= 16.0"],
    ['Google Chrome',
        ">= 24.0 (you may need to get Google Chrome Canary), NO Blob storage support"
    ]
];
var compat = $('#compat');
compat.empty();
compat.append('<ul id="compat-list"></ul>');
COMPAT_ENVS.forEach(function(val, idx, array) {
    $('#compat-list').append('<li>' + val[0] + ': ' + val[1] + '</li>');
});

const DB_NAME = 'dbotica-indexedDB';
const DB_VERSION = 2; // Use a long long for this value (don't use a float)
const DB_DRUG_STORE = 'drugs';
const DB_PATIENT_STORE = 'patients';
const DB_SYNC_STORE = 'syncStore';



var db;

// Used to keep track of which view is displayed to avoid uselessly reloading it
var current_view_pub_key;
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
if (!window.indexedDB) {}


function openDb(callBack) {
    var req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = function(event) {
        // Better use "this" than "req" to get the result to avoid problems with
        // garbage collection.
        // db = req.result;
        db = event.target.result;
        syncAllDrugsToIndexedDB();
        if (!!callBack) {
            callBack();
        }
    };
    req.onerror = function(event) {
        console.error("openDb:", event.target.errorCode);
    };



    req.onupgradeneeded = function(event) {
        db = event.target.result;
        event.target.transaction.oncomplete = function(e) {
            limitDrugIndex = 1000;
            totalDrugCount = 0;

        };
        event.target.transaction.onerror = indexedDB.onerror;

        event.target.transaction.onabort = function(e) {};
        if (!db.objectStoreNames.contains(DB_DRUG_STORE)) {
            var drugStore = db.createObjectStore(DB_DRUG_STORE, { keyPath: "id" });
            drugStore.createIndex('brandName', 'brandName', { unique: false });
        }
        if (!db.objectStoreNames.contains(DB_PATIENT_STORE)) {
            var patientStore = db.createObjectStore(DB_PATIENT_STORE, { keyPath: "id" });
            patientStore.createIndex('phoneNumber', 'phoneNumber', { unique: false });
        }

        if (!db.objectStoreNames.contains(DB_SYNC_STORE)) {
            var syncStore = db.createObjectStore(DB_SYNC_STORE, { keyPath: "store" });
        }


    };
}

/*
 * Generic functions for objectstores
 *
 *
 */
function getObjectStore(store_name, mode) {
    var tx = db.transaction(store_name, mode);
    return tx.objectStore(store_name);
}

function clearObjectStore(store_name) {

    var store = getObjectStore(store_name, 'readwrite');
    var req = store.clear();
    req.onsuccess = function(evt) {
        //displayActionSuccess("Store cleared");
        //displayPubList(store);
    };
    req.onerror = function(evt) {
        console.error("clearObjectStore:", evt.target.errorCode);
        //displayActionFailure(this.error);
    };
}
/*
Functions for getting all objects of different objectStores from server
*/

/**
 * sync all drugs in a loop from server.
 * 
 */

var limitDrugIndex;
var totalDrugCount;


function syncAllDrugsToIndexedDB() {
    var syncStore = getObjectStore(DB_SYNC_STORE, 'readonly');
    var startDrugIndex = 0;
    var lastUpdatedDrugIndex = 0;
    var request = syncStore.get(DB_DRUG_STORE);
    request.onsuccess = function(event) {
        var obj = request.result;
        if (obj && obj != null) {
            if (obj.store == DB_DRUG_STORE) {

                startDrugIndex = obj["start"];
                lastUpdatedDrugIndex = (obj["lastUpdated"] && obj["lastUpdated"] != null) ? obj["lastUpdated"] : 0;

            }

        }

        $.ajax({
            type: "GET",
            url: "http://localhost:8081/dbotica-spring/drug/getDrugs",
            data: {
                'start': startDrugIndex,
                'limit': 1000,
                'lastUpdated': lastUpdatedDrugIndex
            },
            xhrFields: {
                withCredentials: true
            },
            success: function(response) {

                var data = $.parseJSON(response.response);
                //console.log("In sync drugs: " + response.totalCount + " " + data.length);
                var drugObjectStore = getObjectStore(DB_DRUG_STORE, "readwrite");
                totalDrugCount = response.totalCount;

                for (var i = 0, l = data.length; i < l; i++) {
                    var drugObject = data[i];
                    drugObject['brandName'] = drugObject['brandName'].toLowerCase();
                    //console.log(drugObject);
                    drugObjectStore.put(drugObject);
                }
                startDrugIndex = startDrugIndex + data.length;
                var syncStore = getObjectStore(DB_SYNC_STORE, 'readwrite');
                var request1 = syncStore.get(DB_DRUG_STORE);
                request1.onsuccess = function(event) {


                    if (startDrugIndex < totalDrugCount) {
                        var obj1 = {};
                        obj1["store"] = DB_DRUG_STORE;
                        obj1["start"] = startDrugIndex;
                        obj1["lastUpdated"] = lastUpdatedDrugIndex;
                        var req = syncStore.put(obj1);
                        req.onsuccess = function(event) {
                            syncAllDrugsToIndexedDB();
                        }
                        req.onerror = function() {
                            console.error("syncAllDrugstoIndexedDB second req ", this.error);
                        }

                    } else {
                        var obj = {};
                        obj["store"] = DB_DRUG_STORE;
                        obj["start"] = 0;
                        obj["lastUpdated"] = (new Date).getTime();
                        var req1 = syncStore.put(obj);
                        req1.onsuccess = function(event) {}
                        req1.onerror = function() {
                            console.error("syncAllDrugstoIndexedDB third error ", this.error);
                        }
                    }



                }


            }
        });



    }
    request.onerror = function() {
        console.error("syncAllDrugstoIndexedDB first request ", this.error);
    }


}



/*
 *  Get all prescriptions issued by this doctor
 */





/*
Get all patiensts of this doctor from server
*/
//TODO
function syncAllPatientsToIndexedDB() {

    $.ajax({
        type: "GET",
        url: "http://localhost:8081/dbotica-spring/doctor/myPatients",
        success: function(response) {
            var data = $.parseJSON(response.response);
            //console.log(data);
            var patientObjectStore = getObjectStore(DB_PATIENT_STORE, "readwrite");
            for (var i = 0, l = data.length; i < l; i++) {
                patientObjectStore.put(data[i]);
            }
        }
    });

}



function addPatientObjecttoIndexedDB(obj) {
    var store = getObjectStore(DB_PATIENT_STORE, 'readwrite');
    var request = store.get(obj.id);
    request.onsuccess = function(event) {
        var patient = request.result;
        var requestUpdate = store.put(obj);
        requestUpdate.onsuccess = function(event) {
            showAllPatients();

        }
        requestUpdate.onerror = function() {
            console.error("addPatientObjecttoIndexedDB", this.error);
        }
    }

}

function updatePatientObjectIndexedDB(obj) {
    var store = getObjectStore(DB_PATIENT_STORE, 'readwrite');
    var index = store.index("phoneNumber");
    index.openCursor(obj.phoneNumber).onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            var data = cursor.value;
            data['gender'] = obj['gender'];
            data['firstName'] = obj['firstName'];
            data['emailId'] = obj['emailId'];
            //data['phoneNumber']   =   obj['phoneNumber'];
            data['age'] = obj['age'];
            data['bloodGroup'] = obj['bloodGroup'];
            var requestUpdate = store.put(data);
            requestUpdate.onsuccess = function(event) {
                showAllPatients();
            }
            requestUpdate.onerror = function() {
                console.error("updatePatientObjectIndexedDB ", this.error);
            }
        }

    }
}

/*
 * Get objects from object store when offline or any other time
 *
 */

/*
Get Patient from object store from phone number
*/

function getPatientByPhoneNumberFromIndexedDB(phoneNumber) {
    var store = getObjectStore(DB_PATIENT_STORE, 'readonly');
    var index = store.index("phoneNumber");
    index.get(phoneNumber).onsuccess = function(event) {
        return event.target.result;

    };
}






/*
 * Autocomplete search from indexedDB
 */
function autocompleteDrugIndexedDB(searchterm, id, handleData, callback) {


    var result = [];
    var flag = 0;
    var count = 0;
    //console.log("Enterering autocompleteDrugIndexedDB");
    var store = getObjectStore(DB_DRUG_STORE, 'readonly');
    var range = IDBKeyRange.bound(searchterm.toLowerCase(), searchterm.toLowerCase() + '\uffff', false, true);
    var index = store.index("brandName");
    index.openCursor(range).onsuccess = function(event) {
        var cursor = event.target.result;
        //console.log(cursor);
        if (cursor && count < 10) {
            result.push(cursor.value);
            //console.log(cursor.value);
            count++;
            cursor.continue();
        } else {


            /*console.log("reult in index is-------", result);*/
            handleData(result, callback);
            //callback(result);


        }
    };

}






/*
 For debugging
*/

function showAllPatients() {
    var store = getObjectStore(DB_PATIENT_STORE, 'readonly');
    store.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            /*console.log(cursor.value);*/
            cursor.continue();
        }
    }

}




















/**
 * @param {string} biblioid
 */
function deletefromIndexedDb(biblioid) {
    var store = getObjectStore(DB_STORE_NAME, 'readwrite');
    var req = store.index('biblioid');
    req.get(biblioid).onsuccess = function(evt) {
        if (typeof evt.target.result == 'undefined') {
            displayActionFailure("No matching record found");
            return;
        }
        deletefromIndexedDb(evt.target.result.id, store);
    };
    req.onerror = function(evt) {
        console.error("deletePublicationFromBib:", evt.target.errorCode);
    };
}
