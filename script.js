"use strict";

console.log("Hello Hogwarts");

window.addEventListener("DOMContentLoaded", start);

const url = "https://petlatkea.dk/2021/hogwarts/students.json";
const bloodurl = "https://petlatkea.dk/2021/hogwarts/families.json";

let allStudents = [];
let halfBloodFamNames;
let pureBloodFamNames;
let expelledStudents = [];

// The prototype for all students: 
const Student = {
    firstName: "",
    middleName: "",
    lastName: "",
    nickname: "",
    gender: "",
    image: "",
    house: "",
    inquis: false,
    prefect: false,
    expell: false,
    blood: "",
    fullname: ""
}

const settings = {
    filterBy: "all",
    sortBy: "firstName",
    sortDir: "asc",
    currentCount: 0,
    isHacked: false
}

// START
async function start( ) {
    await loadStudentJSON();
    registerButtons();
    console.log("ready");
}

function registerButtons() {
    document.querySelectorAll("[data-action='filter']").forEach(button => button.addEventListener("click", selectFilter));
    document.querySelectorAll("[data-action='sort']").forEach(button => button.addEventListener("click", selectSort));
    // document.querySelector("#search").addEventListener("input", search);
}

// LOAD STUDENT JSON
async function loadStudentJSON() {
    const studentResponse = await fetch(url);
    const studentData = await studentResponse.json();
    const bloodResponse = await fetch(bloodurl);
    const bloodData = await bloodResponse.json();
    // console.log(bloodData)
    // console.table(studentData);
    // when loaded, prepare data objects
    // console.log("studentData",studentData)
    // console.log("bloodData",bloodData)
    // console.log("&&&%%%%%%%%%%%%%%%%%%%%%%")
    prepareObjects( studentData, bloodData);
}

// PREPARE STUDENT DATA
function prepareObjects( studentData, bloodData ) {
    halfBloodFamNames = bloodData.half;
    pureBloodFamNames = bloodData.pure;
    allStudents = studentData.map( prepareObject );

    //bloodStatus = bloodData.map( prepareObject );
    // console.log("halfBloodFamNames",halfBloodFamNames)
    // console.table(allStudents);
    buildList();
}

// SEPERATE THE STUDENT DATA INTO MORE PROPERTIES
function prepareObject( studentData ) {
    const student = Object.create(Student);
    let fullname = studentData.fullname;
    let house = studentData.house;
    let gender = studentData.gender;
    let nickname = studentData.nickname;

    student.fullname = fullname;

    // All characters to lowercase
    fullname = fullname.toLowerCase();
    house = house.toLowerCase();

    // All characters after a space or hyphen to uppercase
    fullname = fullname.replace(/(\s|\-)\S/g, (x) => x.toUpperCase());

    // Remove spaces before and after 
    fullname = fullname.trim();
    house = house.trim();
    
    // Make all first characters in the first name uppercase
    fullname = fullname.replace(fullname[0], fullname[0].toUpperCase());
    house = house.replace(house[0], house[0].toUpperCase());
   
    // Seperate names and set image filenames (missing image name for the Patils and Fletchley)
    let middleNameStart = fullname.indexOf(" ");
    let middleNameEnd = fullname.lastIndexOf(" ");
    
    if (fullname.includes(" ")) {
        student.middleName = fullname.substring(middleNameStart+1, middleNameEnd);
        student.lastName = fullname.substring(middleNameEnd+1);
        student.firstName = fullname.substring(0, middleNameStart);
        student.image = `images/${student.lastName.toLowerCase()}_${student.firstName[0].toLowerCase()}.png`;

    } else {
        student.firstName = fullname;
        student.image = `images/${student.firstName.toLowerCase()}.png`;
    }

    student.house = house;
    student.gender = gender;
    student.nickname = nickname;

    // Check for a nickname
    if (student.middleName.includes("\"")) {
        student.nickname = student.middleName;
        student.middleName = null;
        student.nickname = student.nickname.replace(student.nickname[1], student.nickname[1].toUpperCase());
        student.nickname = student.nickname.substring(1, student.nickname.length-1);
    } 

    calculateBloodStatus();
    function calculateBloodStatus(){
        if (halfBloodFamNames.includes(student.lastName) && pureBloodFamNames.includes(student.lastName)) {
            student.blood = "pure";
        } else if (pureBloodFamNames.includes(student.lastName)) {
            student.blood = "pure";
        } else if (halfBloodFamNames.includes(student.lastName)) {
            student.blood = "half";
        } else {
            student.blood = "muggle";
        }
    }
    return student;
}

