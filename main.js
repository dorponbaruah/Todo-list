const body = document.querySelector("body");
const pageHeader = body.querySelector(".page-header");
const sidebar = body.querySelector(".sidebar");
const taskOptionMenu = body.querySelector(".task-option-menu");
const fullscrContainer = body.querySelector(".fullscr-container");
const fullscrContainerBody = fullscrContainer.querySelector(".fullscr-container-body");
const newtaskTextarea = fullscrContainer.querySelector(".newtask textarea");

// buttons
const sidebarButton = pageHeader.querySelector(".sidebar-button");
const backButton = fullscrContainer.querySelector("button.back");
const newTaskButton = body.querySelector(".add-new");
const taskOptionButton = body.querySelector(".todo-segment .options");

/**
 * Renders the "fullscrContainer" element.
 * 
 * @param {"completed" | "trash" | "theme" | "newtask" | "edittask"} elementClassName - Class name of the element that will be rendered as the body of "fullscrContainer".
 * @param {String} header - Header of the container.
 * @returns void
 */
const renderFullscrContainer = (elementClassName, header) => {
  sidebar.classList.remove("visible");
  taskOptionMenu.classList.remove("visible");
  fullscrContainer.classList.remove("visible");
  body.classList.remove("unscrollable");
  
  fullscrContainer.classList.add("visible");
  fullscrContainer.querySelector(".container-header h1").innerText = header;
  fullscrContainerBody.querySelector(`.${elementClassName}`).classList.add("active");
};

/**
 * @callback classNameListenerCallback
 * @param {HTMLElement} element
 * @returns any
 */

/**
 * Triggers a callback on an element's class attribute change.
 * 
 * @param {HTMLElement} element - The element to which this function will listen to.
 * @param {classNameListenerCallback} - The callback.
 * @returns void
 */
const classNameListener = (element, callback) => {
  let lastClassName = element?.className;
  window.setInterval(() => {
    const className = element?.className;
    if (className !== lastClassName) {
      callback(element);
      lastClassName = className;
    }
  }, 30);
}

/**
 * Creates a "todo-segment" element.
 * 
 * @param {String} text - The task.
 * @param {String} id - Task ID.
 * @param {HTMLElement} element - The element where this "todo-segment" element will be appended.
 * @returns void
 */

const createTodoSegment = (text, id, element) => {
  const todoSegment = document.createElement("div");
  const task = document.createElement("span");
  const button = document.createElement("button");
  const span = [document.createElement("span"), document.createElement("span")];
  
  todoSegment.className = "todo-segment";
  task.className = "task";
  button.className = "options";
  
  task.innerText = text;
  todoSegment.setAttribute("data-taskId", id)
  
  button.append(span[0], span[1]);
  todoSegment.append(task, button);
  
  setTimeout(() => element.append(todoSegment), 640);
}

/**
 * Gets tasks from localStorage and appends them to an element.
 * 
 * @param {object} localStorage - The localStorage from where task data will be received.
 * @param {HTMLElement} element - The element where these tasks will be appended.
 * @returns void
 */
const appendTasks = (localStorage, element) => {
  element.innerHTML = "";
  
  if (typeof localStorage === "object" && localStorage?.length) {
    localStorage.forEach(task => {
      createTodoSegment(task.text, task.id, element);
    });
  } else {
    const emptyContainer = createEmptyContainer(element.classList[0].charAt(0).toUpperCase() + element.classList[0].slice(1));
    element.append(emptyContainer);
  }
}

/**
 * Creates a "p" (paragraph) element that will show a message if a task container is empty.
 * 
 * @param {"Todos" | "Completed" | "Trash"} containerName - Name of the container where this message will be displayed.
 * @returns HTMLParagraphElement
 */
const createEmptyContainer = (containerName) => {
  const emptyContainer = document.createElement("p");
  emptyContainer.className = "empty-container";
  emptyContainer.innerText = `No tasks in ${containerName}.`;
  
  return emptyContainer;
}

window.onload = () => {
  // Gets data (last theme) from localStorage and applies it as the current theme.
  // If there is no data in localStorage - it applies the default (light) theme.
  const theme = localStorage.getItem("theme") || "light";
  
  body.classList.add(theme);
  document.querySelector(`#${theme}`).checked = true;
  
  appendTasks(JSON.parse(localStorage.getItem("todos")), body.querySelector("section.todos"));
};

// Detects scroll direction.

// Sets the header position "absolute" to "fixed" when scrolling upwards,
// so that the user can access sidebar from anywhere.
let oldValue = 0;

