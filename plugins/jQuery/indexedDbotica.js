

var COMPAT_ENVS = [
    ['Firefox', ">= 16.0"],
    ['Google Chrome',
     ">= 24.0 (you may need to get Google Chrome Canary), NO Blob storage support"]
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
  

  var db;

  // Used to keep track of which view is displayed to avoid uselessly reloading it
  var current_view_pub_key;
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  if(!window.indexedDB){
			console.log("Your Browser doesnot support indexedDB");
	}
			

  function openDb() {
    console.log("openDb ...");
    var req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = function (evt) {
      // Better use "this" than "req" to get the result to avoid problems with
      // garbage collection.
      // db = req.result;
      db = event.target.result;
      console.log("openDb DONE");
    };
    req.onerror = function (event) {
      console.error("openDb:", event.target.errorCode);
    };

    req.onupgradeneeded = function (event) {
      console.log("openDb.onupgradeneeded");
      var drugStore = event.currentTarget.result.createObjectStore(DB_DRUG_STORE, { keyPath: "id"});
	  var patientStore = event.currentTarget.result.createObjectStore(DB_PATIENT_STORE, {keyPath : "id", autoincrement = true});
	  var prescriptionStore = event.currentTarget.result.createObjectStore(DB_PRESCRIPTION_STORE,{keyPath : "id", autoincrement = true});
		
		

      drugStore.createIndex('brandName', 'brandName', { unique: false });
	  prescriptionStore.createIndex('creationTime', 'creationTime',{unique: true});
	  prescriptionStore.createIndex('patientId','patientId',{unique: false});
	  
	  startDrugIndex =0;
	  limitDrugIndex = 100;
	  totalDrugCount = 0;
	  syncAllDrugstoIndexedDB();
	  
	  startPrescriptionIndex = 0;
	  limitPrescriptionIndex = 100;
      totalPrescriptionCount = 0;
	  syncAllPrescriptionsToIndexedDB();
	  
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
    req.onerror = function (evt) {
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
		  data:{
			  'start' : startDrugIndex ,
			  'limit' : limitDrugIndex 
		  },
		  success: funtion(response){
			  var data = $.parseJSON(response.response);
			  //console.log(data);
			  var drugObjectStore = getObjectStore(DB_DRUG_STORE,"readwrite");
			  totalDrugCount = response.totalCount;
			  startDrugIndex = startDrugIndex + data.length;
			  for(var i =0,l = data.length; i < l; i++){
				  drugObjectStore.add(data[i]);
			  }
			  if(startDrugIndex < totalDrugCount)
				  syncAllDrugstoIndexedDB();
		  }
	  });
  }
				

  
  /*
  *	Get all prescriptions issued by this doctor
  */
  var startPrescriptionIndex;
  var limitPrescriptionIndex;
  var totalPrescriptionCount;
  function syncAllPrescriptionsToIndexedDB(doctorId){
	  $.ajax({
		  type: "GET",
		  url: "http://localhost:8081/dbotica-spring/drug/myPrescriptions",
		  data:{
			  'name' : doctorId,
			  'start' : startPrescriptionIndex,
			  'limit' : limitPrescriptionIndex
			  
		  },
		  success: funtion(response){
			  var data = $.parseJSON(response.response);
			  //console.log(data);
			  var prescriptionObjectStore = getObjectStore(DB_PRESCRIPTION_STORE,"readwrite");
			  var patientObjectStore = getObjectStore(DB_PATIENT_STORE,"readwrite");
			  totalPrescriptionCount = response.totalCount;
			  startPrescriptionIndex = startPrescriptionIndex + data.length;
			  
			  for(var i =0,l = data.length; i < l; i++){
				  patientObjectStore.add(data[i]["patientInfo"]);
				  prescriptionObjectStore.add(data[i]);
			  }
			  if(startPrescriptionIndex < totalPrescriptionCount)
				  syncAllPrescriptionsToIndexedDB();
			  
		  }
	  });
  }
  
  			
		
  /*
  Get all patiensts of this doctor from server
  */
  //TODO
  function syncAllPatientsToIndexedDB(){
	  
	  $.ajax({
					type: "GET",
					url: "http://localhost:8081/dbotica-spring/drug/getAllPatientsToIndexedDB",
					success: funtion(response){
						var data = $.parseJSON(response.response);
						//console.log(data);
						var patientObjectStore = getObjectStore(DB_PATIENT_STORE,"readwrite");
						for(var i =0,l = data.length; i < l; i++){
							patientObjectStore.add(data[i]);
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
  
  function addPrescriptiontoIndexedDB(prescription, patientInfo, doctorInfo){
	  console.log("addPrescription argumensts:", arguments);
	  var obj = { "prescription" : prescription, "patientInfo" : patientInfo, "doctorInfo" : doctorInfo};
	  var store = getObjectStore(DB_PRESCRIPTION_STORE,'readwrite');
	  var req = store.add(obj);
	  req.onsuccess = function(event){
		  console.log("AddPrescription successfull");
	  }
	  req.onerror = function(event){
		  console.log("AddPrescription error:", this.error);
	  }
  }
  
  /**
   * Adding a patient to indexedDB
   * String firstName;
	 String lastName;
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
   function addPatienttoIndexedDB(id, firstName, lastName,emailId,isEmailVerified,phoneNumber,isPhoneVerified,userName,age,city,gender,bloodGroup){
	   console.log("addPatient aruguments:", arguments);
	   var obj = {"id" :id, "firstName" : firstName, "lastName": lastName,"emailId": emailId,"isEmailVerified" : isEmailVerified ,"phoneNumber" : phoneNumber,"isPhoneVerified" : isPhoneVerified,"userName" : userName, "age" : age,"city" : city, "gender" :gender,"bloodGroup" : bloodGroup};
	   var store = getObjectStore(DB_PATIENT_STORE,'readwrite');
	   var req = store.add(obj);
	   req.onsuccess = function(event){
		   console.log("Add Patient successfull");
		   
	   }
	   req.onerror = function(){
		   console.error("addPatient error", this.error);
		   
	   }
	   
  }
  
  /*
   * Get objects from object store when offline or any other time
   *
   */
   
   
   /*
    * get all prescriptions of this doctor from indexedDB
	*
    */
   
   function getAllPrescriptionsFromIndexedDB(){
	  var result=[];

	  var store = getObjectStore(DB_PRESCRIPTION_STORE,'readonly');
	  
	  var index = store.index("creationTime");
	  index.openCursor().onsuccess = function(event){
		  var cursor = event.target.result;
		  if(cursor){
			  result.push(cursor.value);
			  cursor.continue;
		  }
	  }
	  return result;
	  
  }
  
  /*
   * Get a prescription of particular patient from indexedDB
   */
  
  function getPrescriptionsOfPatient(patientId){
	  var result=[];
	  var store = getObjectStore(DB_PRESCRIPTION_STORE,'readonly');
	  var range = IDBKeyRange.only(patientId);
	  var index = store.index("patientId");
	  index.openCursor(range).onsuccess = function(event){
		  var cursor = event.target.result;
		  if(cursor){
			  result.push(cursor.value);
			  cursor.continue;
		  }
	  }
	  return result;
	  
  }
  /*
   * Autocomplete search from indexedDB
   */
  function autocompleteDrugIndexedDB(searchterm){
	  var result=[];
	  var store = getObjectStore(DB_DRUG_STORE,'readonly');
	  var range = IDBKeyRange.bound(searchterm.toLowerCase(),searchterm.toLowerCase()+"z");
	  var index = store.index("brandName");
	  index.openCursor(range).onsuccess = function(event){
		  var cursor = event.target.result;
		  if(cursor){
			  result.push(cursor.value);
			  cursor.continue;
		  }
	  }
	  return result;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  

  
  
  

  

  

  
  

  /**
   * @param {string} biblioid
   */
  function deletePublicationFromBib(biblioid) {
    console.log("deletePublication:", arguments);
    var store = getObjectStore(DB_STORE_NAME, 'readwrite');
    var req = store.index('biblioid');
    req.get(biblioid).onsuccess = function(evt) {
      if (typeof evt.target.result == 'undefined') {
        displayActionFailure("No matching record found");
        return;
      }
      deletePublication(evt.target.result.id, store);
    };
    req.onerror = function (evt) {
      console.error("deletePublicationFromBib:", evt.target.errorCode);
    };
  }

  

  /*function addEventListeners() {
    console.log("addEventListeners");

    $('#register-form-reset').click(function(evt) {
      resetActionStatus();
    });

    $('#add-button').click(function(evt) {
      console.log("add ...");
      var title = $('#pub-title').val();
      var biblioid = $('#pub-biblioid').val();
      if (!title || !biblioid) {
        displayActionFailure("Required field(s) missing");
        return;
      }
      var year = $('#pub-year').val();
      if (year != '') {
        // Better use Number.isInteger if the engine has EcmaScript 6
        if (isNaN(year))  {
          displayActionFailure("Invalid year");
          return;
        }
        year = Number(year);
      } else {
        year = null;
      }

      var file_input = $('#pub-file');
      var selected_file = file_input.get(0).files[0];
      console.log("selected_file:", selected_file);
      // Keeping a reference on how to reset the file input in the UI once we
      // have its value, but instead of doing that we rather use a "reset" type
      // input in the HTML form.
      //file_input.val(null);
      var file_url = $('#pub-file-url').val();
      if (selected_file) {
        addPublication(biblioid, title, year, selected_file);
      } else if (file_url) {
        addPublicationFromUrl(biblioid, title, year, file_url);
      } else {
        addPublication(biblioid, title, year);
      }

    });

    $('#delete-button').click(function(evt) {
      console.log("delete ...");
      var biblioid = $('#pub-biblioid-to-delete').val();
      var key = $('#key-to-delete').val();

      if (biblioid != '') {
        deletePublicationFromBib(biblioid);
      } else if (key != '') {
        // Better use Number.isInteger if the engine has EcmaScript 6
        if (key == '' || isNaN(key))  {
          displayActionFailure("Invalid key");
          return;
        }
        key = Number(key);
        deletePublication(key);
      }
    });

    $('#clear-store-button').click(function(evt) {
      clearObjectStore();
    });

    var search_button = $('#search-list-button');
    search_button.click(function(evt) {
      displayPubList();
    });

  }
   */
  //openDb();
  

 // Immediately-Invoked Function Expression (IIFE)