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
const DB_VERSION = 1; // Use a long long for this value (don't use a float)
const DB_DRUG_STORE = 'drugs';
const DB_PATIENT_STORE = 'patients';
const DB_PRESCRIPTION_STORE = 'prescriptions';

const doctorId = localStorage.getItem('doctorId');

var db;

// Used to keep track of which view is displayed to avoid uselessly reloading it
var current_view_pub_key;
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
if (!window.indexedDB) {
    console.log("Your Browser doesnot support indexedDB");
}


function openDb(callBack) {
    console.log("openDb ...");
    var req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = function(event) {
        // Better use "this" than "req" to get the result to avoid problems with
        // garbage collection.
        // db = req.result;
        db = event.target.result;
        if (!!callBack) {
            callBack();
        }

        console.log("openDb DONE success");



    };
    req.onerror = function(event) {
        console.error("openDb:", event.target.errorCode);
    };



    req.onupgradeneeded = function(event) {
        console.log("openDb.onupgradeneeded");
        db = event.target.result;
        event.target.transaction.oncomplete = function(e) {
			console.log("Transaction success");
            startDrugIndex = 0;
            limitDrugIndex = 1000;
            totalDrugCount = 0;
            syncAllDrugstoIndexedDB();

            startPrescriptionIndex = 0;
            limitPrescriptionIndex = 100;
            totalPrescriptionCount = 0;

            console.log("doctorId ", doctorId);
            syncAllPrescriptionsToIndexedDB(doctorId);
        };
        event.target.transaction.onerror = indexedDB.onerror;

        event.target.transaction.onabort = function(e) {
            console.log("abort: " + e.target.error.message);
        };

        var drugStore = db.createObjectStore(DB_DRUG_STORE, { keyPath: "id" });
        var patientStore = db.createObjectStore(DB_PATIENT_STORE, { keyPath: "id" });
        var prescriptionStore = db.createObjectStore(DB_PRESCRIPTION_STORE, { autoIncrement: true });



        drugStore.createIndex('brandName', 'brandName', { unique: false });
        patientStore.createIndex('phoneNumber', 'phoneNumber', { unique: false });
        prescriptionStore.createIndex('creationTime', 'creationTime', { unique: true });
        prescriptionStore.createIndex('patientPhoneNumber-creationTime', ['patientPhoneNumber', 'creationTime'], { unique: false });


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
var startDrugIndex;
var limitDrugIndex;
var totalDrugCount;


function syncAllDrugstoIndexedDB() {

    $.ajax({
        type: "GET",
        url: "http://localhost:8081/dbotica-spring/drug/getDrugs",
        data: {
            'start': startDrugIndex,
            'limit': limitDrugIndex
        },
        success: function(response) {

            var data = $.parseJSON(response.response);
            console.log("In sync drugs: " + response.totalCount + " " + data.length);
            var drugObjectStore = getObjectStore(DB_DRUG_STORE, "readwrite");
            totalDrugCount = response.totalCount;
            startDrugIndex = startDrugIndex + data.length;
            for (var i = 0, l = data.length; i < l; i++) {
				var drugObject = data[i];
				drugObject['brandName'] = drugObject['brandName'].toLowerCase();
				console.log(drugObject);
                drugObjectStore.add(drugObject);
            }
            if (startDrugIndex < totalDrugCount)
                syncAllDrugstoIndexedDB();
            else
                console.log("Sync all drus to indexedDB Done");
        }
    });
}



/*
 *	Get all prescriptions issued by this doctor
 */
var startPrescriptionIndex;
var limitPrescriptionIndex;
var totalPrescriptionCount;

function syncAllPrescriptionsToIndexedDB(doctorId) {
    $.ajax({
        type: "GET",
        url: "http://localhost:8081/dbotica-spring/doctor/myPrescriptions",
        data: {
            'doctorId': doctorId,
            'start': startPrescriptionIndex,
            'limit': limitPrescriptionIndex

        },
        success: function(response) {
            var data = {};
            data = $.parseJSON(response.response);
            //console.log(data);
            //var prescriptionObjectStore = getObjectStore(DB_PRESCRIPTION_STORE,"readwrite");
            console.log("prescriptions ", data);
            console.log("DB_PATIENT_STORE ", DB_PATIENT_STORE);
            var patientObjectStore = getObjectStore(DB_PATIENT_STORE, "readwrite");
            totalPrescriptionCount = response.totalCount;
            startPrescriptionIndex = startPrescriptionIndex + data.length;

            for (var i = 0, l = data.length; i < l; i++) {
                if (data[i]["patientInfo"] !== undefined) {
                    patientObjectStore.put(data[i]["patientInfo"]);
                }
                addPrescriptionToIndexedDB(data[i]["prescription"], data[i]["patientInfo"], data[i]["doctorInfo"]["id"]);

            }
            if (startPrescriptionIndex < totalPrescriptionCount)
                syncAllPrescriptionsToIndexedDB(doctorId);
            else
                console.log("Sync all prescriptions to IndexedDB done");


        }
    });
}



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

/*
 *
 * Store a object in respective object store
 *
 *
 */

/*
 *	Adding prescription
 */


/*
    Prescription prescription;
	Patient patientInfo;
	Doctor doctorInfo;
  */

function addPrescriptionToIndexedDB(prescription, patientInfo, doctorId) {
    console.log("addPrescription argumensts:", arguments);
	var patientName = (patientInfo && patientInfo !== "") ? patientInfo.firstName : "Unknown" ;
	var patientPhoneNumber = (patientInfo && patientInfo !== "") ? patientInfo.phoneNumber : 0;
    var obj = { "prescription": prescription, "patientInfo": patientInfo, "doctorId": doctorId, "patientName": patientName, "patientPhoneNumber": patientPhoneNumber, "creationTime": new Date(prescription.creationTime) };
    var store = getObjectStore(DB_PRESCRIPTION_STORE, 'readwrite');
    console.log("prescription obj", obj);
    var req = store.add(obj);

    req.onsuccess = function(event) {
        console.log("AddPrescription successfull");
        console.log(obj);
    }
    req.onerror = function(event) {
        console.log("AddPrescription error:", this.error);
    }
}

/**
   * Adding a patient to indexedDB
   * String firstName;
	 String emailId;
	 Boolean isEmailVerified;
	 String phoneNumber;
	 String password;
	 Boolean isPhoneVerified;
	 String userName;
	 Integer age;
	 String city;
	 String id;
	 String gender;
	 String bloodGroup;
   * 
   * 
   * 
   */
/*function addPatienttoIndexedDB(id, firstName, emailId, isEmailVerified, phoneNumber, isPhoneVerified, userName, age, city, gender, bloodGroup) {
    console.log("addPatient aruguments:", arguments);
    var obj = { "id": id, "firstName": firstName, "emailId": emailId, "isEmailVerified": isEmailVerified, "phoneNumber": phoneNumber, "isPhoneVerified": isPhoneVerified, "userName": userName, "age": age, "city": city, "gender": gender, "bloodGroup": bloodGroup };
    var store = getObjectStore(DB_PATIENT_STORE, 'readwrite');

    var req = store.add(obj);
    req.onsuccess = function(event) {
        console.log("Add Patient successfull");

    }
    req.onerror = function() {
        console.error("addPatient error", this.error);

    }

}*/

function addPatientObjecttoIndexedDB(obj) {
    console.log("addPatientObjecttoIndexedDB ", obj);
    var store = getObjectStore(DB_PATIENT_STORE, 'readwrite');
    var request = store.get(obj.id);
    request.onsuccess = function(event) {
        var patient = request.result;
        console.log("addPatientObjecttoIndexedDB previous patient", patient);
        var requestUpdate = store.put(obj);
        requestUpdate.onsuccess = function(event) {
            console.log("addPatientObjecttoIndexedDB Done");
            console.log("Showing all patients");
            showAllPatients();

        }
        requestUpdate.onerror = function() {
            console.error("addPatientObjecttoIndexedDB", this.error);
        }
    }

}

function updatePatientObjectIndexedDB(obj) {
    console.log("updatePatientObjectIndexedDB", obj);
    var store = getObjectStore(DB_PATIENT_STORE, 'readwrite');
    var index = store.index("phoneNumber");
    index.openCursor(obj.phoneNumber).onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            var data = cursor.value;
            data['gender'] = obj['gender'];
            data['firstName'] = obj['firstName'];
            data['emailId'] = obj['emailId'];
            //data['phoneNumber']	=   obj['phoneNumber'];
            data['age'] = obj['age'];
            data['bloodGroup'] = obj['bloodGroup'];
            var requestUpdate = store.put(data);
            requestUpdate.onsuccess = function(event) {
                console.log("updatePatientObjectIndexedDB Done");
                console.log("Showing all patients");
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
 
 function getPatientByPhoneNumberFromIndexedDB(phoneNumber){
	 var store = getObjectStore(DB_PATIENT_STORE, 'readonly');
	 var index = store.index("phoneNumber");
	 index.get(phoneNumber).onsuccess = function(event){
		 console.log("getPatientByPhoneNumberFromIndexedDB ", event.target.result);
		 return event.target.result;
		 
	 };
 }
 
 

/*
 * get all prescriptions of this doctor from indexedDB
 *
 */

function getAllPrescriptionsFromIndexedDB(addDataToTable,callBackAfterAdding, id) {
    var result = [];

    var store = getObjectStore(DB_PRESCRIPTION_STORE, 'readonly');
    var index = store.index("creationTime");

    index.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            if (cursor.value.doctorId == doctorId) {
                result.push(cursor.value);
                addDataToTable(cursor.value);
            }

            cursor.continue();
        } else {
            callBackAfterAdding(id);


        }
        //console.log("objects are----", result); //addDataToTable(result);
    };


}

/*function getPrescriptionsByPatientNameFromIndexedDB(patientName, addDataToTable) {
    var result = [];

    var store = getObjectStore(DB_PRESCRIPTION_STORE, 'readonly');
    var index = store.index("patientName");
    var range = IDBKeyRange.bound(patientName.toLowerCase(), patientName.toLowerCase() + "z", false, true);

    index.openCursor(range).onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            if (cursor.value.doctorId == doctorId) {
                result.push(cursor.value);
                addDataToTable(cursor.value);

            }

            cursor.continue();
        }
    };
}*/

function getPrescriptionsByTimeFromIndexedDB(fromDate, toDate, addDataToTable,callBackAfterAdding,id) {
    var result = [];
    var store = getObjectStore(DB_PRESCRIPTION_STORE, 'readonly');
    var index = store.index("creationTime");
    var range;
    if (fromDate != "" && toDate != "") {
        range = IDBKeyRange.bound(fromDate, toDate);
    } else if (fromDate == "") {
        range = IDBKeyRange.upperBound(toDate);
    } else {
        range = IDBKeyRange.lowerBound(fromDate);
    }
    index.openCursor(range).onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            if (cursor.value.doctorId == doctorId) {
                result.push(cursor.value);
                addDataToTable(cursor.value);

            }

            cursor.continue();
        } else {
            if (!!callBackAfterAdding) {
                callBackAfterAdding(id);
            }
            console.log(result);
        }
    };

}