window.onscroll = () => {
  newValue = window.pageYOffset;

  const style = pageHeader.style;

  if (oldValue - newValue < 0) {
    setTimeout(() => style.position = "absolute", 1200);
  }
  else if (oldValue - newValue > 0) {
    style.position = "fixed";
  }

  oldValue = newValue;
};

// Handles clickevents
window.addEventListener("click", async (e) => {
  e.preventDefault();
  
  // In the header.
  // Sidebar (symbol): renders sidebar.
  if (e.target.closest("button") === sidebarButton) {
    sidebar.classList.toggle("visible");
    body.classList.toggle("unscrollable");
  }

  // Closes sidebar by clicking away.
  if (!(
      e.target.closest("button") === sidebarButton ||
      e.target.closest("div") === sidebar
    )) {
    sidebar.classList.remove("visible");
    body.classList.remove("unscrollable");
  }
  
  // In the sidebar.
  // Completed: Renders "Completed Tasks" container.
  if (e.target.closest("ul li")?.classList.contains("completed")) {
    await renderFullscrContainer("completed", "Completed Tasks");
    
    appendTasks(JSON.parse(localStorage.getItem("completed")), fullscrContainerBody.querySelector(".completed"));
  }
  
  // In the sidebar.
  // Trash: Renders "Trash" container.
  if (e.target.closest("ul li")?.classList.contains("trash")) {
    await renderFullscrContainer("trash", "Trash");
    
    appendTasks(JSON.parse(localStorage.getItem("trash")), fullscrContainerBody.querySelector(".trash"));
  }
  
  // In the sidebar.
  // Theme: Renders "Theme Selector" container.
  if (e.target.closest("ul li")?.classList.contains("theme")) {
    renderFullscrContainer("theme", "Theme Selector");
  }
  
  // In "Theme Selector" container body.
  // Light: changes the theme to light.
  // Dark: changes the theme to dark.
  if (e.target.closest("div")?.classList.contains("theme-selector")) {
    let radioInput;
    
    switch (e.target.nodeName) {
      case "INPUT":
        radioInput = e.target;
        break;
    
      case "LABEL":
        radioInput = e.target.previousElementSibling;
        break;
    
      default:
        radioInput = e.target.querySelector("input");
    }
    
    if (
      typeof radioInput === "null" ||
      body.className === radioInput.id
    )
      return;
    
    radioInput.checked = true;
    
    setTimeout(() => {
      body.classList.remove("dark", "light");
      body.classList.add(radioInput.id);
     
      localStorage.setItem("theme", radioInput.id);
    }, 700);
  }
  
  // In the bottom right corner of the page.
  // New Task: renders "New Task" container.
  if (e.target.closest("button") === newTaskButton) {
    newtaskTextarea.value = "";
    
    await renderFullscrContainer("newtask", "New Task");
    
    setTimeout(() => newtaskTextarea.focus(), 400);
  }
  
  // In the fullscreen container header.
  // Back (symbol): returns to main page.
  if (e.target.closest("button") === backButton) {
    fullscrContainer.querySelectorAll(".fullscr-container-body > div")
    .forEach(div => {
      div.classList.remove("active");
    });
    
    fullscrContainer.classList.remove("visible");
    
    appendTasks(JSON.parse(localStorage.getItem("todos")), body.querySelector("section.todos"));
  }
  
  // In the task segments.
  // Options (symbol): renders task option menu.
  if (e.target.closest("button")?.classList.contains("options")) {
    taskOptionMenu.querySelectorAll(".option")
    .forEach(option => {
      option.classList.remove("hide");
      
      option.removeAttribute("data-taskId");
      option.setAttribute("data-taskId", e.target.closest(".todo-segment").getAttribute("data-taskId"));
    });
    
    const hideOptions = ([...classNames]) => {
      classNames.forEach(className => {
        taskOptionMenu.querySelector(`.option.${className}`).classList.add("hide");
      });
    }
    
    const grandParent = e.target.closest("button").parentNode.parentNode.classList[0];
    
    switch (grandParent) {
      case "todos":
        hideOptions(["incomplete", "recover", "delete", "to-trash"]);
        break;
      
      case "completed":
        hideOptions(["edit", "complete", "recover", "delete"]);
        break;
      
      case "trash":
        hideOptions(["edit", "complete", "incomplete", "to-trash"]);
    }
    
    taskOptionMenu.classList.toggle("visible");
    body.classList.toggle("unscrollable");
  }
  
  // In the task option menu.
  // Close: closes task option menu.
  if (e.target.classList.contains("task-option-menu-close")) {
    taskOptionMenu.classList.remove("visible");
    body.classList.remove("unscrollable");
  }
  
  // Closes sidebar by clicking away.
  if (!(
      e.target.closest("button")?.classList.contains("options") ||
      e.target.closest(".task-option-menu") === taskOptionMenu
  )) {
    taskOptionMenu.classList.remove("visible");
    body.classList.remove("unscrollable");
  }
  
  // Options in the task option menu.
  if (
    e.target.classList.contains("option") &&
    e.target.parentNode.parentNode.parentNode.classList.contains("task-option-menu")
  ) {
    const option = e.target;
  
    const moveTasks = (target, source, callback) => {
      let targetStorage = JSON.parse(localStorage.getItem(target) || "[]");
      let sourceStorage = JSON.parse(localStorage.getItem(source) || "[]");
      
      const targetTask = sourceStorage.find(task => task.id === option.getAttribute("data-taskId"));
    
      targetStorage.push(targetTask);
      localStorage.setItem(target, JSON.stringify(targetStorage));
    
      sourceStorage = sourceStorage.filter(task => task.id !== targetTask.id);
      localStorage.setItem(source, JSON.stringify(sourceStorage));
      
      callback(targetTask);
      
      const parentContainer = (
        source === "todos" ?
        body.querySelector("section.todos") :
        fullscrContainerBody.querySelector(`.${source}`)
      );
      
      if (parentContainer.querySelectorAll(".todo-segment").length > 1) return;
     
      const emptyContainer = createEmptyContainer(parentContainer.classList[0].charAt(0).toUpperCase() + parentContainer.classList[0].slice(1));
      setTimeout(() => parentContainer.append(emptyContainer), 720);
    }
    
    switch (option.classList[1]) {
      case "edit":
        renderFullscrContainer("edittask", "Edit Task");
        break;
      
      case "complete":
        moveTasks("completed", "todos", (targetTask) => {
          const todoSegment = body.querySelector(`.todo-segment[data-taskId="${targetTask.id}"]`);
          setTimeout(() => todoSegment.parentNode.removeChild(todoSegment), 650);
        });
        break;
      
      case "incomplete":
        moveTasks("todos", "completed", (targetTask) => {
          const todoSegment = body.querySelector(`.todo-segment[data-taskId="${targetTask.id}"]`);
          setTimeout(() => todoSegment.parentNode.removeChild(todoSegment), 650);
        });
        break;
      
      case "to-trash":
        moveTasks("trash", "completed", (targetTask) => {
          const todoSegment = body.querySelector(`.todo-segment[data-taskId="${targetTask.id}"]`);
          setTimeout(() => todoSegment.parentNode.removeChild(todoSegment), 650);
        });
        break;
      
      case "recover":
        moveTasks("completed", "trash", (targetTask) => {
          const todoSegment = body.querySelector(`.todo-segment[data-taskId="${targetTask.id}"]`);
          setTimeout(() => todoSegment.parentNode.removeChild(todoSegment), 650);
        });
        break;
        
      case "delete": {
        let trash = JSON.parse(localStorage.getItem("trash"));
      
        const targetTask = trash.find(task => task.id === option.getAttribute("data-taskId"));
      
        trash = trash.filter(task => task.id !== targetTask.id);
      
        localStorage.setItem("trash", JSON.stringify(trash));
      
        const todoSegment = body.querySelector(`.todo-segment[data-taskId="${targetTask.id}"]`);
        setTimeout(() => todoSegment.parentNode.removeChild(todoSegment), 650);
        
        const parentContainer = fullscrContainerBody.querySelector(`.trash`);
        
        if (parentContainer.querySelectorAll(".todo-segment").length <= 1) {
          const emptyContainer = createEmptyContainer("Trash");
          setTimeout(() => parentContainer.append(emptyContainer), 720);
        }
      }
    }
    
    taskOptionMenu.classList.remove("visible");
  }
});

// Creates a new task.
classNameListener(fullscrContainerBody.querySelector(".newtask"), (element) => {
  if (element.classList.contains("active")) return;
 
  // Each task will have its own unique ID and the ID will look something like this "12286193319368".
  const date = new Date();
  const id = [
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
  ].join("");
  
  const task = {
    text: newtaskTextarea.value.trim().replace(/[\r\n]/gm, " "),
    id,
  }
  
  if (!task.text.length) return;
 
  const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    
  todos.push(task);
  localStorage.setItem("todos", JSON.stringify(todos));
 
  const todosContainer = body.querySelector("section.todos");
  
  if (todosContainer.querySelector(".empty-container") !== null)
    todosContainer.removeChild(todosContainer.querySelector(".empty-container"));
  
  createTodoSegment(task.text, task.id, todosContainer);
});
