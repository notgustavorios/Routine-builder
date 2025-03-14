function searchTable() {
    const input = document.getElementById("searchBar").value.toLowerCase();
    const table = document.getElementById("dataTable");
    const rows = Array.from(table.getElementsByTagName("tr")).slice(1); // Exclude the header row

    // If input is empty, display all rows
    if (input === "") {
        rows.forEach((row) => (row.style.display = ""));
        return;
    }

    // Filter rows based on the input
    const filteredRows = rows.filter((row) => {
        const cells = row.getElementsByTagName("td");
        return Array.from(cells).some((cell) =>
            cell.textContent.toLowerCase().includes(input)
        );
    });

    // Sort rows by the closest match (simplified to sort by number of matched cells)
    filteredRows.sort((a, b) => {
        const aMatchCount = Array.from(a.getElementsByTagName("td")).filter(
            (cell) => cell.textContent.toLowerCase().includes(input)
        ).length;
        const bMatchCount = Array.from(b.getElementsByTagName("td")).filter(
            (cell) => cell.textContent.toLowerCase().includes(input)
        ).length;
        return bMatchCount - aMatchCount;
    });

    // Hide all rows initially
    rows.forEach((row) => (row.style.display = "none"));

    // Display the closest three matches
    filteredRows.slice(0, 3).forEach((row) => (row.style.display = ""));

    // Display the rest of the rows after the closest three
    filteredRows.slice(3).forEach((row) => (row.style.display = ""));
}

let currentRoutineTable = null;
let editingRow = null; // Track which row is being edited

