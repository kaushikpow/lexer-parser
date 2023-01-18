import fs from "fs";
import ps from "prompt-sync";

let prompt = ps();
//read the input file and convert it to upper case
let lines = fs
  .readFileSync("input.txt")
  .toString()
  .replace(/\r/g, "")
  .toUpperCase()
  .split("\n");

// this stack class implements a stack with functions like push and pop.
class StackADT {
  constructor(size) {
    this.array = new Array(size);
    this.top = -1;
  }

  push(value) {
    if (this.top == this.size - 1) return;
    this.top++;
    this.array[this.top] = value;
  }

  pop() {
    if (this.top == -1) return;
    let temp = this.array[this.top];
    this.top--;
    return temp;
  }
}
//declaring variables for few conditional checking purposes and for data structures.
let flag = 0;
let i = 0;
let goto_helper = new Map();
let lines_memory = new Map();
let map = new Map();
let call_stack = new StackADT(100); //this stack will be used for dealing with nested subroutines
let stack = new StackADT(100); // this stack will be used to implement PUSH and POP statements.

// storing each line in memory
// also using a separate map data structure for dealing with go-to statmenet.
for (let line of lines) {
  let temp = line.split(" ");
  goto_helper.set(temp[0], i);
  lines_memory.set(i, temp.slice(1));
  i++;
}

