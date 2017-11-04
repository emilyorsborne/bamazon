var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});



// Connect to DB
connection.connect(function(err) {

    function readProducts() {
        console.log("Here are all of Bamazon's products...\n");
        connection.query("SELECT * FROM products", function(err, res) {
            if (err) throw err;
            // Log all results of the SELECT statement
            console.log(res);
            connection.end();
        });
    }
    console.log(readProducts());
});

function buyProduct() {
    // query the database for all items being auctioned
    connection.query("SELECT * FROM products", function(err, results) {
            if (err) throw err;
            // once you have the items, prompt the user for which they'd like to bid on
            inquirer
                .prompt([{
                        name: "product",
                        type: "input",
                        choices: function() {
                            var choiceArray = [];
                            for (var i = 0; i < results.length; i++) {
                                choiceArray.push(results[i].item_name);
                            }
                            return choiceArray;
                        },
                        message: "What product would you like to purchase? (please use the item's ID)"
                    },
                    {
                        name: "amount",
                        type: "input",
                        message: "How many would you like to purchase?"
                    }
                ]).then(function(answer) {
                        product_ID: answer.product,
                        product_amount: answer.amount
                    },
                    (function(answer) {
                        // get the information of the chosen item
                        var chosenItem;
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].product_ID === answer.choice) {
                                chosenItem = results[i];
                            }
                        }

                        //is there enough stock?
                        if (stock_quantity > parseInt(answer.amount)) {
                            connection.query(
                                "UPDATE products SET ? WHERE ?", [{
                                        stock_quantity = stock_quantity - product_amount
                                    },
                                    {
                                        id: chosenItem.id
                                    }
                                ],
                                function(error) {
                                    if (error) throw err;
                                    console.log("Order was placed successfully!");
                                }
                            );
                        } else {
                            // bid wasn't high enough, so apologize and start over
                            console.log("Sorry we do not have enough of that product. Please enter a lower amount.");
                        }
                    });
                });
    }