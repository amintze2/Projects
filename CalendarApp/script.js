class Event {
    constructor(startTime = null, endTime = null, eventTitle = "", eventLocation = "", eventNotes = "") {
        this._startTime = startTime;
        this._endTime = endTime;
        this._eventTitle = eventTitle;
        this._eventLocation = eventLocation;
        this._eventNotes = eventNotes;
    }
    get startTime() {
        return this._startTime;
    }
    get endTime() {
        return this._endTime;
    }
    get eventTitle() {
        return this._eventTitle;
    }
    get eventLocation() {
        return this._eventLocation;
    }
    get eventNotes() {
        return this._eventNotes;
    }
    set startTime(value) {
        this._startTime = value;
    }
    set endTime(value) {
        this._endTime = value;
    }
    set eventTitle(value) {
        this._eventTitle = value;
    }
    set eventLocation(value) {
        this._eventLocation = value;
    }
    set eventNotes(value) {
        this._eventNotes = value;
    }
    timeCompare(otherEvent) {
        return this.startTime > otherEvent.startTime ? 1 : -1;
    }
    toString() {
        return `startTime: ${this._startTime}, endTime: ${this._endTime}, eventTitle: ${this._eventTitle}, eventLocation: ${this._eventLocation}, eventNotes: ${this._eventNotes}`;
    }
}

let nav = 0; 
let navWeek = 0;
let clicked = null;
let viewToggle = 0;
let StartToggle = -1;
let EndToggle = -1;
let masterMap =new Map();
masterMap = getAllEventsFromLocalStorage(masterMap);

const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const backDrop  = document.getElementById('modalBackDrop'); 
const eventTitleInput = document.getElementById('eventTitleInput');
const eventStartTimeInput = document.getElementById('eventStartTimeInput');
const eventEndTimeInput = document.getElementById('eventEndTimeInput');
const eventLocationInput = document.getElementById('eventLocationInput');
const eventNotesInput = document.getElementById('eventNotesInput');
const dailyEventsView = document.getElementById('dailyEventsView');
const eventsList = document.getElementById('eventsList');


const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday','Friday', 'Saturday'];
const emojisByMonth = ['0x1F328', '0x1F498', '0x1F340', '0x2614', '0x1F338', '0x1F31E', '0x1F366', '0x1F3EB', '0x1F34E', '0x1F383', '0x1F342', '0x1F384']


function parseEvents(jsonArrayString) {
    const jsonArray = JSON.parse(jsonArrayString);
    return jsonArray.map(eventObj => new Event(
        eventObj._startTime,
        eventObj._endTime,
        eventObj._eventTitle,
        eventObj._eventLocation,
        eventObj._eventNotes
    ));
}

function getAllEventsFromLocalStorage(eventMap) {
    for (let i = 0; i < localStorage.length; i++) {
        const dateKeyString = localStorage.key(i);
        const eventArr = localStorage.getItem(dateKeyString);
        const eventArray = parseEvents(eventArr);
        eventMap.set(new Date(dateKeyString).toDateString(), eventArray);
    }
    return eventMap;
}

function addToMap(map, date, event) {
    const tempDate = new Date(date).toDateString();
    const events = map.get(tempDate) || [];
    events.push(event);
    map.set(tempDate, events.sort((a, b) => a.timeCompare(b)));
}

function addToStorage(map) {
    map.forEach((value, key) => {
        localStorage.setItem(key, JSON.stringify(value));
    });
}


function getHourAndMinute(dateString) {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours < 12 ? 'AM' : 'PM';
    if (hours === 0) {
        hours = 12;
    } else if (hours > 12) {
        hours -= 12; 
    }
    const timeString = `${hours}:${minutes} ${ampm}`;
    return timeString;
}

