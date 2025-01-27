function searchTable() {
    const input = document.getElementById('searchBar').value.toLowerCase();
    const table = document.getElementById('dataTable');
    const rows = Array.from(table.getElementsByTagName('tr')).slice(1); // Exclude the header row

    // If input is empty, display all rows
    if (input === '') {
        rows.forEach(row => row.style.display = '');
        return;
    }

    // Filter rows based on the input
    const filteredRows = rows.filter(row => {
        const cells = row.getElementsByTagName('td');
        return Array.from(cells).some(cell => cell.textContent.toLowerCase().includes(input));
    });

    // Sort rows by the closest match (simplified to sort by number of matched cells)
    filteredRows.sort((a, b) => {
        const aMatchCount = Array.from(a.getElementsByTagName('td')).filter(cell => cell.textContent.toLowerCase().includes(input)).length;
        const bMatchCount = Array.from(b.getElementsByTagName('td')).filter(cell => cell.textContent.toLowerCase().includes(input)).length;
        return bMatchCount - aMatchCount;
    });

    // Hide all rows initially
    rows.forEach(row => row.style.display = 'none');

    // Display the closest three matches
    filteredRows.slice(0, 3).forEach(row => row.style.display = '');

    // Display the rest of the rows after the closest three
    filteredRows.slice(3).forEach(row => row.style.display = '');
}


const EP = 8.0;

const MIN_SKILLS = 6;
const MAX_SKILLS = 8;

let currentRoutineTable = null;

// Function to add a skill row to the current routine table
// Function to add a skill row to the current routine table
function addSkill(_name, _difficulty, _elementGroup) {
    let addedToExistingRow = false;

    // Check if there are empty rows and fill them first
    currentRoutineTable.find("tr:not(.header-row)").each(function () {
        const cells = $(this).find("td");
        if (cells.eq(0).text() === "" && cells.eq(1).text() === "" && cells.eq(2).text() === "") {
            cells.eq(0).text(_name);
            cells.eq(1).text(_difficulty);
            cells.eq(2).text(_elementGroup);
            addedToExistingRow = true;
            return false; // Exit loop after filling the first empty row
        }
    });

    // If no empty rows, add a new row at the end
    if (!addedToExistingRow) {
        const rowCount = currentRoutineTable.find("tr:not(.header-row)").length;
        const oddOrEven = rowCount % 2 !== 0 ? "skill-even-row" : "skill-odd-row";
        const newRow = $("<tr></tr>").addClass(oddOrEven);
        newRow.append(`<td>${_name}</td>`);
        newRow.append(`<td>${_difficulty}</td>`);
        newRow.append(`<td>${_elementGroup}</td>`);
        currentRoutineTable.find(".add-row").before(newRow);
    }
}


// Function to convert an integer to a Roman numeral
function toRomanNumeral(integer) {
    if (integer === 1) {
        return "I";
    }
    if (integer === 2) {
        return "II";
    }
    if (integer === 3) {
        return "III";
    }
    return "IV";
}

// Function to create a new skill table
function createTable(event, elementGroup) {
    var newTable = $("<table class='skill-table'></table>");
    newTable.append(
        "<tr><th colspan='3'>" +
        event +
        " -- Super Skills Chart -- GRP " +
        toRomanNumeral(elementGroup) +
        "</th></tr>"
    );
    newTable.append(
        "<tr><th>Skill</th><th>Difficulty</th><th>Element Group</th></tr>"
    );
    $("#skill-table-container").append(newTable);
    return newTable;
}

function display_score(routineTable, execution, difficulty, scoreString) {
    // Define a class name for the score row
    var scoreClass = "score-row";

    // Check if a row with the scoreClass already exists
    if (routineTable.find("tr." + scoreClass).length === 0) {
        // Find the last row in the routineTable
        var lastRow = routineTable.find("tr:last");

        // Insert the new row after the last row with the specified class and colspan 3
        lastRow.after(
            "<tr class='" +
            scoreClass +
            "'><td colspan='3'>" +
            "Start Value: " + sv + " Execution: " + execution + " Difficulty: " + difficulty +
            "</td></tr>"
        );
    } else {
        var sv = parseFloat(execution) + parseFloat(difficulty);

        // Update the text of the existing row with the scoreClass and set colspan 3
        routineTable
            .find("tr." + scoreClass)
            .find("td")
            .attr("colspan", "3")
            .html(
                "Start Value: " + sv + " Execution: " + execution + " Difficulty: " + difficulty
            );
    }
}

