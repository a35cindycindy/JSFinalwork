// console.log('hello');
// console.log(api_path,token);
const productList = document.querySelector('.productWrap');
const cartList = document.querySelector('.shoppingCart-tableList');
let productData =[];
let cartData = [];

function init(){
    getProductList();
    getCartList();
}
init(); 

//引入產品清單
function getProductList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function(response){
       productData = response.data.products;
       renderProductList();

    })
};

//渲染產品清單-卡片設定參數
function combineProductionHTMLItem(item) {
    return  `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}" alt="">
                <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
                <p class="nowPrice">NT$${toThousands(item.price)}</p>
              </li>`
}

//渲染產品清單-渲染畫面
function renderProductList(){
       let str = "";
       productData.forEach(item => {
        str+= combineProductionHTMLItem(item);
       });
       productList.innerHTML=str;
}

//監聽下拉選單
const productSelect =document.querySelector('.productSelect');
productSelect.addEventListener('change',function(e){
    const category = e.target.value;
    if (category == "全部"){
        renderProductList();
        return;
    }
    let str = "";
    productData.forEach(item => {
        if(item.category == category){
            str+= combineProductionHTMLItem(item);
        }
    })
    productList.innerHTML=str;
})

//加入購物車按鈕
productList.addEventListener("click",function(e){
    e.preventDefault();
    let addCartClass =e.target.getAttribute('class');
    if(addCartClass!=="addCardBtn"){
        return;
    }
    let productId= e.target.getAttribute('data-id');

    let numCheck =1;
    cartData.forEach(item => {
        if(item.product.id===productId){
            numCheck = item.quantity+=1;

        }
        
    })
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
            "productId": productId,
            "quantity": numCheck
        }
    }).then(function(response){
        alert('加入購物車');
        getCartList();
    })

})


//購物車清單
function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        document.querySelector(".js-total").textContent=toThousands(response.data.finalTotal);
        cartData = response.data.carts;
       let str = "";
       cartData.forEach(function(item){
        str +=`
                    <tr>
                        <td>
                            <div class="cardItem-title">
                                <img src="${item.product.images}" alt="">
                                <p>${item.product.title}</p>
                            </div>
                        </td>
                        <td>NT$${toThousands(item.product.price)}</td>
                        <td>${item.quantity}</td>
                        <td>NT$${toThousands(item.product.price*item.quantity)}</td>
                        <td class="discardBtn">
                            <a href="#" class="material-icons" data-id="${item.id}">
                                clear
                            </a>
                        </td>
                    </tr>
        `
        
       });
       
       cartList.innerHTML = str;

    })
}

//刪除單筆購物車
cartList.addEventListener('click',function(e){
    e.preventDefault();
    const cartId=e.target.getAttribute("data-id");
    if(cartId==null){
        alert("你點到其他東西了")
        return;
    }
    console.log(cartId);
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function(response){
         alert("刪除單筆購物車成功");
         getCartList();
    })
})

//刪除購物車全部品項
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
         alert("刪除全部購物車成功");
         getCartList();
    })
    .catch(function(response){
         alert("購物車已清空，請勿重新點擊");
         getCartList();
    })
})

//送出訂單
const orderInfobtn = document.querySelector('.orderInfo-btn');
orderInfobtn.addEventListener('click',function(e){
    e.preventDefault();
    if(cartData.length==0){
        alert("請加入購物車")
        return;
    }
    const customerName = document.querySelector('#customerName').value;
    const customerPhone = document.querySelector('#customerPhone').value;
    const customerEmail = document.querySelector('#customerEmail').value;
    const customerAddress = document.querySelector('#customerAddress').value;
    const tradeWay = document.querySelector('#tradeWay').value;
    if(customerName ==""||customerPhone ==""||customerEmail  ==""||customerAddress ==""||tradeWay  =="" ){
        alert("請輸入訂單資訊")
        return;
    }
    if (validateEmail(customerEmail)==false){
    alert("請填寫正確的Email");
    return;
    }
    if (validatePhone(customerPhone)==false){
    alert("請填寫正確的電話號碼");
    return;
    }
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
    "data": {
        "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": tradeWay
        }
    }
    })
    .then(function(response){
         alert("訂單建立成功");
        document.querySelector('#customerName').value="";
        document.querySelector('#customerPhone').value="";
        document.querySelector('#customerEmail').value="";
        document.querySelector('#customerAddress').value="";
        document.querySelector('#tradeWay').value="ATM";        
         getCartList();
    })
})

//千分位調整
function toThousands(x){
    let parts =x.toString().split(".");
    parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");
    return parts.join(".");
}

//email驗證
function validateEmail(mail) {
  if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
    return true
  }
  return false;
}

//電話驗證
function validatePhone(phone) {
  if (/^[09]{2}\d{8}$/.test(phone)) {
    return true
  }
  return false;
}