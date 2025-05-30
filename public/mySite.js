var currentLang = String('en');

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
    }else{
        setLanguage('en');
        currentLang = String('en');
        document.getElementById('buttonLang').innerText = 'CZ';
    };
}

function setLanguage(language){
    fetch(`/lang/${language}.txt`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('aboutMeMenu').innerText = data.AboutMeLink;
        document.getElementById('aboutWebsiteMenu').innerText = data.AboutWebsiteLink;
        document.getElementById('ShowcaseMenu').innerText = data.ShowcaseMenu;

        console.log(window.location.pathname);

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

console.log('mySite.js\\js connected');

setLanguage('en');

if (window.location.pathname != '/JSShowcase.html'){
    document.getElementById('buttonLang').addEventListener('click', buttonPressed);
}

