"use strict";
let stock_symbol = ""
let company_name = ""
const alphavantage_api_key ="P1IPHWHQ7R3CIHDT"
const twitter_bearer = "AAAAAAAAAAAAAAAAAAAAAESX9gAAAAAAMaY%2FkPLVr%2FVvbVtKXy%2Brvce3SIk%3DP4Vw1WrkLpL6FwB3K9Uqg0nGK6lY48jNZz7ssdfsqBUTktC8Wb"
let date_string = ""
const newsApiKey = "c34722c63a774c9aa4706225014f9411"

function getDateString(){
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth(); //January is 0!
    const yyyy = today.getFullYear();
    const months =["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    date_string = `${months[mm]} ${dd},${yyyy}`
}

function updateHomeNumbers(myJson){
    const open = Math.round(myJson["Global Quote"]["02. open"] * 100) / 100
    const close = Math.round(myJson["Global Quote"]["05. price"]*100)/100
    const pct_change = Math.round((close-open)/close*100*1000)/1000
    $(".home-open").text(`$${open}`)
    $(".home-close").text(`$${close}`)
    $(".home-pct").text(`%${pct_change}`)
    $(".home-header").text(`${stock_symbol} pulled on ${date_string}`)
    //console.log(open,close,pct_change)
}
function retrieveCompanyName(){
    const base_url =`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stock_symbol}&apikey=${alphavantage_api_key}`
    fetch(base_url).then(
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
            console.log(responseJson)
            company_name = responseJson["bestMatches"][0]["2. name"]
            console.log(company_name)
            //done after this step because we require company name to proceed
            fetchNews()
        }
    ).catch(err=>{
        console.log(err)
    })
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
            //console.log(responseJson)
        }
    ).catch(err=>{
        console.log(err)
    })
}

function urlExtend(base_url,params){
    const queryItems = Object.keys(params)
    const queryString = queryItems.map(key=>{
        return `${key}=${params[key]}`
    })
    const finalUrl = `${base_url}?${queryString.join("&")}`
    return finalUrl
}

//removed for now. Twitter API does not support CORS
function fetchSocial1(){
    console.log(`Attempting to pull ${stock_symbol} on social`)
    const base_url = "https://api.twitter.com/1.1/search/tweets.json"
    const  params = {
        "q":`$${stock_symbol}`
    }
    const options = {
    headers: new Headers({
      "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAAESX9gAAAAAAMaY%2FkPLVr%2FVvbVtKXy%2Brvce3SIk%3DP4Vw1WrkLpL6FwB3K9Uqg0nGK6lY48jNZz7ssdfsqBUTktC8Wb",
    })};
    const queryUrl = urlExtend(base_url,params)
    fetch(queryUrl,options).then(response =>{
        if (response.ok){
            return response.json()
        }
        throw new Error(response.statusText)
    }).then(responseJson=>{
        console.log(responseJson)
    }).catch(err=>console.log(err))
}

function fetchSocial(){
    console.log(`Attempting to fetch social information on ${stock_symbol}`)
}

function updateHomeNews(responseJson){
    $(".home-news-ul").empty()
    $(".news-title").text(`Top Headlines for ${company_name} on ${date_string}`)
    const top3_news = responseJson["articles"].slice(0,2)
    console.log(top3_news)
    for (let i =0 ; i< top3_news.length ; i++){
        $(".home-news-ul").append(`
        <li>
        <h5>${top3_news[i].title}<span>- From- ${top3_news[i]["source"]["name"]}</span></h5>
        <p>${top3_news[i].description}</p>
        <a href="${top3_news[i].url}" target="_blank" >Full article</a>
        </li>
        `)
    }
}

function fetchNews(){
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth(); //January is 0!
    const yyyy = today.getFullYear();
    console.log(`Attempting to pull ${company_name} for news`)
    const base_url ="https://newsapi.org/v2/everything"
    const params = {
        "q":encodeURIComponent(company_name+" Company"),
        "apiKey":newsApiKey,
        "language":"en",
        "sortBy":"relevancy",
        "from":`${yyyy}-${mm}-${dd}`
    }
    const query_url = urlExtend(base_url,params)
    console.log(query_url)
    fetch(query_url).then(response=>{
        if (response.ok){
            return response.json()
        }
        throw new Error(response.statusText)
    }).then(
        responseJson=>{
            updateHomeNews(responseJson)
        }
    ).catch(err=>console.log(err))
}



function fetchRunner(){
    fetchAlphavantage()
    retrieveCompanyName()
    //fetchNews()
    //fetchSocial()
}

function watch_submit(){
    console.log("watching submit button")
    $(".js-search-form").submit(event=>{
        event.preventDefault()
         /* Update global var stock_symbol */
        stock_symbol = $("#js-stock-search").val()
        stock_symbol= stock_symbol.toUpperCase()
        console.log(stock_symbol)
        /* Clearing search bar */
        $("#js-stock-search").val("")
        fetchRunner()
    })
}
function ready_fx(){
    console.log("Ready to watch some functions")
    watch_submit()
    getDateString()
}
$(ready_fx)