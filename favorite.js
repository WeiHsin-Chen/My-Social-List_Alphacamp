//設定變數
//URL變數
const base_URL = 'https://lighthouse-user-api.herokuapp.com'
const index_URL = base_URL + '/api/v1/users/'
//User變數
const userlist = document.querySelector('#userlist')
const users = JSON.parse(localStorage.getItem('favoriteUsers'))
//search 變數
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
let filteredUsers = []
//pagination 變數
const pagination = document.querySelector('#paginator')
const users_Qty_PerPage = 15

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
            data-target="#user-modal" data-id="${item.id}"> Secrets </button>
          <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}"> X </button>
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


//Function for remove favorite
function removeFavorite(id) {
  const removeUserIndex = users.findIndex(user => user.id === id)
  users.splice(removeUserIndex, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(users))
  renderUserList(users)
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
  const userData = filteredUsers.length ? filteredUsers : users  //如果filteredUsers.length有值的話，回應為true => 帶入filteredUsers資料；反之為false => 帶入users資料
  const startIndex = (page - 1) * users_Qty_PerPage
  return userData.slice(startIndex, startIndex + users_Qty_PerPage)
}

//設定監聽器
//Modal、Favorite 監聽器
userlist.addEventListener('click', function onUserClick(event) {
  if (event.target.matches('.btn-show-details')) {
    clickShowDetails(event.target.dataset.id)
  }
  else if (event.target.matches('.btn-remove-favorite')) {
    removeFavorite(Number(event.target.dataset.id))
  }
})

//Search 監聽器
searchForm.addEventListener('submit', function searchSubmit(event) {
  event.preventDefault()
  let searchWords = searchInput.value.trim().toLowerCase() //1. 刪除空白, 2. 字母都改為小寫(讓搜尋不分大小寫)
  filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchWords)) //搜尋user.name裡含searchWords的user清單
  if (filteredUsers.length === 0) {
    return alert('Cannot find users with Key Words：' + searchWords)
  }
  renderUserList(getUserByPage(1))
  renderPagination(filteredUsers.length)
})

//Pagination 監聽器
pagination.addEventListener('click', function onPaginatorClicked(event) {
  const page = event.target.dataset.page
  renderUserList(getUserByPage(page))
})

renderUserList(getUserByPage(1))
renderPagination(users.length)