function sunday(date){
    let sun = date.getDate() - date.getDay();
    let sunMonth = date.getMonth();
    let sunYear = date.getFullYear();
    if (sun < 1) {
        if (sunMonth === 0) {
            sunYear -= 1;
            sunMonth = 11;
        } else {
            sunMonth -= 1;
        }
        const daysInMonth = new Date(sunYear, sunMonth + 1, 0).getDate();
        sun += daysInMonth;
    }
    const sunday = new Date(sunYear, sunMonth, sun);
}

function loadWeekonSunday(){
    const date = new Date();
    let sun = date.getDate() - date.getDay();
    let sunMonth = date.getMonth();
    let sunYear = date.getFullYear();
    if (sun < 1) {
        if (sunMonth === 0) {
            sunYear -= 1;
            sunMonth = 11;
        } else {
            sunMonth -= 1;
        }
        const daysInMonth = new Date(sunYear, sunMonth + 1, 0).getDate();
        sun += daysInMonth;
    }
    const sunday = new Date(sunYear, sunMonth, sun);
    loadWeek(sunday);
}

function loadMonth(){
    let dt = new Date();
    const permDate = dt.getDate();
    if (nav !== 0) {
        dt.setDate(1);
        dt.setMonth(new Date().getMonth() + nav);
    }

    const day = dt.getDate();
    const month = dt.getMonth();
    const year = dt.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month+ 1, 0).getDate();
    const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: "numeric",
    });
    const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

    document.getElementById('monthDisplay').innerText = 
    `${dt.toLocaleDateString('en-us', { month: 'long' })}`;
    document.getElementById('emoji').innerText = `${String.fromCodePoint(emojisByMonth[month])}`
    document.getElementById('yearDisplay').innerText = `${year}`;

    calendar.innerHTML = '';
    
    for( let i = 1; i <= paddingDays + daysInMonth; i++){
        const daySquare = document.createElement('div');
        daySquare.classList.add('day');
        const dayDate = new Date(year, month, i - paddingDays);
        const dayString = `${month + 1}/${i - paddingDays}/${year}`;
        if (i > paddingDays){
            daySquare.innerText = i - paddingDays;
            let dailyEventsArray = masterMap.get(dayDate.toDateString())
            if(i - paddingDays === permDate && nav === 0){
                daySquare.id = "currentDay";
            }
           
            if(dailyEventsArray){
    
                for (let i = 0; i < dailyEventsArray.length; i++){
                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add('event');
                    let startTimeString = getHourAndMinute(dailyEventsArray[i]._startTime);
                    eventDiv.innerText = `${dailyEventsArray[i]._eventTitle} ${ startTimeString}`;
                    daySquare.appendChild(eventDiv);
                }
            }   
            daySquare.addEventListener('click', () => dailyEvents(`${month + 1}/${i - paddingDays}/${year}`));
        }
        else {
            daySquare.classList.add('padding');
          }
      
          calendar.appendChild(daySquare);    
        }
}