//----------------------------------------------
// FILTERING
//----------------------------------------------

function selectFilter(event){
    // console.log(event)
    // Clear searchfield
    searchInput.value = "";

    const filter = event.target.dataset.filter;
    setFilter(filter);
}

function setFilter(filter) {
    settings.filterBy = filter.replace(filter[0], filter[0].toUpperCase());
    buildList();
}

function filterList(filteredList) {
    settings.currentCount = allStudents.filter((obj) => obj.house === settings.filterBy).length;
    document.querySelector(".currentCount").textContent = `Currently displaying: ${settings.currentCount}`;

    // let filteredList = allAnimals;
    if (settings.filterBy === "Gryffindor"){
    // Create a filtered list of only cats
    filteredList = allStudents.filter(isGryff);
    } else if (settings.filterBy === "Slytherin") {
    // Create a filtered list of only dogs
    filteredList = allStudents.filter(isSlyth);
    } else if (settings.filterBy === "Ravenclaw") {
        // Create a filtered list of only dogs
        filteredList = allStudents.filter(isRaven);
    } else if (settings.filterBy === "Hufflepuff") {
        // Create a filtered list of only dogs
        filteredList = allStudents.filter(isHuffle);
    } else if (settings.filterBy === "Expelled") {
        // Create a filtered list of only dogs
        filteredList = expelledStudents;
    } else { // this "else" in unneccesary but makes it more clear
        filteredList = allStudents;
        settings.currentCount = allStudents.length;
        document.querySelector(".currentCount").textContent = `Currently displaying: ${allStudents.length}`;

    }
    return filteredList;
}

function isGryff(allStudents) {
    return allStudents.house === "Gryffindor"
    
} 
function isSlyth(allStudents) {
    return allStudents.house === "Slytherin"
} 
function isRaven(allStudents) {
    return allStudents.house === "Ravenclaw"
} 
function isHuffle(allStudents) {
    return allStudents.house === "Hufflepuff"
} 

//----------------------------------------------
// SORTING
//----------------------------------------------
// SETS SORTING AND SENDS TO sortList()
function selectSort(event) {
    // console.log(event);
    searchInput.value = "";

    const sortBy = event.target.dataset.sort;
    const sortDir = event.target.dataset.sortDirection;

    const oldElement = document.querySelector(`[data-sort="${settings.sortBy}"]`);
    oldElement.classList.remove("sortby");
    event.target.classList.add("sortby");

    if (sortDir === "desc") {
        event.target.dataset.sortDirection = "asc";
    } else {
        event.target.dataset.sortDirection = "desc";
    }
    setSort(sortBy, sortDir);
}

function setSort(sortBy,sortDir) {
    settings.sortBy = sortBy;
    settings.sortDir = sortDir
   
    
    buildList();
}

// DETERMINES WHAT TO SORT 
function sortList(sortedList) {
    // let sortedList = allAnimals;
    let direction = 1;
    if (settings.sortDir === "desc") {
       direction = 1;
    } else {
        direction = -1;
    }

    sortedList = sortedList.sort(sortByProperty);

    function sortByProperty(A, B) {
        if (A[settings.sortBy] < B[settings.sortBy]) {
            return -1 * direction;
        } else {
            return 1 * direction;
        }
    }

    return sortedList;
}

