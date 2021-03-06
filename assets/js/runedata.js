let skills = ['Attack', 'Defence', 'Strength', 'Constitution', 'Ranged', 'Prayer', 'Magic', 'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing', 'Mining', 'Herblore', 'Agility', 'Thieving', 'Slayer', 'Farming', 'Runecrafting', 'Hunter', 'Construction', 'Summoning', 'Dungeoneering', 'Divination', "Invention"];
let percentageColors = ['#FF0000','#FF9B00','#E7E400','#6CBC00','#00BC00'];
let playerSkillsHC = [];
let playerSkillsIron = [];
let playerSkillsReg = [];
let playerClues = [];
let playerData = []
let eliteXp = [];
let highscoresReceived = [];
let playerName = "";
let wrongTiming = false;
let baseHTML = document.getElementById("mainData").innerHTML;
let pageLoaded = false;

//TODO: clicking on skill opens highscores in new tab (search for player)
//TODO: Add post? to address so specific players can be linked

let maxHighscore = "HC";
let currentHighscores = "HC";
let currentSortCol = "default";

CheckPlayer();

function CheckPlayer() {
    if (getQueryVariable("playerName")) {
        playerName = decodeURI(getQueryVariable("playerName"));
        document.getElementById("rsn").value = playerName;
        searchPlayer();
    }
}

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

function GetUserData(searchTerm) {
    $.ajax({
        url: "assets/eliteskillxp.json", dataType: "json", success: function (data) { eliteXp = data; }
    });
    $.ajax({
        url: "https://crossorigin.me/https://apps.runescape.com/runemetrics/profile/profile?user=" + searchTerm + "&activities=0",
        dataType: "json", success: HandlePlayerData
    });
    $.ajax({
        type: 'GET',
        url: "https://crossorigin.me/http://services.runescape.com/m=hiscore_hardcore_ironman/index_lite.ws?player=" + searchTerm,
        dataType: "text", success: function (data) { HandlePlayerStats(data, 2, "HC") }, error: function (data) { HandleError(data, 2, "HC") }
    });
    $.ajax({
        url: "https://crossorigin.me/http://services.runescape.com/m=hiscore_ironman/index_lite.ws?player=" + searchTerm,
        dataType: "text", success: function (data) { HandlePlayerStats(data, 1, "Iron") }, error: function (data) { HandleError(data, 1, "Iron") }
    });
    $.ajax({
        url: "https://crossorigin.me/http://services.runescape.com/m=hiscore/index_lite.ws?player=" + searchTerm,
        dataType: "text", success: function (data) { HandlePlayerStats(data, 0, "Reg") }, error: function (data) { HandleError(data, 0, "Reg") }
    });
}

function HandlePlayerData(data) {
    //console.log(data);
    playerData = data;
    if (wrongTiming) {
        UpdateGoal();
    }
    if (playerData.name) {
        UpdatePlayerData();
    }
}

function HandleError(error, type, typeString) {
    if (error.status == 404) {
        console.log("Player not found on " + typeString + " highscores");
        if (type == 0) {
            document.getElementById("loading").style.display = "none";
            document.getElementById("helpText").innerText = "Player not found, please check the spelling or try another";
            document.getElementById("searchHelp").style.display = "block";
        }
    } else {
        console.log("Error getting " + typeString + " stats: " + error.status);
    }
    dataReceived(-1);
}

$("#header").submit(function(e) {
    e.preventDefault();
});

$("skill0").mousedown(function(e){ e.preventDefault(); });

function LoadUserPage() {
    let newURL = "";
    if (window.location.href.includes("?playerName=")) {
        newURL = window.location.href.slice(0, window.location.href.indexOf("?playerName=")) + "?playerName=" + document.getElementById("rsn").value;
    } else {
        newURL = window.location.href + "?playerName=" + document.getElementById("rsn").value;
    }
    window.location.href = newURL;
}

function searchPlayer() {
    //Show loading animation
    pageLoaded = false;
    document.getElementById("leftData").style.display = "none";
    document.getElementById("mainData").style.display = "none";
    document.getElementById("profileImg").setAttribute("src", "");
    document.getElementById("searchHelp").style.display = "none";
    document.getElementById("loading").style.display = "block";
    playerSkillsHC = [];
    playerSkillsIron = [];
    playerSkillsReg = [];
    playerClues = [];
    playerData = []
    highscoresReceived = [];
    wrongTiming = false;
    maxHighscore = "HC";
    currentHighscores = "HC";
    currentSortCol = "default";
    //GetUserData(document.getElementById("rsn").value);
    GetUserData(playerName);
    document.getElementById("rsn").blur();
}

