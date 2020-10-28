// querySelector returns the first element that matches a specified CSS selector in the document.
const listsContainer = document.querySelector('[data-lists]')
const newListForm = document.querySelector('[data-new-list-form]')
const newListInput = document.querySelector('[data-new-list-input]')
const deleteListButton = document.querySelector('[data-delete-list-button]')
const listDisplayContainer = document.querySelector('[data-list-display-container]')
const listTitleElement = document.querySelector('[data-list-title]')
const listCountElement = document.querySelector('[data-list-count]')
const tasksContainer = document.querySelector('[data-tasks]')
const taskTemplate = document.getElementById('task-template')
const newTaskForm = document.querySelector('[data-new-task-form]')
const newTaskInput = document.querySelector('[data-new-task-input]')
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]')

// keys for local storage
const LOCAL_STORAGE_LIST_KEY = 'task.lists'
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId'

// to access local storage
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || []

// id to access the list present in the storage which is selected 
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY)

/* Date time variables initialized here

var DayName = document.getElementById("dayname");
var Month = document.getElementById("month");
var DayNum = document.getElementById("daynum");
var Year = document.getElementById("year");
var Hour = document.getElementById("hour");
var Minutes = document.getElementById("minutes");
var Seconds = document.getElementById("seconds");
var Period = document.getElementById("period");

 Date time variables end */

// Event listener to identify which list has been selected and to further display the tasks in that selected list
listsContainer.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'li') {
    selectedListId = e.target.dataset.listId
    saveAndRender()
  }
})

tasksContainer.addEventListener('click', e => {
  if (e.target.tagName.toLowerCase() === 'input') {
    const selectedList = lists.find(list => list.id === selectedListId)
    const selectedTask = selectedList.tasks.find(task => task.id === e.target.id)
    selectedTask.complete = e.target.checked
    save()
    renderTaskCount(selectedList)
  }
})

clearCompleteTasksButton.addEventListener('click', e => {
  const selectedList = lists.find(list => list.id === selectedListId)
  selectedList.tasks = selectedList.tasks.filter(task => !task.complete)
  saveAndRender()
})

deleteListButton.addEventListener('click', e => {
  lists = lists.filter(list => list.id !== selectedListId)
  selectedListId = null
  saveAndRender()
})

newListForm.addEventListener('submit', e => {
  e.preventDefault() // prevents page from reloading when enter is pressed to add listname 
  const listName = newListInput.value
  if (listName == null || listName === '') return // if the user enters nothing, pressing enter will do nothing
  const list = createList(listName)
  newListInput.value = null // Removes the entered listname from the textbox
  lists.push(list) // pushing into the entered listname into the list
  saveAndRender() // saving the listname entered and rendering to show it up on the screen
})

newTaskForm.addEventListener('submit', e => {
  e.preventDefault()
  const taskName = newTaskInput.value
  if (taskName == null || taskName === '') return
  const task = createTask(taskName)
  newTaskInput.value = null
  const selectedList = lists.find(list => list.id === selectedListId)
  selectedList.tasks.push(task)
  saveAndRender()
})


/* Date time functions starting from here */
function updateClock(){
  var now = new Date();
  var dname = now.getDay(), 
  mo = now.getMonth(),
  dnum = now.getDate(),
  yr = now.getFullYear(),
  hou = now.getHours(),
  min = now.getMinutes(),
  sec = now.getSeconds(),
  pe = "AM";

  hou = checkTime(hou);
  min = checkTime(min);
  sec = checkTime(sec);

  if(hou == 0){
    hou = 12;
  }

  if(hou > 12){
    hou = hou - 12;
    pe = "PM";
  }

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var ids = ["dayname", "month", "daynum", "year", "hour", "minutes", "seconds", "period"];
  var values = [week[dname], months[mo], dnum, yr, hou, min, sec, pe];

  for(var i=0; i<ids.length; i++)
    document.getElementById(ids[i]).firstChild.nodeValue = values[i];
}

function initClock(){
  updateClock();
  window.setInterval("updateClock()", 1);
}

function checkTime(i) {
  if (i < 10)
  {
    i = "0" + i
  };  // add zero in front of numbers < 10
  return i;
}

/* object.onload = function(){initClock}; */
/* window.onload = function initClock();  */

/* Date time functions end here */

function createList(name) {
  // Using date to give a unique identifier to the lists
  return { id: Date.now().toString(), name: name, tasks: [] }
}

function createTask(name) {
  return { id: Date.now().toString(), name: name, complete: false }
}

// A function which simply calls two other functions important for saving and rendering
function saveAndRender() {
  save()
  render()
}

// this function saves the lists created in local storage
function save() {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists))
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId)
}

// This function removes already existing firstChilds and populates with the listnames stored.
function render() {
  clearElement(listsContainer)
  renderLists()

  const selectedList = lists.find(list => list.id === selectedListId)
  if (selectedListId == null) {
    listDisplayContainer.style.display = 'none'
  } else {
    listDisplayContainer.style.display = ''
    listTitleElement.innerText = selectedList.name
    renderTaskCount(selectedList)
    clearElement(tasksContainer)
    renderTasks(selectedList)
  }
}

function renderTasks(selectedList) {
  selectedList.tasks.forEach(task => {
    const taskElement = document.importNode(taskTemplate.content, true)
    const checkbox = taskElement.querySelector('input')
    checkbox.id = task.id
    checkbox.checked = task.complete
    const label = taskElement.querySelector('label')
    label.htmlFor = task.id
    label.append(task.name)
    tasksContainer.appendChild(taskElement)
  })
}

function renderTaskCount(selectedList) {
  const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length
  const taskString = incompleteTaskCount === 1 ? "task" : "tasks"
  listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`
}

function renderLists() {
  lists.forEach(list => {
    const listElement = document.createElement('li')
    listElement.dataset.listId = list.id
    listElement.classList.add("list-name")
    listElement.innerText = list.name
    if (list.id === selectedListId) {
      listElement.classList.add('active-list')
    }
    listsContainer.appendChild(listElement)
  })
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}

render()