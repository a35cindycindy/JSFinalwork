let orderData =[];
const orderList = document.querySelector('.js-orderList');
function init() {
    getOrderList();
}
init();

function renderCateC3() {
    //訂單資料蒐集
    let total = {};
    orderData.forEach(item => {
        item.products.forEach(productItem=>{
            if(total[productItem.category]==undefined){
                total[productItem.category]=productItem.price*productItem.quantity;
            }else{
            total[productItem.category]+=productItem.price*productItem.quantity;
        }
        })

        
    });
    let categoryAry = Object.keys(total);
    let newData=[];
    categoryAry.forEach(item=>{
        let ary=[];
        ary.push(item);
        ary.push(total[item]);
        newData.push(ary);
    })
    // console.log(newData);


    c3.generate({
    bindto: '#chartCate', // HTML 元素綁定
    data: {
        type: "pie",
        columns: newData,
    },
    color: {
      pattern: ["#5434A7", "#9D7FEA", "#DACBFF"]
    }
});
    
} ;


function renderTitleC3() {
//資料關聯
    let obj = {};
    orderData.forEach(item => {
        item.products.forEach(productItem=>{
            if(obj[productItem.title]==undefined){
                obj[productItem.title]=productItem.price*productItem.quantity;
            }else{
            obj[productItem.title]+=productItem.price*productItem.quantity;
        }
        })

        
    });


    let originAry = Object.keys(obj);
    // console.log(originAry );
    let rankSortAry=[];

    originAry.forEach(item => {
        let ary = [];
        ary.push(item);
        ary.push(obj[item]);
        rankSortAry.push(ary);
        
    });


    rankSortAry.sort((a,b)=> {
        return b[1]-a[1];
    })

    if(rankSortAry.length> 3){
        let otherTotal = 0;
        rankSortAry.forEach((item,index) => {
            if(index>2){
                otherTotal += rankSortAry[index][1];
            }
        });
        rankSortAry.splice(3, rankSortAry.length-1);
        rankSortAry.push(['其他',otherTotal]);
    }
    c3.generate({
    bindto: '#chartTitle', // HTML 元素綁定
    data: {
        type: "pie",
        columns: rankSortAry,
    },
        color: {
      pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"]
    }
    });
}





//拿到後台訂單API並渲染訂單內容
function getOrderList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(response){
        orderData =response.data.orders;
        let str ='';
        orderData.forEach(item=> {
            //組時間字串
            const timeStamp = new Date(item.createdAt*1000);
            const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;

            //組產品字串
            let productStr ="";
            item.products.forEach(productItem => {
                productStr+=`<p>${productItem.title}x${productItem.quantity}</p>`
            });
            //判斷訂單處理狀態
            let orserState ="";
            if(item.paid == true){
                orserState="已處理"
            }else{
                orserState="未處理"
            }


            str+=`
                <tr>
                    <td>${item.id}</td>
                    <td>
                      <p>${item.user.name}</p>
                      <p>${item.user.tel}</p>
                    </td>
                    <td>${item.user.address}</td>
                    <td>${item.user.email}</td>
                    <td>
                      ${productStr}
                    </td>
                    <td>${orderTime}</td>
                    <td class="js-orderStatus">
                      <a href="#" data-status ="${item.paid}" class="orderStatus" data-id="${item.id}" >${orserState}</a>
                    </td>
                    <td>
                      <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
                    </td>
                </tr>
            `
        });
        orderList.innerHTML = str;
        renderCateC3();
        renderTitleC3()

    })
}


//監聽訂單狀態跟刪除按鈕
orderList.addEventListener('click',function(e){
    e.preventDefault();
    const targetClass=e.target.getAttribute("class");
    let id =e.target.getAttribute("data-id");
    if (targetClass =='delSingleOrder-Btn js-orderDelete'){
        deleteOrderItem(id)
        return;
    }

    if (targetClass =='orderStatus'){
        // alert("你點到訂單狀態")
        let status =e.target.getAttribute("data-status");
        changeOrderStatus(status,id);
        return;
    }    

})


//訂單狀態按鈕
function changeOrderStatus(status,id){
    let newStatus;
    if(status==true){
        newStatus = false;
    }else{
        newStatus = true;
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
          "data": {
            "id": id,
            "paid": newStatus
        }
    },{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(response){ 
        alert("修改訂單成功")
        getOrderList();

    })   
}


//刪除按鈕
function deleteOrderItem(id){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(response){ 
        alert("刪除此筆訂單成功")
        getOrderList();

    })   
}


//刪除全部按鈕
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(response){ 
        alert("刪除全部訂單成功")
        getOrderList();

    })   
})

