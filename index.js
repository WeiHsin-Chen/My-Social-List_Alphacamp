//設定變數
//URL變數
const base_URL = 'https://lighthouse-user-api.herokuapp.com'
const index_URL = base_URL + '/api/v1/users/'
// user變數
const userlist = document.querySelector('#userlist')
const users = []
//search 變數
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
let filterMode = 'notFiltered'
let keywordFilteredUsers = []
let genderFilteredUsers = []

//pagination 變數
const pagination = document.querySelector('#paginator')
const users_Qty_PerPage = 15

//filter gender 變數
const filterGroup = document.querySelector('#filterGroup')
const filterMale = document.querySelector('#filterMale')
const filterFemale = document.querySelector('#filterFemale')

//連結API，抓user資料
axios.get(index_URL)
  .then((response) => {
    users.push(...response.data.results)
    renderUserList(getUserByPage(1))
    renderPagination(users.length)
  })


//設定function 
//Function for Render user list
function renderUserList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
    <div class="card m-2" style="width: 12rem;">
      <img src="${item.avatar}" class="card-img-top" data-id="${item.id}" alt="UserAvatatar">
      <div class="card-body">
        <h6 class="card-title text-center">${item.name + " " + item.surname}</h6>
          <button class="btn btn-primary btn-show-details" data-toggle="modal"
            data-target="#user-modal" data-id="${item.id}">Secrets</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </div>
    </div>
    `
  })
  userlist.innerHTML = rawHTML
}

//Function for Madal
//點擊Secrets產生Modal
function clickShowDetails(id) {
  const modalTitle = document.querySelector('.modal-title')
  const modalImg = document.querySelector('.modal-avatar')
  const modalDescription = document.querySelector('.modal-description')

  axios.get(index_URL + id)
    .then((response) => {
      const userid = response.data
      modalTitle.innerText = userid.name + " " + userid.surname
      modalImg.innerHTML = `<img src="${userid.avatar}" alt="user-avatar" id="modal-avatar" class="img-fluid">`
      modalDescription.innerHTML = `<p>Gender： ${userid.gender}</p> <p>Region： ${userid.region}</p> <p>Email： ${userid.email}
        <a class="social-media-link" href="mailto: ${userid.email}">
          <i class="fas fa-envelope fa-lg"></i>
        </a>
        </p>
      `
    })
}

//點選+號，加到我的最愛
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = users.find(user => user.id === id)
  if (list.some((user) => user.id === id)) {
    return alert('You only can love him/her once.')
  }
  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

//Function for Pagination 
//Render Pagination
function renderPagination(userquantity) {
  const pageQty = Math.ceil(userquantity / users_Qty_PerPage)
  let pageHTML = ''
  for (let page = 1; page <= pageQty; page++) {
    pageHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}"> ${page} </a></li>
    `
  }
  pagination.innerHTML = pageHTML
}
//Pagination 各分頁顯示資料設定
function getUserByPage(page) {
  // const userData = filteredUsers.length ? filteredUsers : users  //如果filteredUsers.length有值的話，回應為true => 帶入filteredUsers資料；反之為false => 帶入users資料
  let userData = []
  if (filterMode === 'keywordFiltered') {
    userData = keywordFilteredUsers
  }
  else if (filterMode === 'genderFiltered') {
    userData = genderFilteredUsers
  }
  else {
    userData = users
  }
  const startIndex = (page - 1) * users_Qty_PerPage
  return userData.slice(startIndex, startIndex + users_Qty_PerPage)
}
//Function for Filter Gender
function filterUserGender(gender) {
  if (filterMode === 'keywordFiltered') {
    console.log(filterMode)
    genderFilteredUsers = keywordFilteredUsers.filter(user => user.gender === gender) //搜尋keywordUsers.gender為male的filteredUsers清單
  }
  else if (filterMode === 'genderFiltered') {
    console.log(filterMode)
    genderFilteredUsers = genderFilteredUsers.filter(user => user.gender === gender) //搜尋genderUsers.gender為male的user清單
  }
  else {
    console.log(filterMode)
    genderFilteredUsers = users.filter(user => user.gender === gender) //搜尋user.gender為male的user清單
  }
  if (genderFilteredUsers.length === 0) {
    filterMode = 'notFiltered'
    renderUserList(getUserByPage(1))
    renderPagination(users.length)
    return alert('Cannot find users with gender：' + gender)
  }
  filterMode = 'genderFiltered'
  renderPagination(genderFilteredUsers.length)
  renderUserList(getUserByPage(1))
}

//設定監聽器
//Modal、Favorite 監聽器
userlist.addEventListener('click', function onUserClick(event) {
  if (event.target.matches('.btn-show-details')) {
    clickShowDetails(event.target.dataset.id)
  }
  else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//Filter 監聽器
searchForm.addEventListener('submit', function searchSubmit(event) {
  event.preventDefault()
  let searchWords = searchInput.value.trim().toLowerCase() //1. 刪除空白, 2. 字母都改為小寫(讓搜尋不分大小寫)
  if (filterMode === 'genderFiltered') {
    console.log(filterMode)
    keywordFilteredUsers = genderFilteredUsers.filter(user => user.name.toLowerCase().includes(searchWords))//搜尋genderUsers.name裡含searchWords的user清單
  }
  else if (filterMode === 'keywordFiltered') {
    console.log(filterMode)
    keywordFilteredUsers = keywordFilteredUsers.filter(user => user.name.toLowerCase().includes(searchWords)) //搜尋keywordUsers.name裡含searchWords的user清單
  }
  else {
    console.log(filterMode)
    keywordFilteredUsers = users.filter(user => user.name.toLowerCase().includes(searchWords)) //搜尋user.name裡含searchWords的user清單
  }
  if (keywordFilteredUsers.length === 0) {
    filterMode = 'notFiltered'
    renderUserList(getUserByPage(1))
    renderPagination(users.length)
    return alert('Cannot find users with Key Words：' + searchWords)
  }
  filterMode = 'keywordFiltered'
  renderPagination(keywordFilteredUsers.length)
  renderUserList(getUserByPage(1))
})

//Filter Male/Female 監聽器
filterGroup.addEventListener('click', function filterGenderUsers(event) {
  const filterGender = event.target.id
  if (filterGender === 'filterMale') {
    filterUserGender('male')
  }
  else if (filterGender === 'filterFemale') {
    filterUserGender('female')
  }
})

//Pagination 監聽器
pagination.addEventListener('click', function onPaginatorClicked(event) {
  const page = event.target.dataset.page
  renderUserList(getUserByPage(page))
})


//以後有時間可以思考，分頁限定為五個，有上一頁下一頁