function PageLoaded() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("leftData").style.display = "block";
    document.getElementById("mainData").style.display = "block";
}

function OpenHighscores(skill) {
    if (currentHighscores == "HC") {
        window.open("http://services.runescape.com/m=hiscore_hardcore_ironman/ranking?table=" + skill + "&category_type=0&user=" + playerData.name);
    } else if (currentHighscores == "Iron") {
        window.open("http://services.runescape.com/m=hiscore_ironman/ranking?table=" + skill + "&category_type=0&user=" + playerData.name);
    } else if (currentHighscores == "Reg") {
        window.open("http://services.runescape.com/m=hiscore/ranking?table=" + skill + "&category_type=0&user=" + playerData.name);
    }
}

function HandlePlayerStats(data, type, typeString) {
    console.log("Player found on " + typeString + " highscores.");
    let playerSkills = [];
    let skills = data.split('\n');
    let i = 0;
    for (i; i < 28; i++) {
        let skill = skills[i].split(',');
        let tempSkill = {
            id: i,
            rank: parseInt(skill[0]),
            level: parseInt(skill[1]),
            xp: parseInt(skill[2])
        }
        playerSkills.push(tempSkill);
        //console.log(skills[i]);
    }
    playerClues = [];
    i = 52;
    for (i; i < 57; i++) {
        let clue = skills[i].split(',');
        let tempClueValue = 0;
        if (parseInt(clue[1]) != -1) {
            tempClueValue = parseInt(clue[1]);
        }
        let tempClue = {
            rank: parseInt(clue[0]),
            value: tempClueValue
        }
        playerClues.push(tempClue);
    }
    switch (type) {
        case 0:
            playerSkillsReg = playerSkills;
            break;
        case 1:
            playerSkillsIron = playerSkills;
            break;
        case 2:
            playerSkillsHC = playerSkills;
            break;
    }
    //console.log(data);
    //TestOutput();
    dataReceived(type);
}

function dataReceived(type) {
    highscoresReceived.push(type);
    if (highscoresReceived.length == 3) {
        highscoresReceived.sort(function (a, b) { return b - a });
        switch (highscoresReceived[0]) {
            case 0:
                maxHighscore = "Reg";
                currentHighscores = maxHighscore;
                CreateSkillList(playerSkillsReg);
                break;
            case 1:
                maxHighscore = "Iron";
                currentHighscores = maxHighscore;
                CreateSkillList(playerSkillsIron);
                break;
            case 2:
                maxHighscore = "HC";
                currentHighscores = maxHighscore;
                CreateSkillList(playerSkillsHC);
                break;
        }
        updateHighscore(false);
    }
}

const getHighscore = () => {
    switch (currentHighscores) {
        case "Reg":
            return playerSkillsReg;
            break;
        case "Iron":
            return playerSkillsIron;
            break;
        case "HC":
            return playerSkillsHC;
            break;
    }
}

function UpdatePlayerData() {
    document.getElementById("profileImg").setAttribute("src", "http://services.runescape.com/m=avatar-rs/" + playerData.name + "/chat.png");
    document.getElementById("rsn").value = "";
    document.getElementById("rsn").placeholder = playerData.name;
    document.getElementById("totalLevel").innerText = numberWithCommas(playerData.totalskill);
    document.getElementById("totalXp").innerText = numberWithCommas(playerData.totalxp);
    document.getElementById("combatLevel").innerText = playerData.combatlevel;
    document.getElementById("levelsToMaxTotal").innerText = numberWithCommas(2736 - playerData.totalskill);
    //document.getElementById("rank").innerText = numberWithCommas(playerData.rank);
}

function updateHighscore(newHighscore = true) {
    let select = document.getElementById("highscore");
    document.getElementById("hcimInfo").style = "display: none;";
    document.getElementById("ironInfo").style = "display: none;";
    document.getElementById("regInfo").style = "display: none;";
    if (newHighscore) {
        currentHighscores = select.options[select.selectedIndex].value;
    }
    if (maxHighscore == "HC") {
        select.options[2].disabled = false;
        select.options[1].disabled = false;
    } else if (maxHighscore == "Iron") {
        select.options[2].disabled = true;
        select.options[1].disabled = false;
    } else {
        select.options[2].disabled = true;
        select.options[1].disabled = true;
    }
    if (currentHighscores == "HC") {
        document.getElementById("hcimInfo").style = "display: block;";
        select.selectedIndex = 2;
    } else if (currentHighscores == "Iron" && maxHighscore != "Reg") {
        document.getElementById("ironInfo").style = "display: block;";
        select.selectedIndex = 1;
    } else if (currentHighscores == "Reg") {
        document.getElementById("regInfo").style = "display: block;";
        select.selectedIndex = 0;
    }
    if (newHighscore) {
        RefreshPlayerData();
    }
}