const ELEMENT_GROUPS = {
    1: 4,
    2: 4,
    3: 4,
    4: 4,
    5: 4,
    6: 4,
    7: 4,
    8: 4,
    9: 4,
    10: 4
};

const SUPERSKILLS = {
    1: 8,
    2: 8,
    3: 8,
    4: 6,
    5: 5,
    6: 4,
    7: 3,
    8: 2,
    9: 1,
    10: 0
};

const EXERCISE_PRESENTATION = {
    1: 8.0,
    2: 8.0,
    3: 8.0,
    4: 8.0,
    5: 8.0,
    6: 8.0,
    7: 8.0,
    8: 8.0,
    9: 8.0,
    10: 7.5
};

function calculate_compulsory_NGA(routineTable, _level) {
    var table = routineTable.find(
        "tr:not(.header-row):not(.add-row):not(.score-row)"
    );

    let scoreString = "";
    let difficulty = 0;
    let EG = EXERCISE_PRESENTATION[_level] || 89;

    let skills = [];
    _level = Number(_level);

    table.each(function () {
        const skillName = $(this).find("td").eq(0).text();
        const skillDifficulty = parseFloat($(this).find("td").eq(1).text());
        const skillElementGroup = parseInt($(this).find("td").eq(2).text());

        skills.push({
            name: skillName,
            difficulty: skillDifficulty,
            elementGroup: skillElementGroup
        });
    });

    const topSkills = getTopRoutineSkills(skills);

    console.log(topSkills);

    let elementGroups = new Set();
    topSkills.forEach(skill => {
        elementGroups.add(skill.elementGroup);
        difficulty += skill.difficulty;
    });

    // Check for element group deductions
    switch (elementGroups.size) {
        case 0:
            break;
        case 1:
            EG += 0.5;
            break;
        case 2:
            EG += 1.0;
            break;
        case 3:
            EG += 1.5;
            break;
        default:
            EG += 2.0;
            break;
    }

    // Check for short routine deductions
    switch (topSkills.length) {
        case 0:
            EG = 0;
            break;
        case 1:
            EG -= 7.0;
            break;
        case 2:
            EG -= 6.0;
            break;
        case 3:
            EG -= 5.0;
            break;
        case 4:
            EG -= 4.0;
            break;
        case 5:
            EG -= 3.0;
            break;
        default:
            break;
    }

    // Check for missing FIG values
    switch (_level) {
        case 1:
        case 2:
        case 3:
            break;
        case 4:
            if (difficulty < 0.1) {
                EG -= 0.5;
            }
            break;
        case 5:
            if (difficulty < 0.2) {
                EG -= 0.5;
            }
            break;
        default:
            break;
    }

    // Ensure floating-point precision is handled correctly
    EG = parseFloat(EG.toFixed(2));
    difficulty = parseFloat(difficulty.toFixed(2));

    console.log("EG value is: " + EG);
    console.log("Difficulty value is: " + difficulty);

    display_score(routineTable, EG, difficulty, scoreString);
}

function getTopRoutineSkills(skills) {
    // Remove duplicate skills
    let uniqueSkills = skills.reduce((acc, skill) => {
        if (!acc.some(s => s.name === skill.name)) {
            acc.push(skill);
        }
        return acc;
    }, []);

    // Sort skills by difficulty value in descending order
    uniqueSkills.sort((a, b) => b.difficulty - a.difficulty);

    // Group skills by element group
    let elementGroups = [[], [], [], []];
    uniqueSkills.forEach(skill => {
        elementGroups[skill.elementGroup - 1].push(skill);
    });

    // Ensure at least one skill from each element group if present
    let topSkills = [];
    for (let i = 0; i < elementGroups.length; i++) {
        if (elementGroups[i].length > 0) {
            topSkills.push(elementGroups[i][0]);
        }
    }

    // Flatten the remaining skills and sort again by difficulty value
    let remainingSkills = [].concat(...elementGroups).sort((a, b) => b.difficulty - a.difficulty);

    // Add skills to topSkills until we have 8 skills in total
    for (let i = 0; topSkills.length < 8 && i < remainingSkills.length; i++) {
        if (!topSkills.some(skill => skill.name === remainingSkills[i].name)) {
            topSkills.push(remainingSkills[i]);
        }
    }

    return topSkills.slice(0, 8); // Ensure we return exactly 8 skills
}



