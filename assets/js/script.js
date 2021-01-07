var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// task text was clicked
$(".list-group").on("click", "p", function() {
  // get current text of p element
  var text = $(this)
    .text()
    .trim();

  // replace p element with a new textarea
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput);

  // auto focus new element
  textInput.trigger("focus");
});

// editable field was un-focused
$(".list-group").on("blur", "textarea", function() {
  // get current value of textarea
  var text = $(this).val();

  // get status type and position in the list
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace textarea with new content
  $(this).replaceWith(taskP);
});

// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  $(this).replaceWith(dateInput);

  // automatically bring up the calendar
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
  var date = $(this).val();

  // get status type and position in the list
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span and insert in place of input element
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  $(this).replaceWith(taskSpan);
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();

// turn columns into sortables. Sortable widget allows elements to be dragged withing the same column to reorder them and allows elements to be dragged across columns.

//jQuery UI method, sortable(), turns every element with the class list-group until a sortable list. connectWith property then linked the sortable lists with any other list that have the same class:

$(".card .list-group").sortable({connectWith: $(".card .list-group"),
scroll: false,
tolerance: "pointer",
//tell jQuery to create copy of dragged element and move copy instead of original - prevents click events from accidentally triggering on the original element  
helper: "clone",
activate: function(event) {
  //activate & deactivate events  trigger once for all connected lists as soon as dragging starts and stops
  console.log("activate", this); 
},
deactivate: function(event) {
  console.log("deactivate", this);
}, 
//over & out events trigger when a dragged item enters/leaves connected list
over: function(event) {
  console.log("over", event.target);
},
out: function(event) {
  console.log("out", event.target);
},

//update triggers when the contents of list have changed (e.g., items re-ordered, removed/added)
update: function(event) {
//array to store task data in
  var tempArr = [];

  //children() method returns array of the list element's children (li elements) and indexes in teh task arrays should match one-to one. this means we need to loop over the elements, pushing their text values into a new task array

  //each() method will run callback function for every item/element in the array. it's another form of looping except that the function is now called on each loop iteration. $this actually refers to teh child element at that index.

  //loop over current set of children in sortable list
  $(this).children().each(function() {

    var text = $(this)
    .find("p")
    .text()
    .trim()

    var date = $(this)
    .find("span")
    .text()
    .trim();

    //keep tasks in their columns after refresh... 
    //add task data to the temp array as an object:
    tempArr.push({
      text: text,
      date: date
    });
  });

  //trim down list's ID to match object property
  var arrName = $(this)
  .attr("id")
  .replace("list-", "");

//update array on tasks object and save
tasks[arrName] = tempArr;
saveTasks();
    
  console.log(tempArr);
}
});

$("#trash").droppable({
  accept: ".card .list-group-item",       
  tolerance: "touch", 
  drop: function(event, ui) {
    console.log("drop");
    //dragging item to drop zone will remove it from DOM
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out")
  }
});




