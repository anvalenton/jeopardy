// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

// selects div with loading animation
let loadingDiv = document.querySelector("#loadingdiv");
//selects table header cells
let arrOfTh = document.querySelectorAll('th');
//selects table data cells
let arrOfTd = document.querySelectorAll('td');


//set all table header cells and table data cells size to 0 so
// they grow during loading animation

gsap.set(arrOfTh, {
    width: 0,
    height: 0,
    opacity: 0
})
gsap.set(arrOfTd, {
    width: 0,
    height: 0,
    opacity: 0
})

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
 try {
    
    while (categories.length < 7) {

//         const HttpsProxyAgent = require("https-proxy-agent"),
//       axios = require("axios");

//     const httpsAgent = new HttpsProxyAgent({host: "proxyhost", port: "proxyport", auth:     "username:password"})

// //use axios as you normally would, but specify httpsAgent in the config
//     axios = axios.create({httpsAgent});

    let response = await axios.get("https://jservice.io/api/random", {params: {count: 1}});
    let randomCategoryID = response.data[0].category.id;
    let cluesCheck = await axios.get("https://jservice.io/api/clues", {params: {category: randomCategoryID}});
    let numOfClues = cluesCheck.data.length;
    //soj
    if (numOfClues > 20) {

        categories.push(randomCategoryID);

    }
       
    }
    
 }

 catch {
     console.log('error with getCategoryID func!');
     console.log(response);
 }

 return categories;

}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategoryClues(catId) {

try {
    let finalCluesArray = []

    let clues = await axios.get("https://jservice.io/api/clues", {params: {category: catId}})
    
    let totalAvailableClues = clues.data.length;
    //this cluesIndexArray array holds random numbers that are less than the maximum number of available clues for the category. the array length is 5 because that is the number of clues needed per category for the game

    let cluesIndexArray = randomUniqueNumbersLessThanMaxNum(totalAvailableClues);

    for (let sub of cluesIndexArray) {

        let clue = {
            id: clues.data[sub].id,
            answer: clues.data[sub].answer,
            question: clues.data[sub].question,
            category: clues.data[sub].category.title

        }
        //jservice api has some issues where some questions are blank or there are duplicate clues with 
        //different ids. the if statement below tries to remedy that issue. 
        if (clue.question !== "" || finalCluesArray.length>6) {
           
         finalCluesArray.push(clue);
            
        }
    }

    
    
    //returns an array with objects inside
    return finalCluesArray;
    

}

catch {
    console.log('error in getCategory func');

}
}



function randomUniqueNumbersLessThanMaxNum(maxNum) {
    
    let randomNumArray = []
    
    //if the random number is not found in the array, it is added to it
    //the if statement is to avoid repeats
    while (randomNumArray.length < 20) {
        // while the randomNumArray has less than 

        let randomNum = Math.floor(Math.random() * Math.floor(maxNum))

        if (randomNumArray.indexOf(randomNum) < 0) {

            randomNumArray.push(randomNum);
        }
        

    }
   
    return randomNumArray;
}



/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable(arr) {
    for (let i=0; i<6; i++) {
        //above loop goes through all category ids in the category array
       getCategoryClues(arr[i])
        .then(function(categoryCluesArr) { 
        //add category to header cell
        $(`#col${i}`).text(categoryCluesArr[i].category.toUpperCase());
        //add clues below that category
        for (let j=0; j<5; j++) {
            $(`#col${i}-${j}-1`).text(categoryCluesArr[j].question);
            $(`#col${i}-${j}-1a`).text(categoryCluesArr[j].answer);
    
        }

    

        })}}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

//function handleClick(evt) {
//}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {


    
    /// 
    gsap.timeline()
    .to("#svganim", {
        duration: 2,
        opacity: 0
    })
    .to(loadingDiv, {
        duration: 1,
        width: "0px",
        height: "0px",
        opacity: 0,
        display: "none"
    })
    .to("#tabledivid", {
        width: "100%",
        height: "100%",
        opacity: 1,
        duration: 1,
        display: "flex"
    })
    .to(arrOfTh, {
        display: "table-cell",
        width: "230px",
        height: "180px",
        stagger: .5,
        opacity: 1

    })
    .to(arrOfTd, {
        display: "table-cell",
        width: "230px",
        height: "180px",
        stagger: .2,
        opacity: 1

    })
    .to("#startbutton", {
        opacity: 1
    })

    
}

   

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {

    try {
        
        //clear out all td and th
        for (let i=0; i<6; i++) {
        $(`#col${i}`).empty();

        
            for (let j=0; j<5; j++) {
            $(`#col${i}-${j}-1`).empty();
            $(`#col${i}-${j}-1a`).empty();
            
            }

        }

        categories=[];
        getCategoryIds()
        .then(result => fillTable(result))
    }

    catch(error) {
        console.log('error with setupAndStart');
        console.log(error);
    }
}






/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO

//puts ids into the categories array


//loop over categories array to get clues and category name
//getCategoryClues yields an array with objects. inside the object are clues, questions, id, category name

getCategoryIds()
.then(result => fillTable(result))
.then(result2 => hideLoadingView(result2))



//TRIAL CODE BELOW FOR READYSTATE CHANGE. DISREGARD.
//document.addEventListener('readystatechange', event => {
  //  if (event.target.readyState === 'complete') {

        //add this class
        //add this class
  //  }

//} )

//window.addEventListener('load', (event) => {

//})

//$("window").on("load",function() {
//    $("#tabledivid").animate({
//        width: "100%",
//	    height: "100%"
//    }, 4000);
//    console.log('document ready');
//}

///////////////////////////////////////////////////////

$("#startbutton").on("click", function(event) {
    event.preventDefault();
    setupAndStart();

});


//event handlers below for clicking on clues, showing and hidibng
$(".cluediv").on("click", function() {

    $(`#${this.id}`).css("display","none");
    $(`#${this.id}a`).css("display", "inline");


})

$(".coverdiv").on("click", function() {

    $(`#${this.id}`).css("display","none");
   
})