// Function to calculate score based on level
function calculateScore(_event, _level, routineTable) {
    if (_level < 7) {
        calculate_compulsory_NGA(routineTable, _level);
    }
    else {
        calculate_optional_NGA(routineTable, _level);
    }
}

// Function to create a new routine table
function createRoutineTable(level, event) {
    const tableHTML = `
                    <table class="routine-table">
                        <tr class="header-row">
                            <th colspan="3">${level} ${event} Routine</th>
                        </tr>
                        <tr class="header-row" id="subheader">
                            <th>Skills</th>
                            <th>Difficulty Value</th>
                            <th>Element Group</th>
                        </tr>
                        <tr class="skill-even-row">
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr class="skill-odd-row">
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr class="skill-even-row">
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr class="skill-odd-row">
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr class="skill-even-row">
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr class="skill-odd-row">
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr class="skill-even-row">
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr class="skill-odd-row">
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr class="skill-even-row">
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr class="skill-odd-row">
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>                          
                        <tr class="add-row">
                            <td>
                                <button class="add-skill-button">Add a Skill</button>
                            </td>
                            <td>
                                <button class="delete-skill-button">Delete last skill</button>
                            </td>
                            <td>
                                <button class="calculate-score-button">Calculate score</button>
                                <button id="openPopup" class="save-routine-button">Save routine</button>
                            </td>
                        </tr>
                    </table>
                `;
    $("#routine-tables-container").append(tableHTML);
    attachEventListeners();
}
function getRoutineFormData() {
    const routineName = document.getElementById('routineName').value.trim();
    const level = document.getElementById('routineLevel').value;
    const event = document.getElementById('routineEvent').value;
    return {routineName, level, event};
}

