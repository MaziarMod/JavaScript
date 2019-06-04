// BUDGET CONTROLLER
let budgetController = (function(){

    let Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
       return this.percentage;
    };

    let Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function(type) {
        let sum = 0;
        data.allItem[type].forEach((currentElement, index, array) => {

            // because currentElement is either income object or expens object,
            // and both have "value" field
            sum += currentElement.value;
        });

        data.totals[type] = sum;
    };

    let data = {
        allItem:{
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val){
            let newItem, ID;

            // [1, 2, 3, 4, 5], next ID -> 6
            // [1, 2, 4, 6, 8], next ID -> 9
            // ID = last ID + 1
            // Create new ID
            if (data.allItem[type].length > 0) {
                ID = data.allItem[type][data.allItem[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'exp' or 'inc' type
            if (type === 'exp'){
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val)
            }

            // push it into our data structure
            data.allItem[type].push(newItem);

            // return the new element
            return newItem;
        },

        deleteItem: (type, id) => {


            // because the id may not the same as array index, we will create and array of id
            // and then we will access to that element
            // (---- for example the id=6 but in the "data" this 6 is in index 3 of the array
            // id = 6 in the array of [1, 2, 4, 6, 8] has index = 3
            // data.allItem[type][id] ---) you can see the problem, so we can create an array
            // of ids and then delete the element that we want
            let ids, index;
            ids = data.allItem[type].map(current => current.id);
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItem[type].splice(index, 1);
            }
        },

        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget:income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            // Expense = 100, Income = 200 , Spent 50% (100 / 200 = 0.5 * 100 = 50)
            if (data.totals.inc > 0){

                data.percentage = Math.round((data.totals.exp /data.totals.inc) * 100);
            } else {

                data.percentage = -1;
            }

        },

        calculatePercentages: function() {
            /*
            a = 20
            b = 10
            c = 40
            income = 100
            a = 20/100 = 20%
            b = 10/100 = 10%
            c = 40/100 = 40%
             */
            data.allItem.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function() {

            let allPerc = data.allItem.exp.map(function(current){
                return current.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc : data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data)
        }
    }
})();

// UI CONTROLLER
let UIController = (function(){
    let DOMstring = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    let formatNumber = (num, type) => {
        /*
        + or - before number
        exactly two decimal points
        comma separating the thousands
            2341.4567 -> 2,341.46
            2000 -> 2,000.00
         */

        let numSplit, int, dec;

        num = Math.abs(num);

        // (234.456).toFixed(2) -> 234.46
        // (2).toFixed(2) -> 2.00
        num = num.toFixed(2);

        numSplit = num.split('.');

        // int is the first part of num and because of split, it is string
        int = numSplit[0];

        if (int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
        }

        dec = numSplit[1];


        return  (type === 'exp' ?  '-' :  '+') + ' ' + int + '.' + dec;
    };

    // we create our own foreach function for node list. Because as we know, the
    // the useful method like split and the others are belong to the array, we can
    // can convert list to array or we can create our own foreach method for traversing
    // the list
    let nodeListForEach = function(list, callback) {
        for(let i=0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
           return {
            type: document.querySelector(DOMstring.inputType).value, // will be either inc or exp
            description: document.querySelector(DOMstring.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstring.inputValue).value)
            }
        },

        addListItem: function(obj, type) {
            let html, newHtml, element;
            // create HTML string with placeholder text

            if (type === 'inc'){

                element = DOMstring.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> ' +
                '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">' +
                '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if ( type === 'exp'){

                element = DOMstring.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>' +
                '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>' +
                '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }


            // replace the placeholder text with the actual text

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert html to the DOM
                document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: selectorID => {

            // for deleting an element from DOM, first, we find the element, and then
            // we will get the parent of element. After that, with removeChild method of
            // parentNode, we remove the element !!!
            let element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function(){
            let fields, fieldArr;

            //fields will be a list, but if we want to use useful method like traversing
            // the array, or other methods, we need to have an array instead of list.
            // we have to convert list to array. because fields variable is not an array
            //, so we cant write fields.slice(",") because slice is a method for arrays
            //. therefore, we will use Array obj and call method for conveting list to array
            fields = document.querySelectorAll(DOMstring.inputDescription + ',' + DOMstring.inputValue);

            fieldArr = Array.prototype.slice.call(fields);
            fieldArr.forEach(function(current, index, array) {
                current.value = "";
            });

            // for focus on the description text box in the UI
            fieldArr[0].focus();
        },

        displayBudget: function(obj) {

            // this obj is come from
            // getBudget: function() {
            //             return {
            //                 budget: data.budget,
            //                 totalInc : data.totals.inc,
            //                 totalExp: data.totals.exp,
            //                 percentage: data.percentage
            //             }
            //         },
            let type;
            obj.budget > 0 ? type = 'inc': type = 'exp';

            document.querySelector(DOMstring.budgetLabel).textContent =formatNumber(obj.budget, type);
            document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstring.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstring.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages){
            // it will return a nodes list
            let fields = document.querySelectorAll(DOMstring.expensesPercentageLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            });
        },

        displayMonth: () => {
            let now, year, month, months;

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            now =new Date();
            year = now.getFullYear();
            month = now.getMonth();

            document.querySelector(DOMstring.dateLabel).textContent = months[month] + ' ' + year ;

        },

        changedType: function() {

            // field is a list
            let fields = document.querySelectorAll(
                DOMstring.inputType + ',' +
                DOMstring.inputDescription + ',' +
                DOMstring.inputValue
            );
            // for traversing the list, we create a foreach function for lists

            nodeListForEach(fields, (current) => {
               current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstring.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstring;
        }
    }
})();

// CONTROLLER
let controller = (function(budgetCtrl, UICtrl){

    let setupEventListeners = function()  {

        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // we want to define an listener for tracking the enter key if user press enter
        // instead of clicking on the button
        document.addEventListener('keypress', (event) => {
            if (event.key === 13 || event.which === 13){

                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };


    let updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        let budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    let updatePercentages = () => {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        //UICtrl.displayPercentages(percentages);
        UICtrl.displayPercentages(percentages);
    };

    let ctrlAddItem = () => {
            let input, newItem;

        // 1. Get the field input data

            input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0){

            // 2. Add item to the budget controller
            newItem =  budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            //6. Calculate and update percentages
            updatePercentages();
        }
    };

    let ctrlDeleteItem = event => {
            /* <div class="item clearfix" id="income-0">
                <div class="item__description">Salary</div>
                  <div class="right clearfix">
                    <div class="item__value">+ 2,100.00</div>
                      <div class="item__delete">
                        <button class="item__delete--btn">
                            <i class="ion-ios-close-outline"></i>
                        </button>
                      </div>
                   </div>
               </div>
               we want to access to the forth parent of button (div with id="income-0")
               moreover, each new element that is added to the inc or exp will have different
               parent id ("inc-0", "inc-1",...
             */
        let itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID){

            // itemID format is "inc-0"
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item form the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc : 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);


controller.init();