//----------------------------------------------
// SEARCH
//----------------------------------------------
// ref: https://javascript.plainenglish.io/how-to-build-a-search-bar-7d8a8a3d9d00
      // get search bar element
      const searchInput = document.getElementById("searchInput");

      // store name elements in array-like object
      const namesFromDOM = document.getElementsByClassName("fullname");
      
      // listen for user events
      searchInput.addEventListener("keyup", (event) => {
        //   const { value } = event.target;
          // get user search input converted to lowercase
          const searchQuery = event.target.value.toLowerCase();
          if (document.querySelector("#searchInput").value === "") {
            document.querySelector(".currentCount").textContent = `Currently displaying: ${settings.currentCount} students`;
        }
        // Student count
        //   const currentCountD = document.querySelector(".currentCount");
          let count = 0;
          
          
          for (const nameElement of namesFromDOM) {
              // store name text and convert to lowercase
              let name = nameElement.textContent.toLowerCase();
              
              // compare current name to search input
              if (name.includes(searchQuery)) {
                  // found name matching search, display it
                  nameElement.parentNode.classList.remove("hide");
              } else {
                  // no match, don't display name
                  nameElement.parentNode.classList.add("hide");
                  // Get the number of elements that have the class 
                  if (nameElement.classList.contains("hide")) {
                    count ++ ;
                    document.querySelector(".currentCount").textContent = `Currently displaying: ${settings.currentCount - count} students`;
        }
              }
          }
          
      });

//----------------------------------------------
// BUILDLIST
//----------------------------------------------

function buildList() {
    const currentList = filterList(allStudents);
    const sortedList = sortList(currentList);

    showCount();;
    displayList(sortedList);
    // displayList(currentList);
}

function displayList(student) {
    // clear the list
    document.querySelector("#list tbody").innerHTML = ""
    // build a new list
    student.forEach(displayStudent);
}

