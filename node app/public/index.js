const toggleButton=document.getElementById('toggle-button');
const toggleElements=document.querySelectorAll('.toggle');
toggleButton.addEventListener('click',()=>{
    toggleElements.forEach((ele)=>{
        ele.classList.toggle('hidden');
    });
});
document.querySelector(`.${title}`).classList.toggle('transition');
document.querySelector(`.${title}`).classList.toggle('bg-orange-100');
document.querySelector(`.${title}`).classList.toggle('duration-150');
document.querySelector(`.${title}`).classList.toggle('ease-in-out');
document.querySelector(`.${title}`).classList.toggle('transform');
document.querySelector(`.${title}`).classList.toggle('hover:scale-105');