function getPrescriptionsFromIndexedDB(fromDate, toDate, phoneNumber, addDataToTable, callBackAfterAdding,id) {
    var result = [];
    var store = getObjectStore(DB_PRESCRIPTION_STORE, 'readonly');
    var index = store.index('patientPhoneNumber-creationTime');
    var range;
    var initDay = new Date("Fri Mar 25 2016 18:53:37 GMT+0530");
    var today = new Date();
    if (fromDate == "" && toDate == "" && phoneNumber == "") {
        alert("No filter has been applied showing all the data");
        console.log("No Date range specified");
        getAllPrescriptionsFromIndexedDB(addDataToTable,callBackAfterAdding,id);
        return;
    }

    if (fromDate != "")
        fromDate = new Date(fromDate);
    if (toDate != "")
        toDate = new Date(toDate);
    console.log("indexeddb from date ", fromDate);
    console.log("indexeddb to date ", toDate);
    console.log("indexeddb phone number ", phoneNumber);
    if (phoneNumber != "") {
        if (fromDate != "" && toDate != "") {
            range = IDBKeyRange.bound([phoneNumber, fromDate], [phoneNumber, toDate]);
        } else if (toDate != "") {
            range = IDBKeyRange.bound([phoneNumber, initDay], [phoneNumber, toDate]);
        } else if (fromDate != "") {
            range = IDBKeyRange.bound([phoneNumber, fromDate], [phoneNumber, today]);
        } else {
            range = IDBKeyRange.bound([phoneNumber, initDay], [phoneNumber, today]);
        }
    } else {
        getPrescriptionsByTimeFromIndexedDB(fromDate, toDate, addDataToTable,callBackAfterAdding,id);

        return;
    }


    index.openCursor(range).onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            if (cursor.value.doctorId == doctorId) {
                result.push(cursor.value);
                addDataToTable(cursor.value);

            }

            cursor.continue();
        } else {
            console.log(result);
            //if (!!callBackAfterAdding) {
                callBackAfterAdding(id);
            //}
        }
    };
}




/*
 * Autocomplete search from indexedDB
 */
function autocompleteDrugIndexedDB(searchterm,id, handleData) {
	
		
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
        if (cursor && count < 100) {
            result.push(cursor.value);
            //console.log(cursor.value);
            count++;
            cursor.continue();
        } else {
			
			if(searchterm === $(id).val()){
				console.log($(id).val());
				handleData(result);
				
			}
        }
    };

}

/*
  $('#prescription-form-drug').keyup(function(e){
  var brandName = $('#prescription-form-drug').val();
  if (brandName === "") {
	$('.drugs-dropdown-menu').hide('dropdown');
    return;
  }
  e.preventDefault();
  $('.drugs-dropdown-menu').hide('dropdown');
  $('.drugs-dropdown-menu').empty();
  
    
   autocompleteDrugIndexedDB(brandName,OnGetDrugsResponse);
  
});

*/




/*
 For debugging
*/

function showAllPatients() {
    var store = getObjectStore(DB_PATIENT_STORE, 'readonly');
    store.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            console.log(cursor.value);
            cursor.continue();
        }
    }

}



















/**
 * @param {string} biblioid
 */
function deletefromIndexedDb(biblioid) {
    console.log("deletePublication:", arguments);
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