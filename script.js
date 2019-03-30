"use strict";
let stock_symbol = ""
let company_name = ""
let form_query = "" //this is what the user input is converted to urlencoding.
let form_search = "" //this is what the user is searching
const alphavantage_api_key ="P1IPHWHQ7R3CIHDT"
const twitter_bearer = "AAAAAAAAAAAAAAAAAAAAAESX9gAAAAAAMaY%2FkPLVr%2FVvbVtKXy%2Brvce3SIk%3DP4Vw1WrkLpL6FwB3K9Uqg0nGK6lY48jNZz7ssdfsqBUTktC8Wb"
let date_string = ""
const newsApiKey = "c34722c63a774c9aa4706225014f9411"
const today = new Date();
const dd = today.getDate();
const mm = today.getMonth(); //January is 0!
const yyyy = today.getFullYear();
let continueSearch = true

function getDateString(){
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth(); //January is 0!
    const yyyy = today.getFullYear();
    const months =["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    date_string = `${months[mm]} ${dd},${yyyy}`
}
function updateNumbers(myJson){
    const my_arr_dates = Object.keys(myJson["Time Series (Daily)"])
    const my_prices_obj = myJson["Time Series (Daily)"]
    
    const past100_startday = my_arr_dates[99]
    const past100_openprice= Math.round(my_prices_obj[my_arr_dates[99]]["1. open"]*100)/100
    const past100_lastday = my_arr_dates[0]
    const past100_closeprice= Math.round(my_prices_obj[my_arr_dates[0]]["4. close"]*100)/100
    const past100_pctchange= Math.round((past100_closeprice - past100_openprice)/past100_openprice * 100*1000)/1000
    const past100_value= Math.round((10000 * (past100_closeprice - past100_openprice)/past100_openprice +10000) *100)/100

    $(".past100-startday").text(past100_startday)
    $(".past100-openprice").text(`$${past100_openprice}`)
    $(".past100-lastday").text(past100_lastday)
    $(".past100-closeprice").text(`$${past100_closeprice}`)
    $(".past100-pctchange").text(`%${past100_pctchange}`)
    $(".past100-value").text(`$${past100_value}`)
    $(".past100-header").text(`Past 100 trading days for ${stock_symbol}`)
}
function updateHomeNumbers(myJson){
    const my_arr_dates = Object.keys(myJson["Time Series (Daily)"])
    const my_prices_obj = myJson["Time Series (Daily)"]
    const open = Math.round(my_prices_obj[my_arr_dates[0]]["1. open"] *100)/100
    const close = Math.round(my_prices_obj[my_arr_dates[0]]["4. close"] *100)/100
    const pct_change = Math.round((close-open)/open*100*1000)/1000
    $(".home-open").text(`$${open}`)
    $(".home-close").text(`$${close}`)
    $(".home-pct").text(`%${pct_change}`)
    $(".home-header").text(`${stock_symbol} pulled on ${date_string}`)
}
function retrieveCompanyName(){
    const base_url =`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${form_query}&apikey=${alphavantage_api_key}`
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
            if (responseJson["bestMatches"].length <1){
                continueSearch = false
                console.log(form_query,stock_symbol,company_name,continueSearch,responseJson["bestMatches"].length)
            }
            else {
                company_name = responseJson["bestMatches"][0]["2. name"]
                stock_symbol = responseJson["bestMatches"][0]["1. symbol"]
                continueSearch = true
                console.log(form_query,stock_symbol,company_name,continueSearch,responseJson["bestMatches"].length)
            }
        }
    ).catch(err=>{
        console.log(err)
    })
}
function gatherGraphData(myJson){
    let my_arr_dates = Object.keys(myJson["Time Series (Daily)"])
    const my_prices_obj = myJson["Time Series (Daily)"]
    let my_arr_prices = my_arr_dates.map( indexDate=> Math.round(my_prices_obj[indexDate]["4. close"]*100)/100 )
    //Note data arranged here will be from newest to oldest 
    my_arr_dates.reverse()
    my_arr_prices.reverse()
    let data = []
    const parseTime = d3.timeParse("%Y-%m-%d")
    for (let i =0; i <my_arr_dates.length; i++ ){
        data.push({
            "dateParsed":parseTime(my_arr_dates[i]),
            "price":my_arr_prices[i],
            "date":my_arr_dates[i]
        })
    }
    //arrays are reversed to reflect oldest to newest
    graphData(data,my_arr_dates,my_arr_prices)
}
function graphData(data,my_arr_dates,my_arr_prices){
    $("svg").empty()
    console.log(data)
    //style our svg element.
    let svgWidth = 600, svgHeight = 400;
    let margin = { top: 20, right: 20, bottom: 30, left: 50 };
    let width = svgWidth - margin.left - margin.right;
    let height = svgHeight - margin.top - margin.bottom;
    //select the svg elemnt with a d3 wrapper and attach stylings
    let svg = d3.select('svg')
      .attr("width", svgWidth)
      .attr("height", svgHeight)
    
    //create main group element svg->g
    let g = svg.append("g")
            .attr("transform",`translate(${margin.left},${margin.top})`)
    
    //creating axis variables
    let x = d3.scaleTime().rangeRound([0, width]);
    let y = d3.scaleLinear().rangeRound([height, 0]);  
    x.domain(d3.extent(data, function(d) { return d.dateParsed })); 
    y.domain(d3.extent(data, function(d) { return d.price }));

    //create a line function to be our line generator. 
    var line = d3.line()
               .x(function(d) {return x(d.dateParsed)})
               .y(function(d) {return y(d.price)})
    /* We will now be adding 2 group elements and a path to our main group element
    1. group element 1 - bottom axis (x)
    2. group element 2 - left axis (y)
    3. path create our line element using our line generator and the dataset we are using.
     */
    
    /*recall that in computers the y=0 starts at the top. since we have already 
    moved it down by the top margin now we just need to move it down by the height 
    of the graph to start at bottom */
    g.append("g")
     .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x))
     .select(".domain")
     .remove();

    g.append("g")
     .call(d3.axisLeft(y))
     .append("text") // all the attributes below will refer to the label 
     .attr("fill", "#000") // color
     .attr("transform", "rotate(-90)") // have label rotated 
     .attr("y", 6) //move along its own y axis
     .attr("dy", "0.71em")
     .attr("text-anchor", "end")
     .text("Price ($)")
    
    g.append("path")
     .datum(data)
     .attr("fill", "none")
     .attr("stroke", "steelblue")
     .attr("stroke-linejoin", "round")
     .attr("stroke-linecap", "round")
     .attr("stroke-width", 1.5)
     .attr("d", line);
}
function fetchAlphavantage(){
    //console.log(`Attempting to pull ${stock_symbol} by the numbers`)
    const past100DaysUrl= `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${stock_symbol}&apikey=${alphavantage_api_key}`
    fetch(past100DaysUrl).then(response=>{
        if (response.ok){
            return response.json()
        }
        else{
            throw new Error(response.statusText)
        }
    }).then(
        responseJson =>{
            //console.log(responseJson)
            updateNumbers(responseJson)
            updateHomeNumbers(responseJson)
            gatherGraphData(responseJson)
        }
    ).catch(err=>
        console.log(err)
    )
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
function fetchSocial(){
    //console.log(`Attempting to pull ${stock_symbol} on social`)
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

function updateNews(responseJson){
    $(".news-section-ul").empty()
    const top_10_news = responseJson["articles"].slice(0,10)
    //console.log(top_10_news)
    for (let i = 0; i<top_10_news.length; i++){
        $(".news-section-ul").append(`
        <li>
        <h4>${top_10_news[i].title}<span>- From- ${top_10_news[i]["source"]["name"]}</span></h4>
        <p>${top_10_news[i].description}</p>
        <a href="${top_10_news[i].url}" target="_blank" >Full article</a>
        </li>
        `)
    }
}

function updateHomeNews(responseJson){
    $(".home-news-ul").empty()
    $(".news-title").text(`Top Headlines for ${company_name} on ${date_string}`)
    const top3_news = responseJson["articles"].slice(0,2)
    //console.log(top3_news)
    for (let i =0 ; i< top3_news.length ; i++){
        $(".home-news-ul").append(`
        <li>
        <h5>${top3_news[i].title}<span>- From- ${top3_news[i]["source"]["name"]}</span></h5>
        <p>${top3_news[i].description}</p>
        <a href="${top3_news[i].url}" target="_blank" >Full article</a>
        </li>
        `)
    }
    $(".js-home-section").removeClass("hide-me")
    $(".js-navigation").removeClass("hide-me")
}

function updateError(){
    $(".search-error").html(`We could not locate a company name or stock ticker matching your search => <strong>${form_search}</strong>. Please try again!`)
}

function fetchNews(){
    //console.log(`Attempting to pull ${company_name} for news`)
    const base_url ="https://newsapi.org/v2/everything"
    const params = {
        "q":encodeURIComponent(company_name+" Company"),
        "apiKey":newsApiKey,
        "language":"en",
        "sortBy":"relevancy",
        "from":`${yyyy}-${mm+1}-${dd}`
    }
    const query_url = urlExtend(base_url,params)
    //console.log(query_url)
    fetch(query_url).then(response=>{
        if (response.ok){
            return response.json()
        }
        throw new Error(response.statusText)
    }).then(
        responseJson=>{
            updateHomeNews(responseJson)
            updateNews(responseJson)
        }
    ).catch(err=>console.log(err))
}

function fetchRunner(){
    retrieveCompanyName()
    setTimeout(function(){
        if (continueSearch===true){
            fetchAlphavantage()
            fetchNews()
        }
        else {
            updateError()
        }
    },600);
    setTimeout(function(){
        if (continueSearch===true){
            navigate(".js-home-section")
        } else {
            navigate(".js-error-section")
        }
    },900);
}

function navigate(itemToDisplay){
    const listOfPannels = [".js-home-section",".js-numbers-section",".js-news-section",".js-error-section"]
    for (let i=0;i<listOfPannels.length;i++){
        if (listOfPannels[i] !=itemToDisplay){
            //not the item I would like to display
            if ($(listOfPannels[i]).hasClass("hide-me") === false){
                //make sure item has the hide-me class
                $(listOfPannels[i]).addClass("hide-me")
            }
        }else{
            //this is the item I would like to display
            if ($(listOfPannels[i]).hasClass("hide-me")){
                //make sure this is visible
                $(listOfPannels[i]).removeClass("hide-me")
            }
        }
    }
}
function watchNavigation(){
    //console.log("watching navigation")
    $(".js-navigate-home").click(event=>{
        event.preventDefault()
        console.log("home clicked")
        navigate(".js-home-section")
    })
    $(".js-navigate-numbers").click(event=>{
        event.preventDefault()
        console.log("numbers clicked")
        navigate(".js-numbers-section")
    })
    $(".js-navigate-news").click(event=>{
        event.preventDefault()
        console.log("news clicked")
        navigate(".js-news-section")
    })
}
function watch_submit(){
    //console.log("watching submit button")
    $(".js-search-form").submit(event=>{
        event.preventDefault()
         /* Update global var stock_symbol */
        form_search = $("#js-stock-search").val()
        form_query = encodeURIComponent($("#js-stock-search").val())
        form_query= form_query.toUpperCase()
        //console.log(stock_symbol)
        /* Clearing search bar */
        $("#js-stock-search").val("") 
        fetchRunner()       
    })
}

function ready_fx(){
    console.log("Ready to watch some functions")
    watch_submit()
    watchNavigation()
    getDateString()
}
$(ready_fx)