const key = 'e70e8a97'

const moviesList = document.querySelector('#movies-list')
const searchInput = document.querySelector('#search-input')
const basketContent = document.querySelector('.basket-content')
const basketCounter = document.querySelector("#basket-counter")

let lastSearchQuery = null
let count = 0

const counter = (count) => count === 0 ? basketCounter.textContent = '' : basketCounter.textContent = count
const nameMovieUrl = (name, url = `https://www.omdbapi.com/?apikey=${key}&`) => `${url}s=${name}`

const getData = (url) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (!data || !data.Search) throw ('The server returned incorrect data')
      return data.Search
    })

const debounceTime = (() => {
  let timer = null
  return (cb, ms) => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    timer = setTimeout(cb, ms)
  }
})()


const createCardMovies = ({ Poster: poster, Title: title, Year: year, imdbID }) => {
  const movie = document.createElement('div')
  const overlay = document.createElement('div')

  movie.classList.add('movie')
  movie.dataset.imdbId = imdbID

  if (/^https\:\/\/[\s\S]+/.test(poster)) {
    const img = document.createElement('img')
    img.classList.add('movie__img')
    img.src = poster
    img.alt = `${title} ${year}`
    img.title = `${title} ${year}`
    movie.append(img)
  }

  overlay.classList.add('movie-overlay')
  overlay.innerHTML = `<h5 class="movie__title" data-name="title">${title}</h5>
    <span class="movie-add-btn fa-solid fa-heart"></span>
    <span class="movie__year" data-name="year">${year}</span>`

  movie.append(overlay)
  moviesList.append(movie)
}



const inputSearchHendler = (e) => {
  debounceTime(() => {
    const searchQuery = e.target.value.trim()
    if (!searchQuery || searchQuery.length < 4 || searchQuery === lastSearchQuery) return

    getData(nameMovieUrl(searchQuery))
      .then((movies) => movies.forEach((movie) => createCardMovies(movie)))
      .catch((err) => moviesList.innerHTML = err)

    lastSearchQuery = searchQuery
    moviesList.innerHTML = ''
  }, 1500)
}

const addToBasket = (movie) => {
  const basketMovie = document.createElement('div')
  const movieImg = movie.querySelector('.movie__img')
  const movieTitle = movie.querySelector('[data-name="title"]')
  const movieYear = movie.querySelector('[data-name="year"]')

  const dataMovie = {
    srcImage: movieImg ? movieImg.getAttribute('src') : null,
    title: movieTitle.textContent,
    year: movieYear.textContent,
  }

  movie.classList.toggle('active')
  basketMovie.dataset.imdbId = movie.dataset.imdbId
  basketMovie.classList.add('movie-basket')

  basketMovie.innerHTML = `${movieImg
    ? `<img src="${dataMovie.srcImage}" class="movie-basket__img">`
    : '<span class="movie-basket__img"><i class="fa-solid fa-image"></i></span>'}
    <p class="movie-basket__title" > ${dataMovie.title} <span>(${dataMovie.year})</span></p>
    <span class="movie-basket__del fa-solid fa-trash-can"></span>
  `
  basketContent.append(basketMovie)
  counter(++count)
}

const removeOutsideBasket = (movie) => {
  movie.classList.toggle('active')
  const imdbId = movie.dataset.imdbId
  const movieBasket = document.querySelector(`.movie-basket[data-imdb-id=${imdbId}]`)
  movieBasket.remove()
  counter(--count)
}

const removeFromBasket = (movieBasket) => {
  const imdbId = movieBasket.dataset.imdbId
  const movie = document.querySelector(`.movie[data-imdb-id= ${imdbId}]`)
  movie && movie.classList.toggle('active')
  movieBasket.remove()
  counter(--count)
}

const addOrRemoveMovie = (movie) => movie.classList.contains('active') ? removeOutsideBasket(movie) : addToBasket(movie)

const initListener = (e) => {
  const { target } = e
  target.classList.contains('movie-add-btn') && addOrRemoveMovie(target.closest('.movie'))
  target.classList.contains('movie-basket__del') && removeFromBasket(target.closest('.movie-basket'))
}

searchInput.addEventListener('input', inputSearchHendler)
document.addEventListener('click', initListener)

