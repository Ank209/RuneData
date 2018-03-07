let skills = ['Attack', 'Defence', 'Strength', 'Constitution', 'Ranged', 'Prayer', 'Magic', 'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing', 'Mining', 'Herblore', 'Agility', 'Thieving', 'Slayer', 'Farming', 'Runecrafting', 'Hunter', 'Construction', 'Summoning', 'Dungeoneering', 'Divination', "Invention"];
let playerSkills = [];
let playerClues = [];
let baseHTML = document.getElementById("mainData").innerHTML;

let searchTerm = "Iron Ankh";
let maxHighscore = "";
let currentHighscores = "";
let currentSortCol = "Default";

GetUserData();

function GetUserData() {
    $.ajax({
        url:"https://crossorigin.me/https://apps.runescape.com/runemetrics/profile/profile?user=" + searchTerm + "&activities=0",
        dataType: "json", success: HandlePlayerData
    });
    currentHighscores = "HC";
    maxHighscore = "HC";
    $.ajax({
        url:"https://crossorigin.me/http://services.runescape.com/m=hiscore_hardcore_ironman/index_lite.ws?player=" + searchTerm,
        dataType: "text", success: HandlePlayerStats, error: HandleErrorHCIM
    });
}

function HandlePlayerData(data) {
    //console.log(data);
    UpdatePlayerData(data)
}

function HandleErrorHCIM(error) {
    if (error.status == 404) {
        console.log("Player not found on hcim highscores, checking reg iron");
        currentHighscores = "Iron";
        maxHighscore = "Iron";
        $.ajax({
            url:"https://crossorigin.me/http://services.runescape.com/m=hiscore_ironman/index_lite.ws?player=" + searchTerm,
            dataType: "text", success: HandlePlayerStats, error: HandleErrorIron
        });
    } else {
        console.log("Error getting HCIM stats: " + error.status);
    }
}

function HandleErrorIron(error) {
    if (error.status == 404) {
        console.log("Player not found on iron highscores, checking reg");
        currentHighscores = "Reg";
        maxHighscore = "Reg";
        $.ajax({
            url:"https://crossorigin.me/http://services.runescape.com/m=hiscore/index_lite.ws?player=" + searchTerm,
            dataType: "text", success: HandlePlayerStats, error: HandleErrorReg
        });
    } else {
        console.log("Error getting Iron stats: " + error.status);
    }
}

function HandleErrorReg(error) {
    if (error.status == 404) {
        console.log("Player Not found");
    } else {
        console.log("Error getting Reg stats: " + error.status);
    }
}

function HandlePlayerStats(data) {
    console.log("Player found on " + currentHighscores + " highscores.");
    updateHighscore(false);
    playerSkills = [];
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
    i = 52;
    for (i; i < 57; i++) {
        let clue = skills[i].split(',');
        let tempClue = {
            rank: parseInt(clue[0]),
            value: parseInt(clue[1])
        }
        playerClues.push(tempClue);
    }
        //console.log(data);
        //TestOutput();
        CreateSkillList();
}

function UpdatePlayerData(data) {
    document.getElementById("rsn").innerText = data.name;
    document.getElementById("totalXp").innerText = numberWithCommas(data.totalxp);
    document.getElementById("combatLevel").innerText = data.combatlevel;
    //document.getElementById("rank").innerText = numberWithCommas(data.rank);
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
        $.ajax({
            url:"https://crossorigin.me/http://services.runescape.com/m=hiscore_hardcore_ironman/index_lite.ws?player=" + searchTerm,
            dataType: "text", success: HandlePlayerStats, error: HandleErrorHCIM
        });
    } else if (currentHighscores == "Iron") {
        $.ajax({
            url:"https://crossorigin.me/http://services.runescape.com/m=hiscore_ironman/index_lite.ws?player=" + searchTerm,
            dataType: "text", success: HandlePlayerStats, error: HandleErrorIron
        });
    } else if (currentHighscores == "Reg") {
        $.ajax({
            url:"https://crossorigin.me/http://services.runescape.com/m=hiscore/index_lite.ws?player=" + searchTerm,
            dataType: "text", success: HandlePlayerStats, error: HandleErrorReg
        });
    }
}

