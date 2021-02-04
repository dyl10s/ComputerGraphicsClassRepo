let lastDisplayed = 0;
let lastTyped = 0;
let typeArray = [..."Dylan Strohschein - Computer Graphics"]
window.onload = () => {

    let displayTimer = setInterval(() => {
        let cards = [...document.getElementsByClassName("card")];
        if(cards.length - 1 <= lastDisplayed){
            clearInterval(displayTimer);
        }
        cards[lastDisplayed].style.opacity = "1";
        cards[lastDisplayed].style.height = "100%";
        lastDisplayed++;
    }, 300);

    let typeTimer = setInterval(() => {
        let titleElement = document.getElementById("title");
        if(typeArray.length - 1 <= lastTyped){
            clearInterval(typeTimer);
        }
        titleElement.innerHTML += typeArray[lastTyped];
        lastTyped++;
    }, 70);
}


