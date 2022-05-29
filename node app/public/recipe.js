const ratingDiv=document.getElementById("starRating");
console.log(ratingDiv.childNodes);
for(let i=0;i<recipeRating;i++){
    ratingDiv.childNodes[2*i+1].classList.toggle("text-gray-300");
    ratingDiv.childNodes[2*i+1].classList.toggle("text-yellow-400");
}