function RefreshPlayerData() {
    if (currentHighscores == "HC") {
        /*$.ajax({
            url: "https://crossorigin.me/http://services.runescape.com/m=hiscore_hardcore_ironman/index_lite.ws?player=" + searchTerm,
            dataType: "text", success: HandlePlayerStats, error: HandleErrorHCIM
        });*/
        CreateSkillList(playerSkillsHC);
    } else if (currentHighscores == "Iron") {
        /*$.ajax({
            url: "https://crossorigin.me/http://services.runescape.com/m=hiscore_ironman/index_lite.ws?player=" + searchTerm,
            dataType: "text", success: HandlePlayerStats, error: HandleErrorIron
        });*/
        CreateSkillList(playerSkillsIron);
    } else if (currentHighscores == "Reg") {
        /*$.ajax({
            url: "https://crossorigin.me/http://services.runescape.com/m=hiscore/index_lite.ws?player=" + searchTerm,
            dataType: "text", success: HandlePlayerStats, error: HandleErrorReg
        });*/
        CreateSkillList(playerSkillsReg);
    }
    sort(currentSortCol, false);
}

function CreateSkillList(playerSkills) {
    document.getElementById("rank").innerText = playerSkills[0].rank;
    document.getElementById("mainData").innerHTML = baseHTML;
    let lowestSkill = 99;
    let milestone = 0;
    for (s = 1; s < 28; s++) {
        let tempRank = '<div class="bar-text-rank">' + numberWithCommas(playerSkills[s].rank) + '</div>';
        let tempLevel = '<div class="bar-text-level">' + playerSkills[s].level + '</div>';
        let tempXp = '<div class="bar-text-xp">' + numberWithCommas(playerSkills[s].xp) + '</div>';
        let tempVLevelValue = "";
        let tempTNLValue = "";
        if (s != 27) {
            tempVLevelValue = getLevel(playerSkills[s].xp);
            tempTNLValue = getXpDiff(playerSkills[s].xp, getXp(getLevel(playerSkills[s].xp) + 1));
        } else {
            tempVLevelValue = getLevel(playerSkills[s].xp, true);
            tempTNLValue = getXpDiff(playerSkills[s].xp, getXp(getLevel(playerSkills[s].xp, true) + 1, true), true);
        }
        let tempVLevel = '<div class="bar-text-vlevel">' + tempVLevelValue + '</div>';
        let tempTNL = '<div class="bar-text-tnl">' + numberWithCommas(tempTNLValue) + '</div>';

        let attrNum = document.createAttribute('data-num');
        attrNum.value = s;
        let attrSkill = document.createAttribute('data-skill');
        attrSkill.value = skills[s - 1];
        let attrRank = document.createAttribute('data-rank');
        attrRank.value = playerSkills[s].rank;
        let attrLvl = document.createAttribute('data-lvl');
        attrLvl.value = playerSkills[s].level;
        let attrVLvl = document.createAttribute('data-vlvl');
        attrVLvl.value = tempVLevelValue;
        let attrXp = document.createAttribute('data-xp');
        attrXp.value = playerSkills[s].xp;
        let attrTNL = document.createAttribute('data-tnl');
        attrTNL.value = tempTNLValue;

        let currElement = document.getElementById("skill" + s)
        currElement.parentElement.setAttributeNode(attrNum);
        currElement.parentElement.setAttributeNode(attrSkill);
        currElement.parentElement.setAttributeNode(attrRank);
        currElement.parentElement.setAttributeNode(attrLvl);
        currElement.parentElement.setAttributeNode(attrVLvl);
        currElement.parentElement.setAttributeNode(attrXp);
        currElement.parentElement.setAttributeNode(attrTNL);
        //currElement.data('xp', playerSkills[s].xp)
        currElement.innerHTML = currElement.innerHTML + tempRank + tempLevel + tempVLevel + tempXp + tempTNL + '<div class="bar-text-remaining"></div>' + '<div class="bar-text-percentage"></div>';
        if (playerSkills[s].level < lowestSkill) {
            lowestSkill = playerSkills[s].level;
        }

        document.getElementById("clueEasy").innerText = playerClues[0].value;
        document.getElementById("clueMed").innerText = playerClues[1].value;
        document.getElementById("clueHard").innerText = playerClues[2].value;
        document.getElementById("clueElite").innerText = playerClues[3].value;
        document.getElementById("clueMaster").innerText = playerClues[4].value;
    }
    UpdateGoal();
    SetMilestone(playerSkills, lowestSkill);
}

