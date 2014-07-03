var escodegen = require("escodegen");
var esprima = require("esprima");

function parse(node)
{
  console.log("parsing", node);
}

var code = escodegen.generate({
  type: "VariableDeclaration",
    declarations: [
        {
            "type": "VariableDeclarator",
            "id": {
                "type": "Identifier",
                "name": "cube"
            },
            "init": {
                "type": "NewExpression",
                "callee": {
                    "type": "Identifier",
                    "name": "Cube"
                },
                "arguments": []
            }
        }
    ],
  kind: "var"
},{parse:null});

console.log("code", code);

//var boo = new AssignmentExpression();
var n = require("ast-types").namedTypes;
var b = require("ast-types").builders;

var fooId = b.identifier("cube");

var ifFoo = b.ifStatement(fooId, b.blockStatement([
    b.expressionStatement(b.callExpression(fooId, []))
]));

var truc = b.functionDeclaration(
    b.identifier("TestFoo"), 
    [
        b.identifier("x")
    ],
    b.blockStatement([
        b.returnStatement(
            b.binaryExpression(
                "+", b.identifier("x"), b.literal(1)
            )
        )
    ]))

var toto = escodegen.generate( truc );
console.log("result:\n", toto);
console.log("========================");


var types = require("ast-types");
var def = types.Type.def;
var string = types.builtInTypes.string;
var b = types.builders;

// Suppose you need a named File type to wrap your Programs.
def("File")
    .bases("Node")
    .build("name", "program")
    .field("name", string)
    .field("program", def("Program"));


/*def("Translate")
    .bases("Expression")
    .build("callee", "arguments")
    .field("callee", def("Expression"))
    // See comment for NewExpression above.
    .field("arguments", [def("Expression")]);*/

// Prevent further modifications to the File type (and any other
// types newly introduced by def(...)).
types.finalize();

/*var main = b.translate(
   b.identifier("x"),
   [b.literal(3)]
);*/

var main = b.file("main.js", b.program([

]));

console.log("custom thing done");

var toto = escodegen.generate( main );
console.log("result:\n", toto);
console.log("========================");

