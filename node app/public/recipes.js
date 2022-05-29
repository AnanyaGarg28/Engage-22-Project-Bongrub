const headings=[
    ['Breakfast', 'Vegetable', 'Lunch/Snacks', 'Dessert', 'Beverages', 'Breads'],
    ['One Dish Meal', 'Cheese', '< 15 Mins', 'Quick Breads', 'Sauces'],
    ['Potato', 'Bar Cookie', 'Pie', 'Low Protein', 'Candy'],
    ['Meat', 'Chicken', 'Chicken Breast', 'Pork']
];
const headingDivs=[
    [document.getElementById('cat1').childNodes[1],document.getElementById('cat1').childNodes[3],document.getElementById('cat1').childNodes[5],document.getElementById('cat1').childNodes[7],document.getElementById('cat1').childNodes[9],document.getElementById('cat1').childNodes[11]],
    [document.getElementById('cat2').childNodes[1],document.getElementById('cat2').childNodes[3],document.getElementById('cat2').childNodes[5],document.getElementById('cat2').childNodes[7],document.getElementById('cat2').childNodes[9]],
    [document.getElementById('cat3').childNodes[1],document.getElementById('cat3').childNodes[3],document.getElementById('cat3').childNodes[5],document.getElementById('cat3').childNodes[7],document.getElementById('cat3').childNodes[9]],
    [document.getElementById('cat4').childNodes[1],document.getElementById('cat4').childNodes[3],document.getElementById('cat4').childNodes[5],document.getElementById('cat4').childNodes[7]]
];
const recipeDivs=[
    document.getElementById('category1'),
    document.getElementById('category2'),
    document.getElementById('category3'),
    document.getElementById('category4')
]

let currCatList=[0,0,0,0];
currCatList.forEach((i,ind)=>{
    headingDivs[ind][i].classList.add('bg-orange-100');
});
async function getCategoryList(cat){
    const data={
        category: cat
    };
    let resList= await fetch("/category", {
        method: "POST",
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify(data)
    }).then(response => {
        return response.json();
    }).then((res)=>{
        return res.resultArr;
    });
    return resList;
};
function listToDiv(list, div){
    list.forEach((r)=>{
        let divi=document.createElement('div');
        divi.innerHTML=`<a href="/recipe?id=${r.id}" class="transition duration-150 ease-in-out transform hover:scale-105">
                <div class="mx-8 my-2">
                    <img src="${r.img[0]}" alt="" class="mb-4 h-60">
                    <div class="text-2xl font-normal my-4">${r.name}</div>
                    <div class="bg-gray-400 h-0.5"></div>
                    <div class="font-light my-4 flex">
                        <span class="flex-none"><i class="fa-solid fa-clock"></i> ${r.time.slice(2).replace("H"," Hour ").replace("M"," Minutes")}</span>
                        <span class="flex-auto text-right">${r.category}</span>
                    </div>
                    <div class="bg-gray-400 h-0.5 mb-4"></div>
                </div>
            </a>`;
        div.appendChild(divi.firstChild);
    })
}
function highlightHeadings(i,j){
    headingDivs[i][currCatList[i]].classList.toggle('bg-orange-100');
    currCatList[i]=j;
    headingDivs[i][j].classList.add('bg-orange-100');
}
function updateRecipies(i,j){
    recipeDivs[i].innerHTML='';
    getCategoryList(headings[i][j]).then((res)=>{
        listToDiv(res,recipeDivs[i]);
    });
}
function combinedUpdateCat(i,j){
    highlightHeadings(i,j);
    updateRecipies(i,j);
}

recipeDivs.forEach((div,ind)=>{
    getCategoryList(headings[ind][currCatList[ind]]).then((res)=>{
        listToDiv(res,div);
    });
});

headingDivs.forEach((list,i)=>{
    list.forEach((div,j)=>{
        div.addEventListener('click',()=>{
            combinedUpdateCat(i,j);
        });
    });
});

const { autocomplete, getAlgoliaResults } = window['@algolia/autocomplete-js'];
const searchClient = algoliasearch('0TUJGOJ575', 'f6abb8f7052e964b3481508e5be133e8');


autocomplete({
    container: '#autocomplete',
    placeholder: 'Search for recipes',
    getSources({ query }) {
        return [
        {
            sourceId: '0TUJGOJ575',
            getItems() {
            return getAlgoliaResults({
                searchClient,
                queries: [
                {
                    indexName: 'bongrub',
                    query,
                    params: {
                    hitsPerPage: 5,
                    attributesToSnippet: ['name:10'],
                    snippetEllipsisText: '…',
                    },
                },
                ],
            });
            },
            templates: {
            item({ item, components, html }) {
                return html`
                <script src="https://cdn.tailwindcss.com"></script>  
                <a href="/recipe?id=${item.objectID}"><div class="flex">
                    <div class="flex-none">
                    <img
                        src="${item.images[0]}"
                        alt="${item.name}"
                        style="width: 5rem"
                    />
                    </div>
                    <div class="grow text-left p-4">
                        ${components.Highlight({
                        hit: item,
                        attribute: 'name',
                        })}
                    </div>
                </div></a>`;
            },
            },
        },
        ];
    },
});
function scrollToSearch(){
    const divElement=document.getElementById('search');
    console.log(divElement);
    divElement.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
}
if(search=='true') scrollToSearch();