function loadWeek(d){
    let dt = new Date(d);
    if (navWeek !== 0) {
        for (let i = 0; i < Math.abs(navWeek); i++) {
            let tempDate = dt.getDate() + (navWeek > 0 ? 7 : -7);
            dt.setDate(tempDate);
        }
    }
    const weekDay = dt.getDate();
    const weekMonth = dt.getMonth();
    const weekYear = dt.getFullYear();
    const currDate = new Date();
    const currDateNum = currDate.getDate();
    let dateNum = 0;
    document.getElementById('monthDisplay').innerText = 
    `${dt.toLocaleDateString('en-us', { month: 'long' })}`;
    document.getElementById('emoji').innerText = `${String.fromCodePoint(emojisByMonth[weekMonth])}`
    document.getElementById('yearDisplay').innerText = `${weekYear}`;
    const daysInMonthSun = new Date(weekYear, weekMonth + 1, 0).getDate();
    calendar.innerHTML = '';
    let lastDayNum = 0;
    for( let i = 0; i <= 6; i++){
        let currentDayString = "";
        const daySquare = document.createElement('div');
        daySquare.classList.add('weekViewDay');
        if(i+weekDay > daysInMonthSun){
            dateNum = i+weekDay - daysInMonthSun;
            if(dateNum > daysInMonthSun && weekMonth == 11){
                currentDayString = `01/${dateNum}/${weekYear + 1}`;
            }else{
                currentDayString = `${weekMonth + 2}/${dateNum}/${weekYear}`;
            }
        }else{
            dateNum = i + weekDay;
            currentDayString = `${weekMonth + 1}/${dateNum}/${weekYear}`;
        }
        lastDayNum = dateNum;
        if(dateNum === currDateNum && navWeek === 0){
            daySquare.id = "currentDay";
        }
        daySquare.innerText= dateNum;
        const dayDate = new Date(currentDayString);
        let dailyEventsArray = masterMap.get(dayDate.toDateString());
        if(dailyEventsArray){
            for (let i = 0; i < dailyEventsArray.length; i++){
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event', 'weekView');
                let startTimeString = getHourAndMinute(dailyEventsArray[i]._startTime)
                eventDiv.innerText = `${dailyEventsArray[i]._eventTitle} ${ startTimeString}`;
                daySquare.appendChild(eventDiv);
            }
        }
        daySquare.addEventListener('click', () => dailyEvents(currentDayString));
        calendar.appendChild(daySquare);
    }
    if(lastDayNum < 7 && dt.getMonth() === 11 ){
        dt.setMonth(dt.getMonth() + 1);
        document.getElementById('monthDisplay').innerText = 
        `${dt.toLocaleDateString('en-us', { month: 'long' })}`;
        document.getElementById('yearDisplay').innerText = `${weekYear + 1}`;
    }
    else if (lastDayNum < 7){
        dt.setMonth(dt.getMonth() + 1);
        document.getElementById('monthDisplay').innerText = 
        `${dt.toLocaleDateString('en-us', { month: 'long' })}`;
        document.getElementById('yearDisplay').innerText = `${weekYear}`;
    }
    else{
        document.getElementById('monthDisplay').innerText = 
        `${dt.toLocaleDateString('en-us', { month: 'long' })}`;
        document.getElementById('yearDisplay').innerText = `${weekYear}`;
    }
}

function toggleAMPM(activeButton, inactiveButton){
    if(!(activeButton.classList.contains('darker'))){
        
        activeButton.classList.add('darker');
    }
    if(inactiveButton.classList.contains('darker')){
        inactiveButton.classList.remove('darker');
    }
}
function saveEvent() {
    //INITAL AM PM
    let startDate = new Date();
    let endDate = new Date();
    const clickedString = clicked;
    const clickedDate = new Date(clickedString);
    let isValid = true;
    eventTitleInput.classList.remove('error');
    eventStartTimeInput.classList.remove('error');
    eventEndTimeInput.classList.remove('error');
    const inputsToValidate = [eventTitleInput, eventStartTimeInput, eventEndTimeInput];
    inputsToValidate.forEach(input => {
        if (!input.value) {
            input.classList.add('error');
            isValid = false;
        }
    });
    let formateCheckerS = true;
    if (isValid) {
        const dateParts = clickedString.split('/');
        const clickedM = Number(dateParts[0]);  
        const clickedD = Number(dateParts[1]);
        const clickedY = Number(dateParts[2]);

        const startStr = eventStartTimeInput.value;
        if (startStr.includes(":")) {
            let [sHour, sMinute] = startStr.split(":").map(Number);
            if (isNaN(sHour) || isNaN(sMinute)) {
                formateCheckerS = false;
            } else {
                if(sHour < 1 || sHour > 12 || sMinute < 0 || sMinute > 60){
                    formateCheckerS = false;
                }else{
                    let adder = 0;
                    if(StartToggle === 1){
                        adder = 12
                    }
                    startDate = new Date(clickedY, clickedM, clickedD, sHour + adder, sMinute);
                }
               
            }
        } else {
            formateCheckerS = false;
        }
        if (!formateCheckerS) {
            eventStartTimeInput.classList.add('error');
            isValid = false;
        }

        let formateCheckerE = true;
        const endStr = eventEndTimeInput.value;
        if (endStr.includes(":")) {
            let [eHour, eMinute] = endStr.split(":").map(Number);
            if (isNaN(eHour) || isNaN(eMinute)) {
                formateCheckerE = false;
            } else {
                if(eHour < 1 || eHour > 12 || eMinute < 0 || eMinute > 60){
                    formateCheckerE = false;
                }
                else{
                    let adder = 0;
                    if(EndToggle === 1){
                        adder = 12
                    }
                    endDate = new Date(clickedY, clickedM, clickedD, eHour+ adder, eMinute);
                }
            }
        } else {
            formateCheckerE = false;
        }
        if (!formateCheckerE) {
            eventEndTimeInput.classList.add('error');
            isValid = false;
        }
    }
    if (isValid) {
        const eventLocation = eventLocationInput.value || '';
        const eventNotes = eventNotesInput.value || '';
        const e = new Event(startDate, endDate, eventTitleInput.value, eventLocation, eventNotes);
        addToMap(masterMap, clickedDate, e);
        addToStorage(masterMap);
        closeModal();
    }
}



