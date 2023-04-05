const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")

function renderMovieList(data) {

  let rawHTML = ''

  data.forEach((item) => {
    // title, image
    
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })

  dataPanel.innerHTML = rawHTML
  
}



function renderPaginator(amount) {

    // 80/12 = 6 ...8 =7
    const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)  //Math.ceil無條件進位
    let rawHTML = ""
    
    for (let page = 1; page <= numberOfPages; page++) {
        rawHTML += `
        <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }

    paginator.innerHTML = rawHTML
}





function getMoviesByPage(page) {

    //movies? "movies" : "filteredMovies"
    const data = filteredMovies.length ? filteredMovies : movies //如果filteredMovies是有東西的, 就給我filteredMovies; 若是空陣列, 就給我movies


    // page 1 -> movies 0-11
    // page 2 -> movies 12-23
    // page 3 -> movies 24-35

    const startIndex = (page - 1) * MOVIES_PER_PAGE

    return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
    //return movies.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}



function showMovieModal(id) {

    const modalTitle = document.querySelector("#movie-modal-title")
    const modalImage = document.querySelector("#movie-modal-image")
    const modalDate = document.querySelector("#movie-modal-date")
    const modalDescription = document.querySelector("#movie-modal-description")

    // 先將 modal 內容清空，以免出現上一個 user 的資料殘影
    modalTitle.textContent = ''
    modalImage.src = ''
    modalDate.textContent = ''
    modalDescription.textContent = ''


    axios.get(INDEX_URL + id).then(res => {
        const data = res.data.results
        modalTitle.innerText = data.title 
        modalDate.innerText = "Release date: " + data.release_date
        modalDescription.innerText = data.description
        modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })

}

function addToFavorite(id) {

    const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [] //parse轉換成物件
    // const movie = movies.find(isMovieIdMatched)

    // function isMovieIdMatched(movie) {
    //     return movie.id === id
    // }

    //可以改寫成:
    const movie = movies.find((movie) => movie.id === id) //find回傳的是元素本身, 在找到第一個符合條件的 item 後就會停下來回傳該 item

    if(list.some((movie) => movie.id === id)) { //只是想知道這個陣列倒底有沒有元素本身, 有的話true, 沒有的話false
        return alert ("Already in the favorite list.")
    }

    list.push(movie)
    //console.log(list)

    localStorage.setItem("favoriteMovies", JSON.stringify(list)) //要轉換成字串的原因是因為setItem只能放字串

    //JSON $ stringify 範例:
    // const jsonString = JSON.stringify(list)
    // console.log("json string: ", jsonString)
    // console.log("json object: ", JSON.parse(jsonString))


    // console.log(movie)
}

dataPanel.addEventListener("click", function onPanelClicked(event){
    
    if (event.target.matches(".btn-show-movie")){
        //console.log(event.target.dataset)
        showMovieModal(event.target.dataset.id)
    } else if (event.target.matches(".btn-add-favorite")) {
        addToFavorite(Number(event.target.dataset.id))
    }
})

// dataPanel.addEventListener("click", (event) => {
//     console.error("error")
// })
//若寫這個比較短的function, 如果有error, 只會告訴你是匿名函式出現的error, 但如果function有名字, 就會告訴你是哪個函式error


paginator.addEventListener ("click", function onPaginatorClicked(event){
    if (event.target.tagName !== "A" ) return   //<a></a>  

    const page = Number(event.target.dataset.page)
    renderMovieList(getMoviesByPage(page))

    //console.log(event.target.dataset.page)
})





searchForm.addEventListener("submit", function onSearchFormSubmitted (event) {
    event.preventDefault() //請瀏覽器不要做預設的動作, 將action交給JS
    //console.log(searchInput.value)
    const keyword = searchInput.value.trim().toLowerCase()
    //let filteredMovies = [] //存放搜尋完的結果 //-> 把let轉移到最上面 line 7

    filteredMovies = movies.filter((movie) => 
        movie.title.toLowerCase().includes(keyword)
    )
    
    
    
    // if (!keyword.length) {   //防止輸入空白: keywork.length === 0
    //    return alert("please enter a valid string.") 
    // }

    //陣列:map, filter, reduce
    if (filteredMovies.length === 0) {
        return alert("Cannot find movie with keyword: " + keyword)
    }

    //方法1: for-of loop
    // for (const movie of movies) {
    //     if (movie.title.toLowerCase().includes(keyword)){
    //         filteredMovies.push(movie)
    //     }
    // }

    //renderMovieList(filteredMovies) 
    renderPaginator(filteredMovies.length)
    renderMovieList(getMoviesByPage(1))
    
})





axios
    .get(INDEX_URL)
    .then((res) => {

        movies.push(...res.data.results);

        //movies.push(res.data.results); 結果會變成80個結果成為陣列第一個元素, 所以需要用推進去的push
        
        // for (const movie of res.data.results) {
        //     movies.push(movie);
        // }

        //使用 ES6 提供的新語法「展開運算子 (spread operator)」: ... 三個點點就是展開運算子，他的主要功用是「展開陣列元素」 
        //push ... 的效果跟 for 迴圈一樣 (Alpha camp 2-2 U24)

        
        // renderMovieList(movies)   //丟出全部的80部電影
        renderMovieList(getMoviesByPage(1))  //要按照頁數丟電影
        renderPaginator(movies.length)
    })

    .catch((err) => console.log(err))

// localStorage.setItem("default_language", "english") //在dev tool 的application/ local storage
// console.log(localStorage.getItem("default_language"))
// localStorage.removeItem("default_language")
// localStorage.setItem("default_language", JSON.stringify())  //若想放入的參數是陣列或是物件, 可以先轉換成JSON, 要取出時再parse轉換回去