function sort(column, reverse = true) {
    let rotate = "";
    if (currentSortCol != "default") {
        document.getElementById(currentSortCol + "-arrow").setAttribute("src", "assets/images/arrowinactive.svg");
        document.getElementById(currentSortCol + "-arrow").setAttribute("class", "");
    }
    if (currentSortCol == column && tinysort.defaults.order == 'asc' && reverse) {
        rotate = "rotate180";
        tinysort.defaults.order = 'desc';
    } else if (reverse) {
        tinysort.defaults.order = 'asc';
    }
    let skillElements = document.getElementsByClassName("skill-container");
    if (column == "default") {
        tinysort(skillElements, { data: 'num' });
    } else if (column == "skill") {
        tinysort(skillElements, { data: 'skill' });
        document.getElementById("skill-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("skill-arrow").setAttribute("class", rotate);
    } else if (column == "rank") {
        tinysort(skillElements, { data: 'rank' });
        document.getElementById("rank-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("rank-arrow").setAttribute("class", rotate);
    } else if (column == "lvl") {
        tinysort(skillElements, { data: 'lvl' }, { data: 'xp' });
        document.getElementById("lvl-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("lvl-arrow").setAttribute("class", rotate);
    } else if (column == "vlvl") {
        tinysort(skillElements, { data: 'vlvl' }, { data: 'xp' });
        document.getElementById("vlvl-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("vlvl-arrow").setAttribute("class", rotate);
    } else if (column == "xp") {
        tinysort(skillElements, { data: 'xp' });
        document.getElementById("xp-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("xp-arrow").setAttribute("class", rotate);
    } else if (column == "tnl") {
        tinysort(skillElements, { data: 'tnl' });
        document.getElementById("tnl-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("tnl-arrow").setAttribute("class", rotate);
    } else if (column == "rem") {
        tinysort(skillElements, { data: 'rem' });
        document.getElementById("rem-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("rem-arrow").setAttribute("class", rotate);
    } else if (column == "percent") {
        tinysort(skillElements, { data: 'percent' });
        document.getElementById("percent-arrow").setAttribute("src", "assets/images/arrowactive.svg");
        document.getElementById("percent-arrow").setAttribute("class", rotate);
    }
    currentSortCol = column;
}

function UpdateGoal() {
    if (playerData.length != 0) {
        let playerSkills = getHighscore();
        let xpRemaining = 0;
        let actualPlayerXp = 0;
        let vTotal = 0;
        for (s = 1; s < 28; s++) {
            let tempRemValue = "";
            if (s != 27) {
                if (s == 25 || s == 19) {
                    tempRemValue = xpToGoal(playerSkills[s].xp, true, false)
                    actualPlayerXp = actualPlayerXp + xpLessThanGoal(playerSkills[s].xp, true, false);
                } else {
                    tempRemValue = xpToGoal(playerSkills[s].xp, false, false)
                    actualPlayerXp = actualPlayerXp + xpLessThanGoal(playerSkills[s].xp, false, false);
                }
                vTotal = vTotal + getLevel(playerSkills[s].xp);
            } else {
                tempRemValue = xpToGoal(playerSkills[s].xp, true, true)
                actualPlayerXp = actualPlayerXp + xpLessThanGoal(playerSkills[s].xp, true, true);
                vTotal = vTotal + getLevel(playerSkills[s].xp, true);
            }
            if (tempRemValue < 0) {
                tempRemValue = 0;
            }
            
            let tempPercentageValue = Math.round(playerSkills[s].xp / (playerSkills[s].xp + tempRemValue) * 100);
            let currElement = document.getElementById("skill" + s);

            let attrRem = document.createAttribute('data-rem');
            attrRem.value = tempRemValue;
            let attrPercent = document.createAttribute('data-percent');
            attrPercent.value = tempPercentageValue;
            currElement.parentElement.setAttributeNode(attrRem);
            currElement.parentElement.setAttributeNode(attrPercent);

            currElement.style = "width:" + tempPercentageValue + "%";
            currElement.childNodes[10].innerText = numberWithCommas(tempRemValue);
            currElement.childNodes[11].innerText = tempPercentageValue + "%";
            currElement.childNodes[11].setAttribute("style", "color: " + getColor(tempPercentageValue) + ";");
            xpRemaining = xpRemaining + tempRemValue;
        }
        document.getElementById("xpRem").innerText = numberWithCommas(xpRemaining);
        document.getElementById("percentRem").innerText = Math.round(actualPlayerXp / (actualPlayerXp + xpRemaining) * 100) + "%";
        document.getElementById("levelsToTrueMax").innerText = numberWithCommas(3270 - vTotal);
        PageLoaded();
    } else {
        wrongTiming = true;
    }
}

const getColor = (percentage) => {
    if (percentage < 25) {
        return percentageColors[0];
    } else if (percentage < 50) {
        return percentageColors[1];
    } else if (percentage < 75) {
        return percentageColors[2];
    } else if (percentage < 100) {
        return percentageColors[3];
    } else if (percentage == 100) {
        return percentageColors[4];
    }
}

function SetMilestone(playerSkills, lowestSkill) {
    if (playerSkills[19].level == 120 && playerSkills[25].level == 120 && playerSkills[27].level == 120) {
        milestone = "Max Total";
    } else if (lowestSkill == 99) {
        milestone = "Maxed";
    } else if (lowestSkill == 1) {
        milestone = "1";
    } else {
        milestone = Math.round(lowestSkill / 10) * 10;
    }
    document.getElementById("milestone").innerText = milestone;
}

function TestOutput() {
    /*for (i = 1; i <= 120; i++) {
        console.log(i + " : " + getLevelXp(i));
    }*/
    console.log(playerSkills);
    console.log(playerClues);
}

const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const getXp = (level, elite = false) => {
    if (elite) {
        if (level > 150) {
            return 200000000;
        } else {
            return parseInt(eliteXp[level].xp);
        }
    }
    if (level > 120) {
        return 104273167;
    }
    let e = 0;
    for (let i = 1; i < level; i++) {
        e += Math.floor(i + 300 * Math.pow(2, i / 7));
    }
    return Math.min(Math.floor(e / 4), 200000000);
    //return Math.round((1/8)*level*(level - 1)+75*((Math.pow(2, (level-1)/7)-1)/(1-Math.pow(2,-1/7)))-0.109*level);
}

const getLevel = (xp, elite = false) => {
    if (elite) {
        if (xp >= 194927409) {
            return 150;
        }
        for (let i = 0; i < eliteXp.length; i++) {
            if (eliteXp[i].xp <= xp && eliteXp[i + 1].xp > xp) {
                return i;
            }
        }
    }
    if (xp >= 104273167) {
        return 120;
    }
    let e = 0;
    let test = 0;
    let i = 0;
    do {
        i++;
        e += Math.floor(i + 300 * Math.pow(2, i / 7));
        test = Math.floor(e / 4);
    } while (test <= xp);

    return i;
}

const getXpDiff = (startXp, endXp, elite = false) => {
    if (elite && startXp >= 194927409) {
        return 0;
    }
    if (startXp >= 104273167) {
        return 0;
    }
    let diff = endXp - startXp;
    return Math.max(diff, -diff);
}

const xpToGoal = (currentXp, comp, elite, limit = false) => {
    let select = document.getElementById("target");
    let goal = select.options[select.selectedIndex].value;

    if (goal == "Max") {
        return getXp(99, elite) - currentXp;
    } else if (goal == "MaxT") {
        if (comp) {
            return getXp(120, elite) - currentXp;
        } else {
            return getXp(99, elite) - currentXp;
        }
    } else if (goal == "120") {
        return getXp(120, elite) - currentXp;
    } else if (goal == "200m") {
        return 200000000 - currentXp;
    } else {
        return -1;
    }
}

const xpLessThanGoal = (currentXp, comp, elite) => {
    let select = document.getElementById("target");
    let goal = select.options[select.selectedIndex].value;

    if (goal == "Max") {
        return Math.min(getXp(99, elite), currentXp);
    } else if (goal == "MaxT") {
        if (comp) {
            return Math.min(getXp(120, elite), currentXp);
        } else {
            return Math.min(getXp(99, elite), currentXp);
        }
    } else if (goal == "120") {
        return Math.min(getXp(120, elite), currentXp);
    } else if (goal == "200m") {
        return Math.min(200000000, currentXp);
    } else {
        return -1;
    }
}