function dailyEvents(date){
    document.getElementById('deleteSingleEvent').style.visibility = 'hidden';
    document.getElementById('cancelDeleteSingleEvent').style.visibility = 'hidden';
    clicked = date;
    let tempDate = new Date(clicked)
    let dailyEventsArray = masterMap.get(tempDate.toDateString());
    while (eventsList.firstChild) {
        eventsList.removeChild(eventsList.firstChild);
    }
    if(dailyEventsArray){
        
        for (let i = 0; i < dailyEventsArray.length; i++){
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('largerEvent');
            
            let startTimeString = getHourAndMinute(dailyEventsArray[i]._startTime);
            let endTimeString = getHourAndMinute(dailyEventsArray[i]._endTime);
            let locationString = (dailyEventsArray[i]._eventLocation);
            let notesString = (dailyEventsArray[i]._eventNotes);
            let totalString = `${dailyEventsArray[i]._eventTitle} 
                    ${ startTimeString} - ${endTimeString}`;
            if (locationString !== ""){
                totalString = totalString + `
                Location: ${locationString}`;
            }
            if (notesString !== ""){
                totalString = totalString + `
                Notes: ${notesString}`;
            }
            eventDiv.innerText =  totalString;
            eventsList.appendChild(eventDiv);
            eventDiv.addEventListener('click', () => {
                
                document.getElementById('deleteSingleEvent').style.visibility = 'visible';
                document.getElementById('cancelDeleteSingleEvent').style.visibility = 'visible';
                eventDiv.classList.add('delete');

                document.getElementById('deleteSingleEvent').addEventListener('click', () => {
                    eventDiv.classList.remove('delete');
                    document.getElementById('deleteSingleEvent').style.visibility = 'hidden';
                    document.getElementById('cancelDeleteSingleEvent').style.visibility = 'hidden';
                    deleteEvent(dailyEventsArray[i]);
                    dailyEvents(date);
                    });
                document.getElementById('cancelDeleteSingleEvent').addEventListener('click',() => {
                    eventDiv.classList.remove('delete');
                    document.getElementById('deleteSingleEvent').style.visibility = 'hidden';
                    document.getElementById('cancelDeleteSingleEvent').style.visibility = 'hidden';
                    });
                });
            
        }
    }
    dailyEventsView.style.display = 'block';
    backDrop.style.display = 'block';
}

function closeModal(){
    if (eventTitleInput.classList.contains('error')) {
        eventTitleInput.classList.remove('error');
    }
    if (eventStartTimeInput.classList.contains('error')) {
        eventStartTimeInput.classList.remove('error');
    }
    if (eventEndTimeInput.classList.contains('error')) {
        eventEndTimeInput.classList.remove('error');
    }
    document.getElementById('deleteSingleEvent').style.visibility = 'hidden';
    document.getElementById('cancelDeleteSingleEvent').style.visibility = 'hidden';
    eventTitleInput.classList.remove('error');
    newEventModal.style.display = 'none';
    backDrop.style.display = 'none';
    eventTitleInput.value = '';
    eventStartTimeInput.value = '';
    eventEndTimeInput.value = '';
    eventLocationInput.value = '';
    eventNotesInput.value = '';
    clicked = null;
    if(viewToggle){
        loadWeekonSunday();
    }else{
        loadMonth();
    }

}

