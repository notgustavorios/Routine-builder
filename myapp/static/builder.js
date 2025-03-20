// GLOABAL VARIABLES
let editingRow = null; // Track which row is being edited   

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

// Function to add a skill row to the current routine table
function addSkill(_name, _difficulty, _elementGroup) {
    const routineTable = $('.routine-table');
    // Find the first empty row
    const emptyRow = routineTable.find("tr.skill-odd-row, tr.skill-even-row").filter(function() {
        return $(this).find('td').first().text().trim() === '';
    }).first();

    if (emptyRow.length > 0) {
        // If we found an empty row, fill it
        emptyRow.find('td').eq(0).text(_name);
        emptyRow.find('td').eq(1).text(_difficulty);
        emptyRow.find('td').eq(2).text(_elementGroup);
        return true;
    } else {
        // No empty row found, create a new one
        const allSkillRows = routineTable.find("tr.skill-odd-row, tr.skill-even-row");
        const isEven = allSkillRows.length % 2 === 0;
        const rowClass = isEven ? 'skill-even-row' : 'skill-odd-row';
        
        // Create new row with the appropriate class
        const newRow = $('<tr>').addClass(rowClass)
            .append($('<td>').text(_name))
            .append($('<td>').text(_difficulty))
            .append($('<td>').text(_elementGroup));
        
        // Insert before the add-row
        routineTable.find('.add-row').before(newRow);
        return true;
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
    return new Promise((resolve) => {
        var newTable = $("<table class='skill-table'></table>");
        
        // Map the event name for the API call
        const eventMap = {
            'FX': 'floor',
            'PH': 'pommel',
            'Mushroom': 'Mushroom',
            'SR': 'rings',
            'VT': 'vault',
            'PB': 'pbars',
            'HB': 'highbar'
        };
        
        // Map the event name for the API call
        const apiEvent = eventMap[event] || event;
        
        // Fetch element group names
        $.get(`/routines/element-groups?event=${apiEvent}`)
            .done(function(elementGroups) {
                const groupName = elementGroups[elementGroup] || 'Super Skills Chart';
                
                // First append the headers
                newTable.append(
                    "<tr><th colspan='3'>" +
                    event +
                    " -- " +
                    groupName +
                    " -- GRP " +
                    toRomanNumeral(elementGroup) +
                    "</th></tr>"
                );
                newTable.append(
                    "<tr><th>Skill</th><th>Difficulty</th><th>Element Group</th></tr>"
                );
                
                // Add the table to the container
                $("#skill-table-container").append(newTable);
                
                // Resolve with the table for further use
                resolve(newTable);
            })
            .fail(function() {
                // Fallback to original behavior if API call fails
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
                
                // Add the table to the container
                $("#skill-table-container").append(newTable);
                
                // Resolve with the table for further use
                resolve(newTable);
            });
    });
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
            // Get the level and event from the routine table header
            const headerText = $(row).closest('.routine-table').find("th").first().text();
            const match = headerText.match(/Level (\d+) (.+) Routine/);
            if (!match) {
                console.error("Could not parse level and event from header");
                return;
            }
            
            const level = parseInt(match[1]);
            const event = match[2].trim();
            
            // Show skill selection interface
            $("#skill-box").show();
            $(".item").css("flex", "1");
            
            // Load skills for this event and level
            loadSkillsForEvent(level, event);
            
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

// Function to reset button colors
function resetButtonColors() {
    $(".level-button").removeClass("active");
    $(".event-button").removeClass("active");
    selectedLevel = null;
    selectedEvent = null;
    $("#submit-routine-request").hide();
}

// Function to load skills for a specific event and level
function loadSkillsForEvent(level, event) {
    const container = document.getElementById("large-table-container");
    
    // Clear the container and make it visible
    container.innerHTML = '';
    container.style.display = 'block';
    
    // Make the dataTable div
    const dataTable = document.createElement('div');
    dataTable.id = 'dataTable';
    container.appendChild(dataTable);

    // Create a div to hold the skill tables
    const skillTableContainer = document.createElement('div');
    skillTableContainer.id = 'skill-table-container';
    dataTable.appendChild(skillTableContainer);
    
    // Event mapping for API calls
    const eventMap = {
        'FX': 'floor',
        'PH': 'pommel',
        'Mushroom': 'Mushroom',
        'SR': 'rings',
        'VT': 'vault',
        'PB': 'pbars',
        'HB': 'highbar'
    };
    
    // Map the event name for the API call
    const apiEvent = eventMap[event] || event;

    const eventNameContainer = document.createElement('div');   
    eventNameContainer.id = 'api-event-name';
    dataTable.appendChild(eventNameContainer);

    // Add the close button to the container
    closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'Close';
    dataTable.appendChild(closeButton);

    // Fetch skills from the API
    $.get(`/routines/skills?level=${level}&event=${apiEvent}`)
        .done(function(response) {
            const skills = response.skills;
            
            // Group skills by element group
            const skillsByGroup = {};
            skills.forEach(skill => {
                if (!skillsByGroup[skill.element_group]) {
                    skillsByGroup[skill.element_group] = [];
                }
                skillsByGroup[skill.element_group].push(skill);
            });
            
            // Create tables for each element group
            Object.keys(skillsByGroup).sort().forEach(groupNum => {
                const groupSkills = skillsByGroup[groupNum];
                createTable(event, parseInt(groupNum)).then(table => {
                    // Add skills to the table
                    groupSkills.forEach(skill => {
                        const row = $("<tr class='skill-entry'></tr>");
                        row.append(`<td>${skill.name}</td>`);
                        row.append(`<td>${skill.value.toFixed(1)}</td>`);
                        row.append(`<td>${skill.element_group}</td>`);
                        
                        // Add data attributes for when skill is selected
                        row.attr('data-skill-id', skill.id);
                        row.attr('data-skill-name', skill.name);
                        row.attr('data-element-group', skill.element_group);
                        row.attr('data-value', skill.value);
                        
                        table.append(row);
                    });
                });
            });
            
            // Show the skill table container
            $("#skill-table-container").show();
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Failed to fetch skills:', errorThrown);
            alert('Failed to load skills. Please try again.');
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

// Main event delegation setup
document.addEventListener('DOMContentLoaded', () => {
    // Initialize state
    let selectedLevel = null;
    let selectedEvent = null;

    // Helper function to update submit button text
    function updateSubmitButton() {
        const submitBtn = document.getElementById('submit-routine-request');
        if (selectedLevel && selectedEvent) {
            submitBtn.textContent = `Create Level ${selectedLevel} ${selectedEvent} routine table`;
            submitBtn.style.display = 'block';
        }
    }

    // Helper function to parse routine header
    function parseRoutineHeader(headerElement) {
        const headerText = headerElement.textContent.trim();
        const match = headerText.match(/Level (\d+) (.+) Routine/);
        if (!match) {
            console.error('Could not parse level and event from header:', headerText);
            return null;
        }
        return {
            level: parseInt(match[1]),
            event: match[2].trim()
        };
    }

    // Global click event delegation
    document.addEventListener('click', e => {
        // Level button clicks
        if (e.target.matches('.level-button')) {
            document.querySelectorAll('.level-button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            selectedLevel = e.target.textContent;
            updateSubmitButton();
        }

        // Event button clicks
        if (e.target.matches('.event-button')) {
            document.querySelectorAll('.event-button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            selectedEvent = e.target.textContent;
            updateSubmitButton();
        }

        // Submit routine request
        if (e.target.matches('#submit-routine-request') && selectedLevel && selectedEvent) {
            const event = (selectedEvent === 'PH' && ['Level 4', 'Level 5'].includes(selectedLevel)) 
                ? 'Mushroom' 
                : selectedEvent;
            createRoutineTable(selectedLevel, event);
            
            // Use jQuery to ensure the display changes are applied
            $('#routine-tables-container').show();
            $('#add-routine-table-container').hide();
            
            resetButtonColors();
        }

        // Add skill button
        if (e.target.matches('.add-skill-button')) {
            const routineTable = e.target.closest('.routine-table');
            const header = routineTable.querySelector('th');
            const routineInfo = parseRoutineHeader(header);
            if (!routineInfo) return;

            document.getElementById('skill-box').style.display = 'block';
            document.querySelectorAll('.item').forEach(item => item.style.flex = '1');
            loadSkillsForEvent(routineInfo.level, routineInfo.event);
        }

        // Close button
        if (e.target.matches('.close-button')) {
            document.getElementById('large-table-container').style.display = 'none';
            document.getElementById('item-1').style.flex = '1';
            document.getElementById('skill-box').style.flex = '0';
        }

        // Delete skill button
        if (e.target.matches('.delete-skill-button')) {
            const table = e.target.closest('table');
            const rows = Array.from(table.querySelectorAll('tr.skill-odd-row, tr.skill-even-row'));
            const lastFilledRow = rows.reverse().find(row => 
                row.querySelector('td').textContent.trim() !== ''
            );
            if (lastFilledRow) {
                lastFilledRow.querySelectorAll('td').forEach(td => td.textContent = '');
            }
        }

        // Calculate score button
        if (e.target.matches('.calculate-score-button')) {
            const routineTable = e.target.closest('.routine-table');
            const header = routineTable.querySelector('.header-row th');
            const routineInfo = parseRoutineHeader(header);
            if (!routineInfo) return;

            const skills = Array.from(routineTable.querySelectorAll('tr.skill-even-row, tr.skill-odd-row'))
                .map((row, index) => {
                    const cells = row.querySelectorAll('td');
                    const skillName = cells[0].textContent.trim();
                    const difficulty = parseFloat(cells[1].textContent.trim()) || null;
                    const elementGroup = parseInt(cells[2].textContent.trim()) || null;

                    if (skillName || difficulty || elementGroup) {
                        return {
                            name: skillName || null,
                            value: difficulty || 0,
                            element_group: elementGroup || 0,
                            position: index + 1
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            fetch('/scoring/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    level: routineInfo.level, 
                    event: routineInfo.event, 
                    skills 
                })
            })
            .then(response => response.json())
            .then(data => {
                alert(
                    `Exercise Presentation: ${data.exercisepresentation}\n` +
                    `Element Group Total: ${data.elementgrouptotal}\n` +
                    `Difficulty Total: ${data.difficultytotal}\n` +
                    `Total Score: ${data.totalscore}`
                );
            })
            .catch(error => alert('Error calculating score: ' + error));
        }

        // Save routine button
        if (e.target.matches('.save-routine-button')) {
            const routineTable = e.target.closest('.routine-table');
            const header = routineTable.querySelector('.header-row th');
            const routineInfo = parseRoutineHeader(header);
            if (!routineInfo) return;

            document.getElementById('routineLevel').value = `Level ${routineInfo.level}`;
            document.getElementById('routineEvent').value = routineInfo.event;
            document.getElementById('popupOverlay').style.display = 'block';
        }

        // Close popup
        if (e.target.matches('#closePopup')) {
            document.getElementById('popupOverlay').style.display = 'none';
        }

        // Popup overlay click
        if (e.target.matches('#popupOverlay')) {
            e.target.style.display = 'none';
        }

        // Skill entry click
        if (e.target.closest('.skill-entry')) {
            const row = e.target.closest('.skill-entry');
            const skillData = {
                name: row.getAttribute('data-skill-name'),
                value: parseFloat(row.getAttribute('data-value')).toFixed(1),
                elementGroup: row.getAttribute('data-element-group')
            };

            if (editingRow) {
                // Update the editing row with the selected skill
                $(editingRow).find('td').eq(0).text(skillData.name);
                $(editingRow).find('td').eq(1).text(skillData.value);
                $(editingRow).find('td').eq(2).text(skillData.elementGroup);
                $(editingRow).removeClass('editing-row');   
                editingRow = null;
            } else {
                // Add the skill using the addSkill function
                addSkill(skillData.name, skillData.value, skillData.elementGroup);
            }
        }

        // Empty skill row click
        if (e.target.closest('.routine-table tr.skill-odd-row, .routine-table tr.skill-even-row')) {
            const row = e.target.closest('tr');
            if (row.querySelector('td').textContent.trim() !== '') return;

            const header = row.closest('table').querySelector('th');
            const routineInfo = parseRoutineHeader(header);
            if (!routineInfo) return;

            document.getElementById('skill-box').style.display = 'block';
            document.querySelectorAll('.item').forEach(item => item.style.flex = '1');
            loadSkillsForEvent(routineInfo.level, routineInfo.event);
        }
    });

    // Context menu event delegation
    document.addEventListener('contextmenu', e => {
        const row = e.target.closest('.routine-table tr.skill-odd-row, .routine-table tr.skill-even-row');
        if (!row) return;

        e.preventDefault();
        const skillText = row.querySelector('td').textContent.trim();
        if (skillText) {
            createContextMenu(e.clientX, e.clientY, row);
        }
    });

    // Form submission handling
    document.getElementById('routineForm')?.addEventListener('submit', e => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('routineName').value.trim(),
            level: document.getElementById('routineLevel').value.replace('Level ', ''),
            event: document.getElementById('routineEvent').value
        };

        if (!formData.name || !formData.level || !formData.event) {
            alert('Please fill out all form fields properly.');
            return;
        }

        const skills = Array.from(document.querySelectorAll('.routine-table:not([style*="display: none"]) tr.skill-even-row, .routine-table:not([style*="display: none"]) tr.skill-odd-row'))
            .map((row, index) => {
                const cells = row.querySelectorAll('td');
                const skillName = cells[0].textContent.trim();
                const difficulty = parseFloat(cells[1].textContent.trim()) || null;
                const elementGroup = parseInt(cells[2].textContent.trim()) || null;

                if (skillName || difficulty || elementGroup) {
                    return {
                        name: skillName || null,
                        value: difficulty || 0,
                        element_group: elementGroup || 0,
                        position: index + 1
                    };
                }
                return null;
            })
            .filter(Boolean);

        fetch('/routines/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.name,
                level: parseInt(formData.level),
                event: formData.event,
                skills
            })
        })
        .then(response => response.json())
        .then(() => {
            alert('Routine saved successfully!');
            document.getElementById('popupOverlay').style.display = 'none';
        })
        .catch(error => {
            console.error('Error saving routine:', error);
            alert('Failed to save routine.');
        });
    });
});