i = 0;
while (true) {
  //diving each line into tokens
  let tokens = lines_memory.get(i);
  switch (tokens[0]) {
    //if the line is starting with INTEGER word
    case "INTEGER":
      let temp = tokens.slice(1);
      for (let item of temp) {
        if (/^[A-Z]+$/g.test(item)) {
          //checking if the variable is a valid sequence of letters or not and storing it in map with a null value
          map.set(item, null);
        }
      }
      break;

    case "LET":
      //Used regular expression for string matching
      //checking if the variable is a capital letter or combinations of capital letters
      if (/^[A-Z]+$/g.test(tokens[1])) {
        let temp = tokens.slice(3, tokens.length);
        if (/^\w+(?:\s[+*/]\s\w+)+$/gm.test(temp.join(" "))) {
          //checking if the value to be assinged is an arithmetic expression with spaces
          let val = eval_expression(temp);
          map.set(tokens[1], val);
        } else if (/^\w+(?:[+*/]\w+)+$/gm.test(temp.join(""))) {
          temp = temp[0].split("");
          //checking if the value to be assinged is an arithmetic expression without spaces
          let val = eval_expression(temp);
          map.set(tokens[1], val);
        } else if (/^[A-Z]+$/g.test(tokens[3])) {
          //checking if the value to be assigned is a single variable
          if (map.get(tokens[3])) map.set(tokens[1], map.get(tokens[3]));
        } else if (/^[0-9]+$/g.test(tokens[3])) {
          // checking the value to be assigned is a valid positive integer
          map.set(tokens[1], tokens[3]);
        }
      }
      break;
    case "PRINT":
      //if the line is starting with "PRINT" word
      let counter = 2;
      // if there is a quotation, just print everything until we encounter a closing quotation
      if (tokens[1] == '"') {
        while (tokens[counter] != '"') {
          if (/^[A-Z]+$/g.test(tokens[counter]))
            process.stdout.write(
              `${tokens[counter].toString().toLowerCase()} `
            );
          else process.stdout.write(`${tokens[counter].toString()} `);
          counter++;
        }
        counter += 2;
        if (tokens[counter] != undefined) {
          let temp = eval_expression(tokens[counter].split(""));
          process.stdout.write(temp.toString());
        }
      } //checking if the value to be assigned is an arithmetic expression
      else if (/^\w+(?:[+*/]\w+)+$/gm.test(tokens[1])) {
        let val = eval_expression(tokens[1].split(""));
        process.stdout.write(`${val.toString()} `);
      } else if (/^[A-Z]+$/g.test(tokens[1]))
        // if the value to be printed is a single variable
        process.stdout.write(`${map.get(tokens[1]).toString()} `);
      break;

    //Everything is same, but here, every printing happens in a new line.
    case "PRINTLN":
      let q = 2;
      //if the line is starting with "PRINTLN" word
      if (tokens[1] == '"') {
        let temp = "";
        while (tokens[q] != '"') {
          if (/^[A-Z]+$/g.test(tokens[q]))
            temp += tokens[q].toLowerCase() + " ";
          else temp += tokens[q] + " ";
          q++;
        }

        q += 2;
        if (tokens[q] != undefined) {
          temp += eval_expression(tokens[q].split(""));
        }
        console.log(temp);
      } else if (/^[A-Z]+$/g.test(tokens[1])) {
        console.log(map.get(tokens[1]));
      } else if (/^\w+(?:[+*/]\w+)+$/gm.test(tokens[1])) {
        let val = eval_expression(tokens[1].split(""));
        console.log(val);
      }
      break;

    case "INPUT":
      // if the sentence is starting with INPUT word
      console.log();
      let user_input = prompt(); // taking the input from the user from command prompt

      let count = 0;
      let input = tokens.slice(1);
      for (let item of input) {
        if (/^[A-Z]+$/g.test(item)) {
          // counting the number of variables in the input statement.
          count++;
        }
      }
      user_input = user_input.split(" ");
      let input_length = user_input.length;

      if (count != input_length) {
        // if the given input is missing a value throw an error and end the program
        for (const [key, value] of goto_helper) {
          if (value == i) {
            console.log("line " + key + " missing input value");
            process.exit();
          }
        }
      }

      let p = 0;

      for (let item of input) {
        // setting the values entered by the user to the variables.
        if (/^[A-Z]+$/g.test(item)) {
          map.set(item, user_input[p]);
          p++;
        }
      }
      break;

    case "IF":
      //if the sentence is starting with IF statement.
      let check = 0;
      let value1;
      let value2;

      if (/^\w+(?:[+*/]\w+)+$/gm.test(tokens[1])) {
        value1 = eval_expression(tokens[1].split(""));
      } else if (/^[A-Z]+$/g.test(tokens[1])) {
        // if the value to be printed is a single variable
        value1 = eval_expression([tokens[1]]);
      } else value1 = eval_expression([tokens[1]]);

      if (/^\w+(?:[+*/]\w+)+$/gm.test(tokens[3])) {
        value2 = eval_expression(tokens[3].split(""));
      } else if (/^[A-Z]+$/g.test(tokens[3]))
        // if the value to be printed is a single variable
        value2 = eval_expression([tokens[3]]);
      else value2 = eval_expression([tokens[3]]);

      //checking the operator between <|>|!|=
      switch (tokens[2]) {
        case "<":
          if (value1 < value2) check = 1;
          break;

        case ">":
          if (value1 > value2) check = 1;
          break;

        case "=":
          if (value1 == value2) check = 1;
          break;
        case "!":
          if (value1 != value2) check = 1;
          break;
      }
      //checking if the 'if' sentence has goto or print or println
      if (check == 1) {
        if (tokens[5] == "GOTO") {
          i = goto_helper.get(tokens[6]);
          i--;
        } else if (tokens[5] == "PRINT") {
          if (tokens[6] == '"') {
            let j = 7;
            while (tokens[j] != '"') {
              process.stdout.write(`${tokens[j].toString().toLowerCase()} `);
              j++;
            }
          }
        } else if (tokens[5] == "PRINTLN") {
          if (tokens[6] == '"') {
            let j = 7;
            let temp = "";
            while (tokens[j] != '"') {
              temp += tokens[j].toLowerCase() + " ";
              j++;
            }
            console.log(temp);
          }
        }
      }
      break;

    case "GOTO":
      i = goto_helper.get(tokens[1]);
      i--;
      break;

    case "GOSUB":
      // if the statement is starting with gosub word
      call_stack.push(i);
      let target = tokens[1];
      if (goto_helper.get(target) == undefined) {
        // handling error case
        console.log("line number not found - " + target);
        process.exit();
      } else {
        i = goto_helper.get(target);
        i--;
      }
      break;

    case "RET":
      // if the statement is starting with ret word. This will return the control from the function to the next line of the caller function
      i = call_stack.pop();
      break;

    case "PUSH":
      // if the statement is starting with the push word. This will insert a value on top of the stack.
      stack.push(eval_expression(tokens[1].split("")));
      break;

    case "POP":
      // if the statement is starting with the pop word. This will delete the top value from the stack.
      map.set(tokens[1], stack.pop());
      break;

    case "END":
      //if the sentence has end word, end the program.
      flag = 1;
      break;
  }
  if (flag == 1) break;
  i++;
}
// this function is used to evaluate an arithmetic expression.
// this function has been inspired from https://www.geeksforgeeks.org/expression-evaluation/
function eval_expression(token) {
  let values = [];
  let ops = [];

  for (let i = 0; i < token.length; i++) {
    if (/[A-Z]/g.test(token[i])) {
      values.push(parseInt(map.get(token[i])));
    } else if (token[i] >= "0" && token[i] <= "9") {
      let number = "";

      while (i < token.length && token[i] >= "0" && token[i] <= "9") {
        number = number + token[i++];
      }
      values.push(parseInt(number));
      i--;
    } else if (
      token[i] == "+" ||
      token[i] == "-" ||
      token[i] == "*" ||
      token[i] == "/"
    ) {
      while (ops.length > 0 && checkPrecedence(token[i], ops[ops.length - 1])) {
        values.push(evaluate(ops.pop(), values.pop(), values.pop()));
      }

      ops.push(token[i]);
    }
  }

  while (ops.length > 0) {
    values.push(evaluate(ops.pop(), values.pop(), values.pop()));
  }

  return values.pop();
}

//helper function for eval_expression function
function evaluate(op, b, a) {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return a / b;
  }
}

//helper function for eval_expression function
function checkPrecedence(op1, op2) {
  if ((op1 == "*" || op1 == "/") && (op2 == "+" || op2 == "-")) return false;
  return true;
}