function displayStudent(student) {
    // create clone
    const clone = document.querySelector("template#student").content.cloneNode(true);

    //hackthesystem
    if (settings.isHacked) {
      changeBloodStatus();
      cantExpell();
    }

    function cantExpell() {
        if (student.firstName === "Thordur") {
            clone.querySelector(".expell").classList.add("hide");
        }
    }

    function changeBloodStatus() {
     if (student.blood === "muggle") {
        student.blood = "pure"
    } else if(student.blood === "pure"){
        let rndmBlood = Math.floor(Math.random() * 3);
        if (rndmBlood === 1) {
            student.blood = "pure"
        } else if(rndmBlood === 2) {
            student.blood = "half"
        } else if(rndmBlood === 3) {
            student.blood = "muggle"
        }
    }
    }


    // set clone data
    clone.querySelector("[data-field=firstName]").textContent = student.firstName;
    clone.querySelector("[data-field=middleName]").textContent = student.middleName;
    clone.querySelector("[data-field=lastName]").textContent = student.lastName;
    clone.querySelector("[data-field=image] img").setAttribute("src", student.image);
    clone.querySelector("[data-field=house]").textContent = student.house;
    // clone.querySelector("student_details_wrapper").textContent = student.gender;
    // clone.querySelector("[data-field=inquis]").textContent = student.inquis;
    // clone.querySelector("[data-field=prefect]").textContent = student.prefect;
    // clone.querySelector("[data-field=blood]").textContent = student.blood;
    clone.querySelector("[data-field=fullname]").textContent = student.fullname;

      

// POPUP
clone.querySelector(".student_details_wrapper img").setAttribute("src", student.image);

clone.querySelector(".student_details_wrapper .first_name").textContent = `First name: ${student.firstName}`;
clone.querySelector(".student_details_wrapper .middle_name").textContent = isMiddleName();
function isMiddleName() {
    if (student.middleName === " " || student.middleName === "") {
        return ""
    } else {
        return `Middle name: ${student.middleName}`
        // console.log(student.middleName === "")
    }
};

clone.querySelector(".student_details_wrapper .last_name").textContent = isLastName();
function isLastName() {
    if (student.lastName !== "") {
        return `Last name: ${student.lastName}`
    } else {
        return ""
    }
};

clone.querySelector(".student_details_wrapper .nickname").textContent = isNickname();
function isNickname() {
    if (student.nickname !== undefined) {
        return `Nickname: ${student.nickname}`
    } else {
        return ""
    }
};


clone.querySelector(".student_details_wrapper .house").textContent = student.house;
clone.querySelector(".house_image img").setAttribute("src", `images/${student.house.toLowerCase()}.png`)

clone.querySelector(".student_details_wrapper .blood").textContent = `Family: ${student.blood}`;
clone.querySelector(".student_details_wrapper .gender").textContent = `Gender: ${student.gender}`;


// ADD A SYMBOLD FOR INQUIS AND PREFECT
if (student.prefect && student.inquis) {
    clone.querySelector("[data-field=firstName]").textContent = `${student.firstName}🎖️☆`;
} else if (student.prefect) {
    clone.querySelector("[data-field=firstName]").textContent = `${student.firstName}☆`;
} else if (student.inquis) {
    clone.querySelector("[data-field=firstName]").textContent = `${student.firstName}🎖️`;
    if (settings.isHacked) {
        clone.querySelector("[data-field=firstName]").classList.add("wiggle");
    }
}




clone.querySelectorAll("[data-field=details] button").forEach(button => button.addEventListener("click", showPopup));
clone.querySelectorAll(".student_details_actions .closebutton").forEach(button => button.addEventListener("click", addHide));

// clone.querySelector(".closebutton").addEventListener("click", addHide);



// EXPELLING
    clone.querySelector(".expell").addEventListener("click", clickExpell);

    // if (student.expell) {
    //     document.querySelector(".expell").classList.add("hide");
    // }

    function clickExpell() {
        if (student.expell === false) {
            student.expell = true;
            expellStudent(student);
        } 

        buildList();
    }

    function expellStudent(selectedStudent) {
        expelledStudents.push(selectedStudent);
        allStudents = allStudents.filter(student => student.expell===false);
    }

   

// INQUISTORIAL SQUAD

document.querySelector(".closebutton").addEventListener("click", addHide);



    if (student.inquis === true) {
    //    clone.querySelector("[data-field=inquis]").style.backgroundImage = `url("images/inquis.png")`;
        // clone.querySelector("[data-field=inquis] img").setAttribute("src", "images/inquis.png");
        clone.querySelector(".inquis").textContent = "Remove from the Inquisitorial Squad";
    } else {
        clone.querySelector(".inquis").textContent = "Appoint to the Inquisitorial Squad";
    }

    // clone.querySelector("[data-field=inquis]").dataset.inquis = student.inquis;
    clone.querySelector(".inquis").addEventListener("click", clickInquis);
    function clickInquis() {
        if(student.inquis === true) {
            student.inquis = false;
        } else {
            student.inquis = makeInquis(student);
        }

        if (settings.isHacked) {
            setTimeout(removeIfHacked, 5000)
        }
        
        buildList();
    }

    function removeIfHacked() {
        student.inquis = false;
        buildList();
    }

// PREFECT
    if (student.prefect === true) {
        clone.querySelector(".prefect").textContent = "Remove house prefect";
    } else {
        clone.querySelector(".prefect").textContent = "Make house prefect";
    }

    clone.querySelector(".prefect").addEventListener("click", clickPrefect);
    function clickPrefect() {
        if(student.prefect === true) {
            student.prefect = false;
        } else {
            // student.prefect = true;
            // student.prefect = makePrefect(student);
            makePrefect(student);
            // console.log(student);
            // console.log(student.prefect);
        }

        buildList();
    }
   

    // append clone to list
    document.querySelector("#list tbody").appendChild( clone );
} 
///////////////// END OF DISPLAYSTUDENT////////////////

//// POPUP FUNCTION
function showPopup() {
this.nextElementSibling.classList.remove("hide");
}