function clearDailyEventsView() {
    while (dailyEventsView.firstChild) {
        dailyEventsView.removeChild(dailyEventsView.firstChild);
    }
}

function closeDailyViewTwo(){
    dailyEventsView.style.display = 'none';
    backDrop.style.display = 'none';
    clicked = null;
    if(viewToggle){
        loadWeekonSunday();
    }else{
        loadMonth();
    }

}

function closeDailyViewOne(){
    dailyEventsView.style.display = 'none';
    backDrop.style.display = 'none';
    if(viewToggle){
        loadWeekonSunday();
    }else{
        loadMonth();
    }
}

function deleteEvent(e){

    const longEventDate = new Date(e.startTime);
    const eventDate = new Date(longEventDate.getFullYear(), longEventDate.getMonth() - 1, longEventDate.getDate());
    masterMap.forEach (function(value, key) {
        if (key == (eventDate.toDateString())){
            const filtered = value.filter(item => item !== e);
            if (filtered.length !== value.length) {
                masterMap.set(eventDate.toDateString(), filtered);
            }
        }
      })
    addToStorage(masterMap);
    closeModal();
}

function openModal(){
    document.getElementById('deleteSingleEvent').style.visibility = 'hidden';
    document.getElementById('cancelDeleteSingleEvent').style.visibility = 'hidden';
    newEventModal.style.display = 'block';
    backDrop.style.display = 'block';
}
function openDailyModal(){
    dailyEventsView.style.display = 'block';
    backDrop.style.display = 'block';
}


function initButtons(){
    const StartAM = document.getElementById('StartAM');
    const StartPM = document.getElementById('StartPM');
    const EndAM = document.getElementById('EndAM');
    const EndPM = document.getElementById('EndPM');

    StartAM.addEventListener('click', () => {
        toggleAMPM(StartAM, StartPM);
        StartToggle = 0;
    });

    StartPM.addEventListener('click', () => {
        toggleAMPM(StartPM, StartAM);
        StartToggle = 1;
    });

    EndAM.addEventListener('click', () => {
        toggleAMPM(EndAM, EndPM);
        EndToggle = 0;
    });

    EndPM.addEventListener('click', () => {
        toggleAMPM(EndPM, EndAM);
        EndToggle = 1;
    });
    document.getElementById('nextButton').addEventListener('click', () => {
        if(viewToggle){
            navWeek++;
            loadWeekonSunday();
        }else{
            nav++;
            loadMonth();
        }
    });
    
    document.getElementById('backButton').addEventListener('click', () => {     
        if(viewToggle){
            navWeek--;
            loadWeekonSunday();
        }else{
            nav--;
            loadMonth();
        }
    });
    document.getElementById('todayButton').addEventListener('click', () => {
        if(viewToggle){
            navWeek = 0
            loadWeekonSunday();
        }else{
            nav = 0;
            loadMonth();
        }
    });
    document.getElementById('weekButton').addEventListener('click', () => {
        viewToggle = 1;
        loadWeekonSunday();
    });
    document.getElementById('monthButton').addEventListener('click', () => {
        viewToggle = 0;
        loadMonth();
    });
    document.getElementById('addEventButton').addEventListener('click', () => {
        closeDailyViewOne();
        openModal(clicked);
    });
    document.getElementById('dailyViewCancelButton').addEventListener('click', closeDailyViewTwo);
    document.getElementById('saveButton').addEventListener('click', saveEvent);
    document.getElementById('cancelButton').addEventListener('click', closeModal);
}


initButtons();
loadMonth();