function CreateSkillList() {
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
            tempTNLValue = getXpDiff(playerSkills[s].xp, getXp(getLevel(playerSkills[s].xp)+1)); 
        } else {
            tempVLevelValue = "inv";
            tempTNLValue = "inv";
        }
        let tempVLevel = '<div class="bar-text-vlevel">' + tempVLevelValue + '</div>';
        let tempTNL = '<div class="bar-text-tnl">' + numberWithCommas(tempTNLValue) + '</div>';

        let attrNum = document.createAttribute('data-num');
        attrNum.value = s;
        let attrSkill = document.createAttribute('data-skill');
        attrSkill.value = skills[s-1];
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
        currElement.innerHTML = currElement.innerHTML + tempRank + tempLevel + tempVLevel + tempXp + tempTNL + '<div class="bar-text-remaining"></div>' + '<div class="bar-text-percentage" style="color:#00BC00;"></div>';
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
    SetMilestone(lowestSkill);
}

function sort(column) {
    if (currentSortCol == column && tinysort.defaults.order == 'asc') {
        tinysort.defaults.order = 'desc';
    } else {
        tinysort.defaults.order = 'asc';
    }
    let skillElements =  document.getElementsByClassName("skill-container");
    if (column == "Default") {
        tinysort(skillElements, {data:'num'});
    } else if (column == "Skill") {
        tinysort(skillElements, {data:'skill'});
    } else if (column == "Rank") {
        tinysort(skillElements, {data:'rank'});
    } else if (column == "Lvl") {
        tinysort(skillElements, {data:'lvl'}, {data:'xp'});
    } else if (column == "VLvl") {
        tinysort(skillElements, {data:'vlvl'}, {data:'xp'});
    } else if (column == "Xp") {
        tinysort(skillElements, {data:'xp'});
    } else if (column == "TNL") {
        tinysort(skillElements, {data:'tnl'});
    } else if (column == "Rem") {
        tinysort(skillElements, {data:'rem'});
    } else if (column == "Percent") {
        tinysort(skillElements, {data:'percent'});
    }
    currentSortCol = column;
}

function UpdateGoal() {
    for (s = 1; s < 28; s++) {
    let tempRemValue = "";
    if (s != 27) {
        if (s == 25 || s == 19) {
            tempRemValue = xpToGoal(playerSkills[s].xp, true, false)
        } else {
            tempRemValue = xpToGoal(playerSkills[s].xp, false, false)
        }
    } else {
        tempRemValue = xpToGoal(playerSkills[s].xp, true)
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
    currElement.childNodes[8].innerText = numberWithCommas(tempRemValue);
    currElement.childNodes[9].innerText = tempPercentageValue + "%";
}
}

function SetMilestone(lowestSkill) {
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

const getXp = (level) => {
    let e = 0;
	for(i = 1; i < level; i++){
		e += Math.floor(i + 300 * Math.pow(2, i / 7));
    }
    return Math.min(Math.floor(e / 4),200000000);
    //return Math.round((1/8)*level*(level - 1)+75*((Math.pow(2, (level-1)/7)-1)/(1-Math.pow(2,-1/7)))-0.109*level);
}

const getLevel = (xp) => {
    let e = 0;
	let test = 0;
	let i = 0;
	do {
		i++;
		e += Math.floor(i + 300 * Math.pow(2, i / 7));
		test = Math.floor(e / 4);
	} while(test <= xp);
		
	return i;
}

const getXpDiff = (startXp, endXp) => {
    let diff = endXp - startXp;
    return Math.max(diff,-diff);
}

const xpToGoal = (currentXp, comp, elite) => {
    let select = document.getElementById("target");
    let goal = select.options[select.selectedIndex].value;

    if (goal == "Max") {
        return getXp(99) - currentXp;
    } else if (goal == "MaxT") {
        if (comp) {
            return getXp(120) - currentXp;
        } else {
            return getXp(99) - currentXp;
        }
    } else if (goal == "120") {
        return getXp(120) - currentXp;
    } else if (goal == "200m") {
        return 200000000 - currentXp;
    } else {
        return -1;
    }
}