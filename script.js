"use strict";
let stock_symbol = ""
let company_name = ""
const alphavantage_api_key ="P1IPHWHQ7R3CIHDT"
const twitter_bearer = "AAAAAAAAAAAAAAAAAAAAAESX9gAAAAAAMaY%2FkPLVr%2FVvbVtKXy%2Brvce3SIk%3DP4Vw1WrkLpL6FwB3K9Uqg0nGK6lY48jNZz7ssdfsqBUTktC8Wb"

function updateHomeNumbers(myJson){
    const open = myJson["Global Quote"]["02. open"]
    const close = myJson["Global Quote"]["05. price"]
    const pct_change = (close-open)/close*100
    console.log(open,close,pct_change)
}

function fetchAlphavantage(){
    console.log(`Attempting to pull ${stock_symbol} by the numbers`)
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock_symbol}&apikey=${alphavantage_api_key}`
    fetch(url).then(
        response => {
            if (response.ok){
                return response.json()
            }
            else {
                throw new Error(response.statusText)
            }
        }
    ).then(
        responseJson =>{
            updateHomeNumbers(responseJson)
            console.log(responseJson)
        }
    ).catch(err=>{
        console.log(err)
    })
}

function fetchNews(){
    console.log(`Attempting to pull ${company_name} for news`)
}

function fetchSocial(){
    console.log(`Attempting to pull ${stock_symbol} on social`)
}

function fetchRunner(){
    fetchAlphavantage()
    fetchNews()
    fetchSocial()
}

function watch_submit(){
    console.log("watching submit button")
    $(".js-search-form").submit(event=>{
        event.preventDefault()
         /* Update global var stock_symbol */
        stock_symbol = $("#js-stock-search").val()
        console.log(stock_symbol)
        /* Clearing search bar */
        $("#js-stock-search").val("")
        fetchRunner()
    })
}
function ready_fx(){
    console.log("Ready to watch some functions")
    watch_submit()
}
$(ready_fx)