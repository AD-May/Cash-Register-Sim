/* Author: Alexander May 
    Last Modified: 10/4/2024 */

const changeDue = document.getElementById("change-due");
const input = document.getElementById("cash");
const totalSpan = document.getElementById("total-span");
const registerChange = document.getElementById("register-change");
const purchaseBtn = document.getElementById("purchase-btn");

let price = 20; // Sets initial price of simulated item

// (Cash In Drawer): An array of currency denominations and their current amounts in the register
let cid = [
  ['PENNY', 1.01],
  ['NICKEL', 2.05],
  ['DIME', 3.10],
  ['QUARTER', 4.25],
  ['ONE', 90],
  ['FIVE', 55],
  ['TEN', 20],
  ['TWENTY', 60],
  ['ONE HUNDRED', 100]
];

// Object for matching denominations to their currency values
let values = {
  "Pennies": 0.01,
  "Nickles": 0.05,
  "Dimes": 0.10,
  "Quarters": 0.25,
  "Ones": 1.00,
  "Fives": 5.00,
  "Tens": 10.00,
  "Twenties": 20.00,
  "Hundreds": 100.00
};

// Variables for managing transaction/register state
let cash; // Amount of money provided by user
let state = "OPEN"; // State of the transaction (Can be "OPEN", "CLOSED", or "INSUFFICIENT_FUNDS")
let change = []; // Array to store change to be given
let totalChange = 0; // Tracks the total amount of change in the register

// Inititalizes display on window load
window.onload = () => {
   totalSpan.textContent = price; // Display price of item on register popup
   //Displays cash available in the register according to denomination
   cid.forEach((element,index) => registerChange.innerHTML += 
    `<span id="change-span-${index}" class="changeSpan">
        ${Object.keys(values)[index]}: <span id="change-left-${index}" class="changeLeftSpan">$${cid[index][1]}</span>
     </span>`); 
}

// Function to display the change due and transaction status
const displayChangeDue = () => {
  changeDue.style.display = "block"; // Switches the style of the change-due section from "hidden"
  changeDue.innerText = `Status: ${state}`; // Displays transaction status in change-due section
  if(cash === price) {
    // If the customer paid the exact amount display the following message
    changeDue.innerText = "No change due - customer paid with exact cash";
  }
  // Display each denomination and the amount given as change
  change.forEach((element) => changeDue.innerHTML += `<br>${element[0]}: $${element[1]}`);
}

// Function to update the displayed cash in drawer after dispensing change
const updateRegisterChange = (index) => {
  const changeLeftSpans = document.querySelectorAll(".changeLeftSpan"); // Gets all spans created on window load

  //Update the amount for the specific denomination
  changeLeftSpans.forEach((span) => {
    if(span.id === `change-left-${index}`) {
      span.innerText = `$${(cid[index][1])}`;
      return; // If the span to change is found, exit the function
    }
  }); 
}

// Function for calculating the change to be given to the customer (main function)
const calculateChange = (cash) => {
  change = []; // Reset the change array
  const changeValueArr = Object.values(values); // Create array from denomination values object
  let changeRequired = parseFloat((cash - price).toFixed(2)); // Calculate change required for customer
  let cidCopy = JSON.parse(JSON.stringify(cid)); // Creates a deep copy of cid for mutation purposes

  checkChange(changeRequired, changeValueArr); // Check if there is enough change in the register
  checkDenominations(cidCopy, changeRequired, changeValueArr); // Check if change can be made with available denominations
  userFeedback(cash); // Provide feedback to the user based on transaction state

  // If the register/transaction is open and customer did not provide exact change, continue with dispensing change
  if(state === "OPEN" && cash !== price) {
    // Loop through denominations from highest to lowest
    for(let i = 8; i >= 0; i--) {
      // While the denomination can be used to make change and there's enough of that denomination in the register
      while(changeRequired - changeValueArr[i] >= 0 && cid[i][1] > 0) {
        // Check if the denomination is already in the change array
        change.some((element) => element[0] === cid[i][0]) ?
          // If it is, add the denomination value to the existing amount
          change[change.findIndex((element) => element[0] === cid[i][0])][1] += changeValueArr[i] :
          // If not, add a new entry for the denomination
          change.push([cid[i][0], changeValueArr[i]]);
        // Subtract the denomination value from the change required and update the register
        changeRequired = parseFloat((changeRequired - changeValueArr[i]).toFixed(2));
        cid[i][1] = parseFloat((cid[i][1] - changeValueArr[i]).toFixed(2));
        updateRegisterChange(i); // Update displayed register amount for specific index
      }
    }
  }
  // Update total change available after dispensing
  checkTotalChange();

  // If register is empty after dispensing change, set state to closed
  if(totalChange === 0) {
    state = "CLOSED";
  }

  // Display change due and transaction status
  displayChangeDue();

  price = parseFloat((Math.random() * 100).toFixed(2)); // Create a new product price for the transaction
  totalSpan.textContent = price; // Set that new product price for user display
}

// Function to check if there is enough total change available in the register
const checkChange = (change, changeValueArr) => {
  let changeAvailable = 0;

  // Calculate total change available in denominations less thant the change required
  for(let i = 0; i < cid.length; i++) {
    if(changeValueArr[i] < change) {
      changeAvailable += parseFloat(cid[i][1]); // Sum the amounts
    }
  }

  checkTotalChange(); // Update the total available change in the register

  // If there is not enough change available denomination wise or in total, set state to insufficent_funds, otherwise proceed
  if(changeAvailable < change || totalChange < change) {
    state = "INSUFFICIENT_FUNDS";
  } else {
    state = "OPEN";
  }
}

// Function to calculate the total change available in the register
const checkTotalChange = () => {
  totalChange = 0 // Reset the total change
  // Sum the amounts of all change elements in the register
  for(let i = 0; i < cid.length; i++) {
    totalChange += parseFloat(cid[i][1]);
  }
}

// Function to simulate dispensing change to check if exact change can be made with available denominations
const checkDenominations = (cid, change, denominations) => {
  let changeValue = change; // Copy the change required
  let cidCopy = cid; // Use deep copy of cid passed as argument

  for(let i = denominations.length - 1; i >= 0; i--) {
    while(changeValue >= denominations[i] && cidCopy[i][1] > 0) {
      // Subtract denomination value from the change required and the register copy 
      changeValue = parseFloat((changeValue).toFixed(2)) - parseFloat((denominations[i]).toFixed(2));
      cidCopy[i][1] = parseFloat((cidCopy[i][1]).toFixed(2)) - parseFloat((denominations[i]).toFixed(2));
    }
  }
  // If after attempting to make change, there's still some change required, set state to INSUFFICIENT_FUNDS
  if(changeValue > 0.009) {
    state = "INSUFFICIENT_FUNDS"
  }
}

// Function to provide feedback to the user based on the transaction state
const userFeedback = (cash) => {
    if(state === "INSUFFICIENT_FUNDS" || totalChange === 0) {
      // If not enough change is available, alert user
      alert("There is not enough change in the register for that")
    } else if(cash < price) {
      state = "INSUFFICIENT_FUNDS" // Set the state if the customer didn't provide enough cash
      alert("Customer does not have enough money to purchase the item")
    }
}

// Event listener for the purchase button 
purchaseBtn.addEventListener("click", () => {
  changeDue.innerHTML = ``; // Clear change due display
  changeDue.style.display = "none"; // Hide the change-due div
  cash = parseFloat((parseFloat(input.value)).toFixed(2));
  calculateChange(cash); // Process the cash input
});