function makePrefect(selectedStudent) {

    const prefectMembers = allStudents.filter(student => student.prefect);
    // console.log("prefectMembers", prefectMembers);
    const prefectsOfHouse = prefectMembers.filter(student => (student.house === selectedStudent.house));
    // console.log("prefectsOfHouse", prefectsOfHouse);

    if (prefectsOfHouse.length < 2) {
        // console.log(`number of prefects is: ${prefectsOfHouse.length}`);
        selectedStudent.prefect = true;
    } else {
        // console.log("too many prefects")
        removeAorB(prefectsOfHouse[0], prefectsOfHouse[1]);
        selectedStudent.prefect = false;
    }

    function removeAorB(prefectA, prefectB){
        document.querySelector("#remove_aorb").classList.remove("hide");
        document.querySelector("#remove_aorb .closebutton").addEventListener("click", closeDialog);
        document.querySelector("#remove_aorb #removea").addEventListener("click", clickRemoveA);
        document.querySelector("#remove_aorb #removeb").addEventListener("click", clickRemoveB);
    
        document.querySelector("#remove_aorb [data-field=prefectHouse]").textContent = prefectA.house;
        document.querySelector("#remove_aorb [data-field=winnera]").textContent = prefectA.firstName;
        document.querySelector("#remove_aorb [data-field=winnerb]").textContent = prefectB.firstName;
    
        function closeDialog() {
            document.querySelector("#remove_aorb").classList.add("hide");
            document.querySelector("#remove_aorb .closebutton").removeEventListener("click", closeDialog);
            document.querySelector("#remove_aorb #removea").removeEventListener("click", clickRemoveA);
            document.querySelector("#remove_aorb #removeb").removeEventListener("click", clickRemoveB);
        }
        
        // if ignore - do nothing
        // if remove A:
        function clickRemoveA() {
            removeWinner(prefectA);
            makeWinner(selectedStudent);
            buildList();
            closeDialog();
        }
        // if remove B
        function clickRemoveB() {
            removeWinner(prefectB);
            makeWinner(selectedStudent);
            buildList();
            closeDialog();
        }
    
    function removeWinner(prefect) {
        prefect.prefect = false;
    }
    
    function makeWinner(selectedStudent) {
        selectedStudent.prefect = true;
    }
    
    }

}

function makeInquis(selectedStudent) {
    // console.log(selectedStudent);
    // console.log(selectedStudent.blood);

        if (selectedStudent.house === "Slytherin") {
            return true
        } else if (selectedStudent.blood === "pure") {
            return true
        } else {
            document.querySelector("#inquis_warning").classList.remove("hide");
            return false
        };
}

function showCount() {
    //ref https://stackoverflow.com/questions/45547504/counting-occurrences-of-particular-property-value-in-array-of-objects
    const gryffindorStudents = allStudents.filter((obj) => obj.house === "Gryffindor").length;
    document.querySelector(".house_gryffindor").textContent = `Gryffindor students ${gryffindorStudents}`;

    const slytherinStudents = allStudents.filter((obj) => obj.house === "Slytherin").length;
    document.querySelector(".house_slytherin").textContent = `Slytherin students ${slytherinStudents}`;

    const ravenclawStudents = allStudents.filter((obj) => obj.house === "Gryffindor").length;
    document.querySelector(".house_ravenclaw").textContent = `Ravenclaw students ${ravenclawStudents}`;

    const hufflepuffStudents = allStudents.filter((obj) => obj.house === "Hufflepuff").length;
    document.querySelector(".house_hufflepuff").textContent = `Hufflepuff students ${hufflepuffStudents}`;

    document.querySelector(".total").textContent = `Total students ${allStudents.length}`;
    document.querySelector(".expelled").textContent = `Expelled students ${expelledStudents.length}`;
    document.querySelector(".currentCount").textContent = `Currently displaying: ${settings.currentCount}`;
}

function addHide() {
    this.parentElement.parentElement.classList.add("hide");
    document.querySelector(".modal").classList.add("hide");
};

function hackTheSystem() {

    settings.isHacked = true;
    // My name injected and cannot be expelled ////// DONE ///////
    const newStudent = {
        firstName: "Thordur",
        middleName: "Frimann",
        lastName: "Thorhallsson",
        nickname: "Thor",
        gender: "male",
        image: "",
        house: "Ravenclaw",
        inquis: false,
        prefect: false,
        expell: false,
        blood: "muggle",
        fullname: "thordur frimann thorhallsson"
    }
    allStudents.push(newStudent);

    buildList();
    
    // pure bloods will get a random blood status, everyone else is pure blood ////DONE////

    // adding a student to inquis only works for a certain time
}