if(!localStorage.getItem("lang")){
    localStorage.setItem("lang", "en");
}
if(localStorage.getItem("lang") == "en"){
    document.getElementById('buttonLang').innerText = 'CZ';
}else{
    document.getElementById('buttonLang').innerText = 'ENG';    
}

if(localStorage.getItem("darkMode") === null){
    localStorage.setItem("darkMode", "true");
}

var currentLang = localStorage.getItem("lang");

function updateTitle(newText){
    document.getElementById('mainTitle').innerText = newText;

    const title = document.getElementById('mainTitle');
    const text = title.innerText;

    title.innerHTML = text.split('').map(letter => {
        return `<span class="letter">${letter}</span>`
    }).join('');
}


function buttonPressed(){
    if(currentLang == 'en'){
        setLanguage('cz');
        currentLang = String('cz');
        document.getElementById('buttonLang').innerText = 'ENG';
        localStorage.setItem("lang", "cz");
    }else{
        setLanguage('en');
        currentLang = String('en');
        document.getElementById('buttonLang').innerText = 'CZ';
        localStorage.setItem("lang", "en");
    };
}

function setLanguage(language){
    fetch(`/lang/${language}.txt`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('aboutMeMenu').innerText = data.AboutMeLink;
        document.getElementById('aboutWebsiteMenu').innerText = data.AboutWebsiteLink;
        document.getElementById('ShowcaseMenu').innerText = data.ShowcaseMenu;

        if(window.location.pathname == '/index.html'){
            updateTitle(data.AboutWebsiteLink);
            document.getElementById('aboutWebsiteP1').innerText = data.AboutWebsiteP1;
            document.getElementById('aboutWebsiteH2').innerText = data.AboutWebsiteH2;
            document.getElementById('aboutWebsiteP2').innerText = data.AboutWebsiteP2;
        }else if(window.location.pathname == '/AboutMe.html'){
            updateTitle(data.AboutMeLink);
            document.getElementById('aboutMeP1').innerText = data.AboutMeP1;
        }else if(window.location.pathname == '/Showcases/ThreeBodyProblem.html'){
            document.getElementById('jsH1').innerText = data.AboutJSShowcaseH1;
            document.getElementById('jsP1').innerText = data.AboutJSShowcaseP1;
        }else if(window.location.pathname == '/Showcases.html'){
            updateTitle(data.ShowcaseMenu);
        }
    });
}

let langMemory = localStorage.getItem("lang");

setLanguage(currentLang);

document.getElementById('buttonLang').addEventListener('click', buttonPressed);

function setColor(){
    let colorSet = "";
    if(localStorage.getItem("darkMode") === "true"){
        colorSet = "paletteDark";
    }else{
        colorSet = "palette";
    }

    return fetch(`palettes/${colorSet}.txt`)
    .then(res => res.json())
    .then(data => {
        document.body.style.backgroundColor = data.BodyBackground;
        document.querySelector(".mainTitle").style.backgroundColor = data.MainTitleBackground;
        document.querySelector(".mainMenu").style.backgroundColor = data.MainMenuColor;
        document.getElementById('buttonLang').style.backgroundColor = data.BodyBackground;
        document.getElementById('buttonLang').style.color = data.TextColor;
        document.querySelectorAll("p1").forEach(p => {
            p.style.color = data.TextColor;
        });
        document.querySelectorAll("a").forEach(a => {
            a.classList.remove("light");
            a.classList.remove("dark");
            a.classList.add(data.palette);
        });
        document.querySelectorAll(".showcaseContainer").forEach(showcaseContainer => {
            showcaseContainer.style.backgroundColor = data.ShowcaseBox;
        });
        document.querySelectorAll(".leftSideInfoContainer").forEach(leftSideInfoContainer => {
            leftSideInfoContainer.style.backgroundColor = data.ShowcaseBox;
        });
        document.querySelectorAll(".aboutMeElement").forEach(aboutMeElement => {
            aboutMeElement.style.backgroundColor = data.TextColor;
        });
    });
}

const checkBox = document.getElementById("darkModeSlider");
if(localStorage.getItem("darkMode") === "true"){
    checkBox.checked = true;
}else{
    checkBox.checked = false;
}

window.addEventListener("DOMContentLoaded", () => {
    setColor();
});

checkBox.addEventListener("change", () => {
    localStorage.setItem("darkMode", checkBox.checked.toString());

    setColor();
});

const email = 'matyas.hensel2004@gmail.com';
function copyEmail(){
    navigator.clipboard.writeText(email)
    .then(() => alert("Email copied!"))
    .catch(err => alert("Copy failed: " + err));
}