// Function to attach event listeners to buttons
function attachEventListeners() {
    $(".add-skill-button")
        .off()
        .on("click", function () {
            currentRoutineTable = $(this).closest("table");
            // $("#routine-tables-container").hide();
            $("#skill-table-container").show();

            const table = $(this).closest(".routine-table");
            const headerText = table.find("th").first().text();
            const event = headerText.split(" ")[2]; // Assuming the format is "Level Event Routine"
            console.log(`Add skill button clicked in event: ${event}`);
            switch (event) {
                case "FX":
                    $("#floor").show();
                    $("#pommel").hide();
                    $("#Mushroom").hide();
                    $("#rings").hide();
                    $("#vault").hide();
                    $("#pbars").hide();
                    $("#highbar").hide();
                    break;
                case "PH":
                    $("#floor").hide();
                    $("#pommel").show();
                    $("#Mushroom").hide();
                    $("#rings").hide();
                    $("#vault").hide();
                    $("#pbars").hide();
                    $("#highbar").hide();
                    break;
                case "Mushroom":
                    $("#floor").hide();
                    $("#pommel").hide();
                    $("#Mushroom").show();
                    $("#rings").hide();
                    $("#vault").hide();
                    $("#pbars").hide();
                    $("#highbar").hide();
                    break;
                case "SR":
                    $("#floor").hide();
                    $("#pommel").hide();
                    $("#Mushroom").hide();
                    $("#rings").show();
                    $("#vault").hide();
                    $("#pbars").hide();
                    $("#highbar").hide();
                    break;
                case "VT":
                    $("#floor").hide();
                    $("#pommel").hide();
                    $("#Mushroom").hide();
                    $("#rings").hide();
                    $("#vault").show();
                    $("#pbars").hide();
                    $("#highbar").hide();
                    break;
                case "PB":
                    $("#floor").hide();
                    $("#pommel").hide();
                    $("#Mushroom").hide();
                    $("#rings").hide();
                    $("#vault").hide();
                    $("#pbars").show();
                    $("#highbar").hide();
                    break;
                case "HB":
                    $("#floor").hide();
                    $("#pommel").hide();
                    $("#Mushroom").hide();
                    $("#rings").hide();
                    $("#vault").hide();
                    $("#pbars").hide();
                    $("#highbar").show();
                    break;
                default:
                    break;
            }
            $("#skill-box").show();
            $(".item").css("flex", "1");
        });
    $("#close-button").click(function () {
        $("#skill-box").hide();
        $("#floor").hide();
        $("#mushroom").hide();
        $("#pommel").hide();
        $("#rings").hide();
        $("#vault").hide();
        $("#pbars").hide();
        $("#highbar").hide();
        $("#item-1").css("flex", "0 0 100%");
    });

    $(".delete-skill-button")
        .off()
        .on("click", function () {
            var $table = $(this).closest("table");
            var $skillRows = $table.find("tr.skill-odd-row, tr.skill-even-row");
            var rowCount = $skillRows.length;

            console.log("Total skill rows:", rowCount);
            $skillRows.each(function (index, row) {
                console.log("Row", index, $(row).html());
            });


            if (rowCount > 10) {
                // Remove the last row if there are more than 10 skill rows
                $skillRows.last().remove();
            } else {
                // Clear the contents of the last non-empty row
                let cleared = false;
                for (let i = rowCount; i >= 0; i--) {
                    let $cells = $skillRows.eq(i).find("td");
                    let isEmpty = $cells.filter(function () {
                        return $(this).text().trim() !== "";
                    }).length === 0;

                    if (!isEmpty) {
                        $cells.each(function () {
                            $(this).text("");
                        });
                        cleared = true;
                        break;
                    }
                }
                if (!cleared) {
                    console.log("No row to clear");
                }
            }
        });



    $(".calculate-score-button")
    .off()
    .on("click", function () {
        // Find the routine-table this button belongs to
        const routineTable = $(this).closest(".routine-table");

        // Extract the level and event from the header
        const headerText = routineTable.find(".header-row th").first().text().trim();
        console.log("Header text:", headerText); // Debugging log

        const match = headerText.match(/Level (\d+) (.+) Routine/);
        if (!match) {
            console.error("Failed to parse level and event from header text:", headerText);
            return; // Stop execution if parsing fails
        }

        const level = parseInt(match[1], 10); // Extract the level
        const event = match[2].trim(); // Extract the event
        console.log("Parsed level:", level); // Debugging log
        console.log("Parsed event:", event); // Debugging log

        // Gather skill data
        const skills = [];
        routineTable.find("tr.skill-even-row, tr.skill-odd-row").each(function (index) {
            const skillName = $(this).find("td").eq(0).text().trim();
            const difficulty = parseFloat($(this).find("td").eq(1).text().trim()) || null;
            const elementGroup = parseInt($(this).find("td").eq(2).text().trim()) || null;

            if (skillName || difficulty || elementGroup) {
                skills.push({
                    name: skillName || null,
                    value: difficulty || 0,
                    element_group: elementGroup || 0,
                    position: index + 1, // Maintain skill order
                });
            }
        });

        // Debugging log for skills
        console.log("Skills collected:", skills);

        // Prepare the data payload
        const payload = {
            level: parseInt(level),
            event: event,
            skills: skills,
        };

        // Send data to the API
        $.ajax({
            url: "/calculate-score", // Adjust the endpoint URL as needed
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function (response) {
                alert(
                    "Exercise Presentation: " + response.exercisepresentation + "\n" +
                    "Element Group Total: " + response.elementgrouptotal + "\n" +
                    "Difficulty Total: " + response.difficultytotal + "\n" + 
                    "Total Score: " + response.totalscore 
                  );
            },
            error: function (error) {
                alert("Error calculating score: " + error.responseJSON.error);
            },
        });
    });

    $(".save-routine-button")
        .off()
        .on("click", function () {
        
            // Find the routine-table this button belongs to
            const routineTable = $(this).closest(".routine-table");

            // Extract the level and event from the header
            const headerText = routineTable.find(".header-row th").first().text().trim();
            console.log("Header text:", headerText); // Debugging log

            const match = headerText.match(/Level (\d+) (.+) Routine/);
            if (!match) {
                console.error("Failed to parse level and event from header text:", headerText);
                return; // Stop execution if parsing fails
            }

            const level = parseInt(match[1], 10); // Extract the level
            const event = match[2].trim(); // Extract the event
            console.log("Parsed level:", level); // Debugging log
            console.log("Parsed event:", event); // Debugging log

            // Gather skill data
            const skills = [];
            routineTable.find("tr.skill-even-row, tr.skill-odd-row").each(function (index) {
                const skillName = $(this).find("td").eq(0).text().trim();
                const difficulty = parseFloat($(this).find("td").eq(1).text().trim()) || null;
                const elementGroup = parseInt($(this).find("td").eq(2).text().trim()) || null;

                if (skillName || difficulty || elementGroup) {
                    skills.push({
                        name: skillName || null,
                        value: difficulty || 0,
                        element_group: elementGroup || 0,
                        position: index + 1, // Maintain skill order
                    });
                }
            });

            // Debugging log for skills
            console.log("Skills collected:", skills);
    
            // Prepare the data payload
            const payload = {
                name: routineName,
                level: parseInt(level),
                event: event,
                skills: skills,
            };
    
            // Send data to the API
            $.ajax({
                url: "/save-routine", // Adjust the endpoint URL as needed
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(payload),
                success: function (response) {
                    console.log("Routine saved successfully:", response);
                    alert("Routine saved!");
                },
                error: function (xhr, status, error) {
                    console.error("Error saving routine:", xhr.responseText);
                    alert("Failed to save routine.");
                },
            });
    });
    

    $(document)
        .off("click", ".skill-entry")
        .on("click", ".skill-entry", function () {
            const skillName = $(this).find("td").eq(0).text();
            const skillDifficulty = $(this).find("td").eq(1).text();
            const skillElementGroup = $(this).find("td").eq(2).text();
            addSkill(skillName, skillDifficulty, skillElementGroup);
            $("#routine-tables-container").show();
        });

    document.getElementById('closePopup').addEventListener('click', function() {
        document.getElementById('popupOverlay').style.display = 'none';
    });

    document.getElementById('popupOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
}

// Function to reset button colors
function resetButtonColors() {
    $(".level-button").removeClass("active");
    $(".event-button").removeClass("active");
    selectedLevel = null;
    selectedEvent = null;
    $("#submit-routine-request").hide();
}

// Toggle exploded view button 
// document.getElementById('toggleButton').addEventListener('click', function () {
//     const container = document.getElementById('routine-tables-container');
//     container.classList.toggle('vertical');
//     container.classList.toggle('grid');
// });

function loadLargeDiv() {
    fetch('/load-skills-table')
        .then(response => response.text())
        .then(data => {
            document.getElementById('large-table-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading the large table', error))
}

(function () {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
        })
    })()

