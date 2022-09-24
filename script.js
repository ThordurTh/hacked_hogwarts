"use strict";

console.log("Hello Hogwarts");

window.addEventListener("DOMContentLoaded", start);

const url = "https://petlatkea.dk/2021/hogwarts/students.json";
const bloodurl = "https://petlatkea.dk/2021/hogwarts/families.json";

let allStudents = [];

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
    blood: ""
}

const settings = {
    filterBy: "all",
    sortBy: "firstName",
    sortDir: "asc"
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
    // document.querySelector("").addEventListener("click", search);
}

// LOAD STUDENT JSON
async function loadStudentJSON() {
    const response = await fetch(url);
    const studentData = await response.json();
    // console.table(studentData);
    // when loaded, prepare data objects
    prepareObjects( studentData );
}

// PREPARE STUDENT DATA
function prepareObjects( studentData ) {
    allStudents = studentData.map( preapareObject );

    // console.table(allStudents);
    buildList();
}

// SEPERATE THE STUDENT DATA INTO MORE PROPERTIES
function preapareObject( studentData ) {
    const student = Object.create(Student);
    let fullname = studentData.fullname;
    let house = studentData.house;
    let gender = studentData.gender;
    let nickname = studentData.nickname;

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

    return student;
}

//----------------------------------------------
// FILTERING
//----------------------------------------------
function selectFilter(event){
    // console.log(event)
    const filter = event.target.dataset.filter;
    setFilter(filter);
}

function setFilter(filter) {
    settings.filterBy = filter.replace(filter[0], filter[0].toUpperCase());
    buildList();
}

function filterList(filteredList) {
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
    } else { // this "else" in unneccesary but makes it more clear
        filteredList = allStudents;
    }
    return filteredList;
}

function isGryff(allStudents) {
    // console.log(allStudents.house);
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
// BUILDLIST
//----------------------------------------------

function buildList() {
    const currentList = filterList(allStudents);
    const sortedList = sortList(currentList);

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

    // set clone data
    clone.querySelector("[data-field=firstName]").textContent = student.firstName;
    clone.querySelector("[data-field=middleName]").textContent = student.middleName;
    clone.querySelector("[data-field=lastName]").textContent = student.lastName;
    clone.querySelector("[data-field=nickname]").textContent = student.nickname;
    clone.querySelector("[data-field=image] img").setAttribute("src", student.image);
    clone.querySelector("[data-field=house]").textContent = student.house;
    clone.querySelector("[data-field=gender]").textContent = student.gender;
    clone.querySelector("[data-field=inquis]").textContent = student.inquis;
    clone.querySelector("[data-field=prefect]").textContent = student.prefect;
    clone.querySelector("[data-field=expell]").textContent = student.expell;
    clone.querySelector("[data-field=blood]").textContent = student.blood;
  
    // append clone to list
    document.querySelector("#list tbody").appendChild( clone );
}