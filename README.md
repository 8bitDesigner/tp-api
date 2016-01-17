# What is this?

A NodeJS library to talk to Target Process 3's API.

## How do I use it?

In your NodeJS program, add:

``` javascript
var tp = require('tp-api')({
           domain:   // your domain here; eg: 'fullscreen.tpondemand.com'
           username: // your username; eg: 'paul@fullscreen.net'
           password: // your password
           version:  // Optional API version - defaults to 1
           protocol: // Optional protocol - defaults to https
         })

tp('Tasks')
  .take(5)
  .where("EntityState.Name eq 'Open'")
  .pluck('Name', 'NumericPriority')
  .sortBy('NumericPriority')
  .then(function(err, tasks) {
    console.log('my tasks', tasks)
  }
)
```

### Methods

#### `tp()` or `tp([Entity name])`
Returns a TargetProcess request object. Can optionally set an entity to request.

#### `tp.get(Entity Name)`
Tells the TargetProcess object to request the given entity. An entity can be one
of the following:

* Context
* Projects
* Features
* Releases
* Iterations
* Requests
* CustomFields
* Bugs
* Tasks
* TestCases
* Times
* Impediments
* Assignments
* Attachments
* Comments
* UserStories
* Roles
* GeneralUsers
* EntityStates

Example - fetch a list of roles
``` javascript
tp('Roles').then(function(err, tasks) { ... })
```

#### `tp.take(n)`
Tells the TargetProcess object to request `n` of the requested entities

Example - fetch 5 tasks:
``` javascript
tp('Tasks').take(5).then(function(err, tasks) { ... })
```

#### `tp.context(acid)`
Retrieve list of entities for specific projects (via Acid)

Example - fetch 5 tasks of the project with the context 123456:
``` javascript
tp('Tasks').take(5).context(123456).then(function(err, tasks) { ... })
```

#### `tp.where(search expression)`
Applies a search filter to the TargetProcess request.

Example, find open tasks:

``` javascript
tp('Tasks').where("EntityState.Name eq 'Open'").then(function(err, tasks) { ... })
```

More info on Target Process filters can be found here:
http://dev.targetprocess.com/rest/response_format#filtering

#### `tp.pluck(list, of, properties)`
Instructs the Target Process object to only include the listed properties in the
response object:

Example, fetch the name and description from these tasks:
``` javascript
tp('Tasks').pluck('Name', 'Description').then(function(err, tasks) { ... })
```

#### `tp.sortBy(field)`
Tells the Target Process request to sort on the given field

Example, fetch a list of tasks by priority:
``` javascript
tp('Tasks').sortBy('NumericPriority').then(function(err, tasks) { ... })
```
or sort by descending order:
```javascript
tp('Tasks').sortByDesc('NumericPriority').then(function(err, tasks) { ... })
```

#### `tp.append(list, of, properties)`
Instructs the Target Process request to get additional information about Entity

Example, get number of bugs, tasks and comments associated with those user stories:
```javascript
tp('UserStories').append('Bugs-Count, Tasks-Count, Comments-Count')
.then(function(err, tasks) { ... })
```

#### `tp.then(handlerFunction)`
Executes the Target Process request. Your callback will be called with an
error object and the result of your request.

Example, fetch a list of tasks:
``` javascript
tp('Tasks').then(function(err, tasks) {
  console.log('My tasks', tasks)
  console.error('Errors from the request', err)
})
```
#### `tp.thenEntities(handlerFunction)`
Thin wrapper around `tp.then`, but instead of returning `(err, data)` it returns `(err, entities)` where entities is an array of entity objects.

Example, fetch a list of Entities
``` javascript
// Move all open tasks to 'Planned'
tp('Tasks').
  where("EntityState.Name eq 'Open'").
  then(function(err, tasks) {
  tasks.forEach(function(entity){
    entity.setState('Planned')
  })
})
```

#### Nested JSON objects
It may happen that the following code:
```javascript
tp('Tasks')
  .take(1)
  .pluck('CustomFields')
  .then(function(err, tasks) {
    console.log('my tasks', tasks)
  }
)
```
will return a lot of nested JSON objects:
```bash
my tasks [ { ResourceType: 'Task',
    Id: 3631,
    Project: { ResourceType: 'Project', Id: 4026, Process: [Object] },
    CustomFields: [ [Object], [Object], [Object], [Object], [Object] ] } ]
```
The returned object `tasks` here is a JavaScript object. In order to convert it into JSON string, use [`JSON.stringify()`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify):
```javascript
tp('Tasks')
  .take(1)
  .pluck('CustomFields')
  .then(function(err, tasks) {
    console.log('my tasks', JSON.stringify(tasks))  // changed here
  }
)
```
and now it returns:
```bash
my tasks [{"ResourceType":"Task","Id":3631,"Project":{"ResourceType":"Project","Id":4026,"Process":{"Id":5,"Name":"AIScrum"}},"CustomFields":[{"Name":"Component","Type":"DropDown","Value":null},{"Name":"trac","Type":"Number","Value":null},{"Name":"Job","Type":"DropDown","Value":null},{"Name":"Resolution","Type":"DropDown","Value":null},{"Name":"Domain","Type":"DropDown","Value":null}]}]
```