$(document).ready(function () {
    console.log("JQuery loaded");

    // Event listener for add routine button
    // $("#add-routine-button").on("click", function () {
    //     $("#routine-tables-container").hide();
    //     $("#skill-table-container").hide();
    //     $("#add-routine-table-container").show();
    // });

    let selectedLevel = null;
    let selectedEvent = null;

    // Function to update the submit button text
    function updateSubmitButton() {
        if (selectedLevel && selectedEvent) {
            $("#submit-routine-request").text(
                `Create Level ${selectedLevel} ${selectedEvent} routine table`
            );
            $("#submit-routine-request").show();
        }
    }

    // Event listener for level buttons
    $(".level-button").click(function () {
        $(".level-button").removeClass("active");
        $(this).addClass("active");
        selectedLevel = $(this).text();
        updateSubmitButton();
    });

    // Event listener for event buttons
    $(".event-button").click(function () {
        $(".event-button").removeClass("active");
        $(this).addClass("active");
        selectedEvent = $(this).text();
        updateSubmitButton();
    });

    // Event listener for submit routine request button
    $("#submit-routine-request").click(function () {
        if (selectedLevel && selectedEvent) {
            console.log(selectedEvent);
            console.log(selectedLevel);
            if (
                selectedEvent == "PH" &&
                (selectedLevel == "Level 4" || selectedLevel == "Level 5")
            ) {
                createRoutineTable(selectedLevel, "Mushroom");     
            } else {
                createRoutineTable(selectedLevel, selectedEvent);
            }
            $("#routine-tables-container").show();
            $("#add-routine-table-container").hide();
            resetButtonColors();
        }
    });

    // Event listener for delete routine button
    // $("#delete-routine-button").click(function () {
    //     let first = $("#routine-tables-container table:first");
    //     let last = $("#routine-tables-container table:last");
    //     if (first[0] !== last[0]) {
    //         last.remove();
    //     } else {
    //         console.log("Cannot delete the last routine table.");
    //     }
    // });

    

    attachEventListeners();
    loadLargeDiv();
});


