function setupHome(c, p, a)
{
    var i = document.getElementById("images");
    
    for(f = 1; f <= c; f++)
    {
        var img = document.createElement("A");
        img.className = "img-box";
        if(p == true && a == false){
            img.style.backgroundImage = 'url("./img/'+f+'.jpg")'; 
        } else if(p == false && a == true) {
            img.style.backgroundImage = 'url("../img/'+f+'a.png")';
        } else if(p == true && a == true) {
            img.style.backgroundImage = 'url("./img/'+f+'a.png")';
        } else {
            img.style.backgroundImage = 'url("../img/'+f+'.jpg")';
        }
        
        if(p == true) {
            img.href = './image.html?img='+f;
        }
        else {
            img.href = '../image.html?img='+f;
        }
        
        i.appendChild(img);
    }
    
    var nodeList = document.getElementsByName("filter");
    var filters = [].slice.call(nodeList);
    for(j = 0; j < filters.length; j++)
    {
        filters[j].addEventListener('change', function(){
            if(this.checked)
            {
                shuffle();
            }
        });
    }
}

function setupImg(c, p, a)
{
    var imgContainer = document.getElementById("img");
    var image = document.createElement("IMG");
    image.className = "display";
    
    var urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('img')){
        var file = urlParams.get('img');
        image.src = './img/'+file+'.jpg';
        imgContainer.appendChild(image);
    }
    else{
        alert("File not found.");
    }
    
    
    
    
    var i = document.getElementById("images");
    
    for(f = 1; f <= c; f++)
    {
        var img = document.createElement("A");
        img.className = "img-box";
        if(p == true && a == false){
            img.style.backgroundImage = 'url("./img/'+f+'.jpg")'; 
        } else if(p == false && a == true) {
            img.style.backgroundImage = 'url("../img/'+f+'a.png")';
        } else if(p == true && a == true) {
            img.style.backgroundImage = 'url("./img/'+f+'a.png")';
        } else {
            img.style.backgroundImage = 'url("../img/'+f+'.jpg")';
        }
        img.href = './image.html?img='+f;
        i.appendChild(img);
    }
    
    var nodeList = document.getElementsByName("filter");
    var filters = [].slice.call(nodeList);
    for(j = 0; j < filters.length; j++)
    {
        filters[j].addEventListener('change', function(){
            if(this.checked)
            {
                shuffle();
            }
        });
    }
}


function active(e)
{
    var c = document.getElementById("pagination").childNodes;
    
    for(i = 0; i < c.length; i++)
    {
        if(c[i].className == "active")
        {
            c[i].classList.remove("active");
        }
    }
    
    e.target.classList.add("active");
    shuffle();
}

function left()
{
    var c = document.getElementById("pagination").childNodes;
    
    for(i = 0; i < c.length; i++)
    {
        if(c[i].className == "active")
        {
            c[i].classList.remove("active");
            c[i].previousElementSibling.classList.add("active");
            shuffle();
            break;
        }
    }
}

function right()
{
    var c = document.getElementById("pagination").childNodes;
    
    for(i = 0; i < c.length; i++)
    {
        if(c[i].className == "active")
        {
            c[i].classList.remove("active");
            c[i].nextElementSibling.classList.add("active");
            shuffle();
            break;
        }
    }
}

function shuffle()
{
    var parent = document.getElementById("images");

    var children = parent.children, 
        length = children.length, i, 
        tmparr = [];
    
    for(i=0; i<length; i++) tmparr[i] = children[i];
    tmparr.sort(function() {
        return 0.5-Math.random();
    });
    for(i=0; i<length; i++) parent.appendChild(tmparr[i]);
}