// Function to add a skill row to the current routine table
function addSkill(_name, _difficulty, _elementGroup) {
    // Find the first empty row
    const emptyRow = currentRoutineTable.find("tr.skill-odd-row, tr.skill-even-row").filter(function() {
        return $(this).find('td').first().text().trim() === '';
    }).first();

    if (emptyRow.length > 0) {
        // If we found an empty row, fill it
        emptyRow.find('td').eq(0).text(_name);
        emptyRow.find('td').eq(1).text(_difficulty);
        emptyRow.find('td').eq(2).text(_elementGroup);
    } else {
        // No empty row found, create a new one
        const allSkillRows = currentRoutineTable.find("tr.skill-odd-row, tr.skill-even-row");
        const isEven = allSkillRows.length % 2 === 0;
        const rowClass = isEven ? 'skill-even-row' : 'skill-odd-row';
        
        // Create new row with the appropriate class
        const newRow = $('<tr>').addClass(rowClass)
            .append($('<td>').text(_name))
            .append($('<td>').text(_difficulty))
            .append($('<td>').text(_elementGroup));
        
        // Insert the new row before the add-row (which contains the buttons)
        currentRoutineTable.find('.add-row').before(newRow);
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
    const routineName = document.getElementById("routineName").value.trim();
    const level = document.getElementById("routineLevel").value;
    const event = document.getElementById("routineEvent").value;
    return { routineName, level, event };
}

// Function to create a context menu for skill editing
function createContextMenu(x, y, row) {
    // Remove any existing context menus
    $('.context-menu').remove();
    
    // If we're currently editing and right-clicked on the same row, show cancel option
    if (editingRow === row) {
        const contextMenu = $('<div></div>')
            .addClass('context-menu')
            .css({
                position: 'fixed',
                left: x + 'px',
                top: y + 'px',
                zIndex: 1000
            });
        
        const cancelItem = $('<div>Cancel Edit</div>')
            .addClass('context-menu-item')
            .click(function(e) {
                e.stopPropagation();
                $(editingRow).removeClass('editing-row');
                editingRow = null;
                $('.context-menu').remove();
                $("#skill-box").hide();
                $("#floor, #pommel, #Mushroom, #rings, #vault, #pbars, #highbar").hide();
            });
        
        contextMenu.append(cancelItem);
        $('body').append(contextMenu);
        return;
    }
    
    // Create and append the new context menu
    const contextMenu = $('<div></div>')
        .addClass('context-menu')
        .css({
            position: 'fixed',
            left: x + 'px',
            top: y + 'px',
            zIndex: 1000
        });
    
    const editItem = $('<div>Edit Skill</div>')
        .addClass('context-menu-item')
        .click(function(e) {
            e.stopPropagation();
            // Remove highlight from any previously edited row
            $('.editing-row').removeClass('editing-row');
            // Add highlight to current row
            $(row).addClass('editing-row');
            editingRow = row;
            currentRoutineTable = $(row).closest('table');
            // Show skill selection interface
            $("#skill-table-container").show();
            
            // Show appropriate skill table based on the event
            const headerText = currentRoutineTable.find("th").first().text();
            const event = headerText.split(" ")[2];
            
            // Hide all skill tables first
            $("#floor, #pommel, #Mushroom, #rings, #vault, #pbars, #highbar").hide();
            
            // Show the appropriate skill table
            switch(event) {
                case "FX": $("#floor").show(); break;
                case "PH": $("#pommel").show(); break;
                case "Mushroom": $("#Mushroom").show(); break;
                case "SR": $("#rings").show(); break;
                case "VT": $("#vault").show(); break;
                case "PB": $("#pbars").show(); break;
                case "HB": $("#highbar").show(); break;
            }
            
            $("#skill-box").show();
            $(".item").css("flex", "1");
            $('.context-menu').remove();
        });

    const deleteItem = $('<div>Delete Skill</div>')
        .addClass('context-menu-item')
        .hover(
            function() {
                // Mouse enter
                $(row).addClass('delete-highlight');
            },
            function() {
                // Mouse leave
                $(row).removeClass('delete-highlight');
            }
        )
        .click(function(e) {
            e.stopPropagation();
            // Clear the contents of the row
            $(row).find('td').each(function() {
                $(this).text('');
            });
            $(row).removeClass('delete-highlight');
            $('.context-menu').remove();
        });
    
    contextMenu.append(editItem);
    contextMenu.append(deleteItem);
    $('body').append(contextMenu);
    
    // Close context menu when clicking outside
    $(document).one('click', function() {
        $('.context-menu').remove();
        $(row).removeClass('delete-highlight'); // Remove delete highlight if menu is closed
    });
}

// Function to attach event listeners to buttons
function attachEventListeners() {
    /* Event listeners attached:
     * 1. add-skill-button: Shows skill selection interface for adding new skills
     * 3. delete-skill-button: Removes the last filled skill from routine
     * 4. calculate-score-button: Calculates and displays routine score
     * 5. save-routine-button: Opens save routine popup dialog
     * 6. Right-click context menu on skill rows: For editing/deleting skills
     * 7. skill-entry click: Handles adding new skills or updating edited skills
     * 8. closePopup button: Closes the popup overlay
     * 9. popupOverlay click: Closes popup when clicking outside
     * 10. Routine table skill row clicks: Shows skill selection for empty rows
     */
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
    $(".close-button")
        .off()
        .on("click", function () {
            console.log("close button clicked");
            $("#skill-box").hide();
            $("#floor, #pommel, #Mushroom, #rings, #vault, #pbars, #highbar").hide();
            $("#item-1").css("flex", "1");
            $("#skill-box").css("flex", "0");
        });

    $(".delete-skill-button")
        .off()
        .on("click", function () {
            // Find the last non-empty row
            const lastFilledRow = currentRoutineTable
                .find("tr.skill-odd-row, tr.skill-even-row")
                .filter(function() {
                    return $(this).find('td').first().text().trim() !== '';
                })
                .last();

            // Only clear if we found a row with content
            if (lastFilledRow.length > 0) {
                lastFilledRow.find('td').each(function() {
                    $(this).text('');
                });
            }
        });

    $(".calculate-score-button")
        .off()
        .on("click", function () {
            // Find the routine-table this button belongs to
            const routineTable = $(this).closest(".routine-table");

            // Extract the level and event from the header
            const headerText = routineTable
                .find(".header-row th")
                .first()
                .text()
                .trim();
            console.log("Header text:", headerText); // Debugging log

            const match = headerText.match(/Level (\d+) (.+) Routine/);
            if (!match) {
                console.error(
                    "Failed to parse level and event from header text:",
                    headerText
                );
                return; // Stop execution if parsing fails
            }

            const level = parseInt(match[1], 10); // Extract the level
            const event = match[2].trim(); // Extract the event
            console.log("Parsed level:", level); // Debugging log
            console.log("Parsed event:", event); // Debugging log

            // Gather skill data
            const skills = [];
            routineTable
                .find("tr.skill-even-row, tr.skill-odd-row")
                .each(function (index) {
                    const skillName = $(this).find("td").eq(0).text().trim();
                    const difficulty =
                        parseFloat($(this).find("td").eq(1).text().trim()) || null;
                    const elementGroup =
                        parseInt($(this).find("td").eq(2).text().trim()) || null;

                    if (skillName || difficulty || elementGroup) {
                        skills.push({
                            name: skillName || null,
                            value: difficulty || 0,
                            element_group: elementGroup || 0,
                            position: index + 1, // Maintain skill order
                        });
                    }
                });

            // Prepare the data payload
            const payload = {
                level: parseInt(level),
                event: event,
                skills: skills,
            };

            // Send data to the API
            $.ajax({
                url: "/scoring/calculate", 
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(payload),
                success: function (response) {
                    alert(
                        "Exercise Presentation: " +
                        response.exercisepresentation +
                        "\n" +
                        "Element Group Total: " +
                        response.elementgrouptotal +
                        "\n" +
                        "Difficulty Total: " +
                        response.difficultytotal +
                        "\n" +
                        "Total Score: " +
                        response.totalscore
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
            // find the routine table
            const routineTable = $(this).closest(".routine-table");

            // extract level and event from the header
            const headerText = routineTable
                .find(".header-row th")
                .first()
                .text()
                .trim();
            const match = headerText.match(/Level (\d+) (.+) Routine/);

            if (!match) {
                console.error("couldn't parse level and event. nice job.");
                return;
            }

            const level = match[1];
            const event = match[2].trim();

            // auto-populate the form
            $("#routineLevel").val(`Level ${level}`);
            $("#routineEvent").val(event);

            // show the popup
            $("#popupOverlay").show();
        });

    // Remove any existing context menu event handlers
    $(document).off('contextmenu', '.routine-table tr.skill-odd-row, .routine-table tr.skill-even-row');
    
    // Add right-click event handler to skill rows
    $(document).on('contextmenu', '.routine-table tr.skill-odd-row, .routine-table tr.skill-even-row', function(e) {
        e.preventDefault(); // Prevent default right-click menu
        const skillText = $(this).find('td').first().text().trim();
        if (skillText !== '') { // Only show context menu if row has a skill
            createContextMenu(e.clientX, e.clientY, this);
        }
    });

    // Modify the skill-entry click handler to handle both adding and editing
    $(document).off('click', '.skill-entry').on('click', '.skill-entry', function() {
        const skillName = $(this).find('td').eq(0).text();
        const skillDifficulty = $(this).find('td').eq(1).text();
        const skillElementGroup = $(this).find('td').eq(2).text();
        
        if (editingRow) {
            // If we're editing, update the existing row
            $(editingRow).find('td').eq(0).text(skillName);
            $(editingRow).find('td').eq(1).text(skillDifficulty);
            $(editingRow).find('td').eq(2).text(skillElementGroup);
            $(editingRow).removeClass('editing-row'); // Remove highlight
            editingRow = null; // Reset editing state
        } else {
            // Otherwise add as a new skill
            addSkill(skillName, skillDifficulty, skillElementGroup);
        }
    });

    document.getElementById("closePopup").addEventListener("click", function () {
        document.getElementById("popupOverlay").style.display = "none";
    });

    document
        .getElementById("popupOverlay")
        .addEventListener("click", function (e) {
            if (e.target === this) {
                this.style.display = "none";
            }
        });

    // Add click handler for skill rows
    $(document).off('click', '.routine-table tr.skill-odd-row, .routine-table tr.skill-even-row').on('click', '.routine-table tr.skill-odd-row, .routine-table tr.skill-even-row', function(e) {
        // Don't trigger if clicking on a row that already has a skill
        if ($(this).find('td').first().text().trim() !== '') {
            return;
        }
        
        currentRoutineTable = $(this).closest('table');
        $("#skill-table-container").show();

        const headerText = $(this).closest('.routine-table').find("th").first().text();
        const event = headerText.split(" ")[2];
        
        // Hide all skill tables first
        $("#floor, #pommel, #Mushroom, #rings, #vault, #pbars, #highbar").hide();
        
        // Show the appropriate skill table
        switch(event) {
            case "FX": $("#floor").show(); break;
            case "PH": $("#pommel").show(); break;
            case "Mushroom": $("#Mushroom").show(); break;
            case "SR": $("#rings").show(); break;
            case "VT": $("#vault").show(); break;
            case "PB": $("#pbars").show(); break;
            case "HB": $("#highbar").show(); break;
        }
        
        $("#skill-box").show();
        $(".item").css("flex", "1");
    });
}

$("#routineForm").on("submit", function (e) {
    e.preventDefault(); // stop your form from causing a page reload, rookie.

    const routineName = $("#routineName").val().trim();
    const level = $("#routineLevel").val().replace("Level ", ""); // parse out the number
    const event = $("#routineEvent").val();

    if (!routineName || !level || !event) {
        alert("fill out the form properly, genius.");
        return;
    }

    // collect skills
    const skills = [];
    $(".routine-table:visible")
        .find("tr.skill-even-row, tr.skill-odd-row")
        .each(function (index) {
            const skillName = $(this).find("td").eq(0).text().trim();
            const difficulty =
                parseFloat($(this).find("td").eq(1).text().trim()) || null;
            const elementGroup =
                parseInt($(this).find("td").eq(2).text().trim()) || null;

            if (skillName || difficulty || elementGroup) {
                skills.push({
                    name: skillName || null,
                    value: difficulty || 0,
                    element_group: elementGroup || 0,
                    position: index + 1,
                });
            }
        });

    // prepare payload
    const payload = {
        name: routineName,
        level: parseInt(level, 10),
        event: event,
        skills: skills,
    };

    // send the data
    $.ajax({
        url: "/routines/save",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload),
        success: function (response) {
            console.log("routine saved successfully:", response);
            alert("routine saved!");
            $("#popupOverlay").hide();
        },
        error: function (xhr, status, error) {
            console.error("error saving routine:", xhr.responseText);
            alert("failed to save routine.");
        },
    });
});
// Function to reset button colors
function resetButtonColors() {
    $(".level-button").removeClass("active");
    $(".event-button").removeClass("active");
    selectedLevel = null;
    selectedEvent = null;
    $("#submit-routine-request").hide();
}

function loadLargeDiv() {
    fetch("/routines/skills-table")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then((data) => {
            if (data) {
                const container = document.getElementById("large-table-container");
                container.innerHTML = data;
                // Append close button
                const closeButton = $('<button>', {
                    class: 'button close-button',
                    text: 'Close'
                });
                $(container).append(closeButton);
                
                // Immediately attach the event listener to the newly created button
                closeButton.click(function () {
                    console.log("close button clicked");
                    $("#skill-box").hide();
                    $("#floor, #pommel, #Mushroom, #rings, #vault, #pbars, #highbar").hide();
                    // Reset the flex properties of the grid items
                    $("#item-1").css("flex", "1");
                    $("#skill-box").css("flex", "0");
                });
            }
        })
        .catch((error) => {
            console.error("Error loading the large table:", error);
        });
}

(function () {
    "use strict";

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll(".needs-validation");

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms).forEach(function (form) {
        form.addEventListener(
            "submit",
            function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add("was-validated");
            },
            false
        );
    });
})();

$(document).ready(function () {
    console.log("JQuery loaded");

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

    loadLargeDiv();
    attachEventListeners();
    
});
