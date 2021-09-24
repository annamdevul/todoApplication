const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const ConvDBToResp = (Obj) => {
  return {
    id: Obj.id,
    todo: Obj.todo,
    priority: Obj.priority,
    status: Obj.status,
  };
};

app.get("/todos/", async (request, response) => {
  const { status } = request.query;
  const gettodosQuery = `SELECT
      *
    FROM
     todo
     WHERE
       status LIKE "${status}";`;
  const todosArray = await db.all(gettodosQuery);
  response.send(todosArray.map((each) => ConvDBToResp(each)));
});

app.get("/todos/", async (request, response) => {
  const { priority } = request.query;
  const getTodoPQuery = `SELECT
      *
    FROM
      todo
     WHERE
    
   priority LIKE '${priority}'`;
  const TodoPArray = await db.all(getTodoPQuery);
  response.send(TodoPArray);
});

app.get("/todos/", async (request, response) => {
  const { priority, status } = request.query;

  const getTodosPas = `
    SELECT 
       *
    FROM 
       todo
    WHERE 
        priority LIKE '${priority}' AND status LIKE '${status}' ; `;

  const todosPasArray = await db.all(getTodosPas);
  response.send(todosPasArray);
});

// GET search API

app.get("/todos/", async (request, response) => {
  const { search_q } = request.query;

  const getTodoSearch = `
    SELECT 
        *
    FROM 
       todo
    WHERE
       todo LIKE '%${search_q}%';`;

  const todosSearchArray = await db.all(getTodoSearch);
  response.send(todosSearchArray);
});

// GET todoId API

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoIdQuery = `
    SELECT 
       * 
    FROM 
       todo
    WHERE 
        id = ${todoId};`;

  const getTodoId = await db.get(getTodoIdQuery);
  response.send(ConvDBToResp(getTodoId));
});

// POST todo API

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;

  const postTodoQuery = ` 
     INSERT INTO 
         todo(id,todo,priority,status)
     VALUES 
        (
            ${id},
            '${todo}',
            '${priority}',
            '${status}'
        );`;

  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

// update todostatus API

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  const { status } = todoDetails;

  const updateTodoStatusQuery = `
    UPDATE 
       todo
    SET 
      status = '${status}'
    WHERE 
       id = ${todoId};`;

  await db.run(updateTodoStatusQuery);
  response.send("Status Updated");
});

// update priority API

app.put("/todos/:todoId/", async (request, response, next) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  const { priority } = todoDetails;

  const updateTodoPriorityQuery = `
    UPDATE 
       todo
    SET 
      priority = '${priority}'
    WHERE 
       id = ${todoId};`;

  await db.run(updateTodoPriorityQuery);
  response.send("Priority Updated");
  next();
});
