const popularRecipieDiv=document.getElementById('popular');
//console.log(popIDArr);
const carousel=document.getElementById("carousel");
const imgDiv=document.createElement("div");
function imageTemplate(){
    const img=document.createElement('img');
    img.classList.add('w-1/2');
    img.classList.add('absolute');
    img.classList.add('top-0');
    img.classList.add('image');
    return img;
}
let img=[];
let l=-33.33;
crrImgArr.forEach((i,ind)=>{
    img[ind+1]=imageTemplate();
    img[ind+1].src=`${i}`;
    img[ind+1].style.left=`${l}%`;
    img[ind+1].style.transition="left 2s";
    l+=58.33;
    const imgDiv=document.createElement("div");
    imgDiv.appendChild(img[ind+1]);
    carousel.appendChild(imgDiv);

})
let indices=[];
for(let i=3;i<3+crrImgArr.length;i++){
    indices.push(i);
}
let last=58.33*(indices.length-1)-33.33;
function shiftLeft(){
    carousel.childNodes[indices[indices.length-2]].childNodes[0].style.visibility = "visible";
    carousel.childNodes[indices[indices.length-1]].childNodes[0].style.visibility = "hidden";
    carousel.childNodes[indices[indices.length-1]].childNodes[0].style.left=`${last}%`;
    indices.forEach((i)=>{
        let st=carousel.childNodes[i].childNodes[0].style.left;
        let l=Number(st.slice(0,st.length-1));
        l-=58.33;
        carousel.childNodes[i].childNodes[0].style.left=`${l}%`;
    })
    temp=indices[0];
    for(let i=0;i<indices.length-1;i++){
        indices[i]=indices[i+1];
    }
    indices[indices.length-1]=temp;
}
let timerId;
function startTimer(){
    timerId=window.setInterval(()=>{
        shiftLeft();
    },4000);
}
function endTimer(){
    clearInterval(timerId);
}
startTimer();
carousel.addEventListener('mouseenter',endTimer);
carousel.addEventListener('mouseleave',startTimer);