// GLOABAL VARIABLES
let editingRow = null; // Track which row is being edited   

// Global variable to store the skills data
let skillsData = null;

// Store previous values for comparison
let previousValues = {
    groups: {1: '0.0', 2: '0.0', 3: '0.0', 4: '0.0'},
    totalValue: '0.0',
    totalDifficulty: '0.0',
    remainingSkills: '8',
    figSkills: '0/0',
    remainingSuperSkills: '0',
    difficulty: '0.0',
    startScore: '0.0',
    finalScore: '0.0'
};

function searchTable() {
    const input = document.getElementById("searchBar").value.toLowerCase();
    const tables = document.querySelectorAll(".skill-table");

    tables.forEach(table => {
        const rows = Array.from(table.getElementsByTagName("tr"));
        const headerRows = rows.slice(0, 2); // Get the group header and column headers
        const skillRows = rows.slice(2); // Get only the skill rows

        // Always show the headers
        headerRows.forEach(row => row.style.display = "");

        // If input is empty, show all rows
        if (input === "") {
            skillRows.forEach(row => row.style.display = "");
            return;
        }

        // Filter and sort skill rows
        const filteredRows = skillRows.filter(row => {
            const cells = row.getElementsByTagName("td");
            return Array.from(cells).some(cell =>
                cell.textContent.toLowerCase().includes(input)
            );
        });

        // Sort rows by closest match
        filteredRows.sort((a, b) => {
            const aMatchCount = Array.from(a.getElementsByTagName("td")).filter(
                cell => cell.textContent.toLowerCase().includes(input)
            ).length;
            const bMatchCount = Array.from(b.getElementsByTagName("td")).filter(
                cell => cell.textContent.toLowerCase().includes(input)
            ).length;
            return bMatchCount - aMatchCount;
        });

        // Hide all skill rows first
        skillRows.forEach(row => row.style.display = "none");

        // Show filtered rows
        filteredRows.forEach(row => row.style.display = "");

        // If no skills match in this table, hide the entire table
        if (filteredRows.length === 0) {
            table.style.display = "none";
        } else {
            table.style.display = "";
        }
    });
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
        updateRealTimeScoring();
        makeRowsDraggable(); // Make the new row draggable
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
        updateRealTimeScoring();
        makeRowsDraggable(); // Make the new row draggable
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

// Function to load the skills JSON data
async function loadSkillsData() {
    // Try to get data and timestamp from localStorage
    const cachedData = localStorage.getItem('skillsData');
    const cachedTimestamp = localStorage.getItem('skillsDataTimestamp');
    
    if (cachedData && cachedTimestamp) {
        const oneWeek = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
        const now = new Date().getTime();
        
        // Check if the cached data is less than one week old
        if (now - parseInt(cachedTimestamp) < oneWeek) {
            skillsData = JSON.parse(cachedData);
            return skillsData;
        } else {
            // Data is older than one week, clear it
            localStorage.removeItem('skillsData');
            localStorage.removeItem('skillsDataTimestamp');
        }
    }
    
    // If not in localStorage or data is expired, fetch from server
    try {
        const response = await fetch('/static/skills.json');
        skillsData = await response.json();
        
        // Store in localStorage with current timestamp
        localStorage.setItem('skillsData', JSON.stringify(skillsData));
        localStorage.setItem('skillsDataTimestamp', new Date().getTime().toString());
        
        return skillsData;
    } catch (error) {
        console.error('Failed to load skills data:', error);
        return null;
    }
}

// Function to determine if a skill's difficulty is allowed for a given level
function isSkillAllowedForLevel(difficulty, level) {
    // All levels can do 0.0 difficulty skills
    if (difficulty === 0.0) return true;

    // Map of allowed FIG values per level
    const FIG_ALLOWED = {
        1: ['A'],
        2: ['A'],
        3: ['A'],
        4: ['A','B'],
        5: ['A','B'],
        6: ['A','B','C'],
        7: ['A','B','C'],
        8: ['A','B','C','D','E','F','G','H','I','J'],
        9: ['A','B','C','D','E','F','G','H','I','J'],
        10: ['A','B','C','D','E','F','G','H','I','J']
    };

    // Map of FIG values to difficulties
    const FIG_VALUES = {
        'A': 0.1,
        'B': 0.2,
        'C': 0.3,
        'D': 0.4,
        'E': 0.5,
        'F': 0.6,
        'G': 0.7,
        'H': 0.8,
        'I': 0.9,
        'J': 1.0
    };

    // Get allowed FIG values for this level
    const allowedFigs = FIG_ALLOWED[level] || [];
    
    // Convert difficulty to FIG letter
    const figLetter = Object.entries(FIG_VALUES).find(([_, value]) => value === difficulty)?.[0];
    
    // Check if the FIG letter is allowed for this level
    return figLetter && allowedFigs.includes(figLetter);
}

// Modified loadSkillsForEvent function
async function loadSkillsForEvent(level, event) {
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
    
    // Event mapping
    const eventMap = {
        'FX': 'floor',
        'PH': 'pommel',
        'Mushroom': 'Mushroom',
        'SR': 'rings',
        'VT': 'vault',
        'PB': 'pbars',
        'HB': 'highbar'
    };
    
    // Map the event name
    let apiEvent = eventMap[event] || event;

    // Special handling for Mushroom event based on level
    const levelNumber = typeof level === 'string' ? 
        parseInt(level.replace('Level ', '')) : 
        parseInt(level);

    if (event === 'Mushroom') {
        if (levelNumber === 1) {
            apiEvent = 'Level_1_Mushroom';
        } else if (levelNumber === 2 || levelNumber === 3) {
            apiEvent = 'Level_2_3_Mushroom';
        }
    }

    const eventNameContainer = document.createElement('div');   
    eventNameContainer.id = 'api-event-name';
    dataTable.appendChild(eventNameContainer);

    // Add the close button to the container
    closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = 'Close';
    dataTable.appendChild(closeButton);

    try {
        // Load the skills data
        const data = await loadSkillsData();
        if (!data || !data[apiEvent]) {
            throw new Error('No data available for this event');
        }

        const eventData = data[apiEvent];
        
        // Create tables for each element group
        for (const [groupKey, groupData] of Object.entries(eventData)) {
            // Filter skills based on level requirements
            const allowedSkills = groupData.skills.filter(skill => 
                isSkillAllowedForLevel(skill.difficulty, levelNumber)
            );
            
            // Skip empty groups
            if (allowedSkills.length === 0) continue;

            const elementGroup = allowedSkills[0]?.element_group;
            if (!elementGroup) continue;

            const table = await createTable(event, elementGroup);
            
            // Add skills to the table
            allowedSkills.forEach(skill => {
                const row = $("<tr class='skill-entry'></tr>");
                row.append(`<td>${skill.name}</td>`);
                row.append(`<td>${skill.difficulty.toFixed(1)}</td>`);
                row.append(`<td>${skill.element_group}</td>`);
                
                // Add data attributes for when skill is selected
                row.attr('data-skill-name', skill.name);
                row.attr('data-element-group', skill.element_group);
                row.attr('data-value', skill.difficulty);
                
                table.append(row);
            });
        }
        
        // Show the skill table container
        $("#skill-table-container").show();
        
    } catch (error) {
        console.error('Failed to load skills:', error);
        alert('Failed to load skills. Please try again.');
    }
}

// Modified createTable function to use proper element group names
function createTable(event, elementGroup) {
    return new Promise((resolve) => {
        var newTable = $("<table class='skill-table'></table>");
        
        // Map the event name to match the JSON structure
        const eventMap = {
            'FX': 'floor',
            'PH': 'pommel',
            'Mushroom': 'Mushroom',
            'SR': 'rings',
            'VT': 'vault',
            'PB': 'pbars',
            'HB': 'highbar'
        };
        
        const apiEvent = eventMap[event] || event;
        const eventData = skillsData[apiEvent];
        let groupName = "Skills";  // Default fallback
        
        // Find the group name by looking through each group's skills
        if (eventData) {
            for (const [groupKey, groupData] of Object.entries(eventData)) {
                // Check if any skills in this group match our element group number
                if (groupData && groupData.skills && groupData.skills.some(skill => skill.element_group === elementGroup)) {
                    groupName = groupData.name;
                    break;
                }
            }
        }
        
        // First append the headers
        newTable.append(
            "<tr><th colspan='3'>" + groupName + "</th></tr>"
        );
        newTable.append(
            "<tr><th>Skill</th><th>Difficulty</th><th>Element Group</th></tr>"
        );
        
        // Add the table to the container
        $("#skill-table-container").append(newTable);
        
        // Resolve with the table for further use
        resolve(newTable);
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
    
    // Initialize scoring immediately after creating table
    updateRealTimeScoring();
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
                hideSkillBox();
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
            $('.editing-row').removeClass('editing-row');
            $(row).addClass('editing-row');
            editingRow = row;
            const headerText = $(row).closest('.routine-table').find("th").first().text();
            const match = headerText.match(/Level (\d+) (.+) Routine/);
            if (!match) {
                console.error("Could not parse level and event from header");
                return;
            }
            
            const level = parseInt(match[1]);
            const event = match[2].trim();
            
            showSkillBox();
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
            updateRealTimeScoring(); // Update scoring after deletion
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
            const levelNumber = parseInt(selectedLevel.replace('Level ', ''));
            const event = (selectedEvent === 'PH' && levelNumber <= 5) 
                ? 'Mushroom' 
                : selectedEvent;
            createRoutineTable(selectedLevel, event);
            
            // Use jQuery to ensure the display changes are applied
            $('#routine-tables-container').show();
            $('#add-routine-table-container').hide();
            $('#real-time-scoring').show(); // Show real-time scoring
            
            resetButtonColors();
        }

        // Add skill button
        if (e.target.matches('.add-skill-button')) {
            const routineTable = e.target.closest('.routine-table');
            const header = routineTable.querySelector('th');
            const routineInfo = parseRoutineHeader(header);
            if (!routineInfo) return;

            showSkillBox();
            loadSkillsForEvent(routineInfo.level, routineInfo.event);
        }

        // Close button
        if (e.target.matches('.close-button')) {
            hideSkillBox();
            document.getElementById('large-table-container').style.display = 'none';
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
                updateRealTimeScoring(); // Update scoring after deletion
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
                    `Exercise Presentation: ${data.exercisepresentation.toFixed(2)}\n` +
                    `Element Group Total: ${data.elementgrouptotal.toFixed(2)}\n` +
                    `Difficulty Total: ${data.difficultytotal.toFixed(2)}\n` +
                    `Total Score: ${data.totalscore.toFixed(2)}`
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

            // Reset form and clear any previous validation
            const form = document.getElementById('routineForm');
            form.classList.remove('was-validated');
            form.reset();

            // Set initial values
            document.getElementById('routineLevel').value = `Level ${routineInfo.level}`;
            document.getElementById('routineEvent').value = routineInfo.event;
            
            // Show popup with proper positioning
            const overlay = document.getElementById('popupOverlay');
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            
            // Prevent body scrolling when popup is open
            document.body.style.overflow = 'hidden';
        }

        // Close popup
        if (e.target.matches('#closePopup')) {
            document.getElementById('popupOverlay').style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        // Popup overlay click
        if (e.target.matches('#popupOverlay')) {
            e.target.style.display = 'none';
            document.body.style.overflow = 'auto';
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
                const cells = $(editingRow).find('td');
                cells.eq(0).text(skillData.name);
                cells.eq(1).text(skillData.value);
                cells.eq(2).text(skillData.elementGroup);
                $(editingRow).removeClass('editing-row');   
                editingRow = null;
                updateRealTimeScoring(); // Update scoring after editing
                // Hide the skill box after editing
                hideSkillBox();
                document.getElementById('large-table-container').style.display = 'none';
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

            showSkillBox();
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
            // Clean up UI state
            document.getElementById('popupOverlay').style.display = 'none';
            document.body.style.overflow = 'auto';
            // Reset form
            document.getElementById('routineForm').reset();
        })
        .catch(error => {
            console.error('Error saving routine:', error);
            alert('Failed to save routine.');
            // Clean up UI state even on error
            document.getElementById('popupOverlay').style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });

    // Add drag and drop event listeners to the routine table
    const routineTable = document.querySelector('.routine-table');
    if (routineTable) {
        routineTable.addEventListener('dragover', handleDragOver);
        routineTable.addEventListener('dragleave', handleDragLeave);
        routineTable.addEventListener('drop', handleDrop);
    }
    
    // Make rows draggable after table is created
    makeRowsDraggable();
});

// Add these functions at the top level
function updateRealTimeScoring() {
    // Get the current table rows and setup initial variables
    const rows = $('.routine-table tr.skill-odd-row, tr.skill-even-row');
    let groupScores = {1: null, 2: null, 3: null, 4: null};
    let totalDifficulty = 0;
    let skillBank = new Set();
    let numSuperSkills = 0;
    let numFigSkills = 0;
    
    // Get level from the routine table header
    const headerText = $('.routine-table .header-row th').first().text();
    const levelMatch = headerText.match(/Level (\d+)/);
    if (!levelMatch) return;
    const level = parseInt(levelMatch[1]);

    // Constants (matching Python constants)
    const EXERCISE_PRESENTATION = {
        1: 8.0, 2: 8.0, 3: 8.0, 4: 8.0, 5: 8.0,
        6: 8.0, 7: 8.0, 8: 8.0, 9: 8.0, 10: 7.5
    };

    const SUPERSKILLS_ALLOWED = {
        1: 8, 2: 8, 3: 8, 4: 6, 5: 5,
        6: 4, 7: 3, 8: 2, 9: 1, 10: 0
    };

    const SHORT_ROUTINE = {
        9: 0.0, 8: 0.0, 7: 0.0, 6: 0.0, 5: 3.0,
        4: 4.0, 3: 5.0, 2: 6.0, 1: 7.0, 0: 10.0
    };

    // Add REQUIRED_FIG constant
    const REQUIRED_FIG = {
        1: 0,
        2: 0,
        3: 0,
        4: 1,
        5: 2,
        6: 3,
        7: 4,
        8: 4,
        9: 5,
        10: 6,
    };

    // Process existing skills
    rows.each(function() {
        const cells = $(this).find('td');
        if (cells.length >= 3 && cells.eq(0).text().trim() !== '') {
            const skillName = cells.eq(0).text().trim();
            const difficulty = parseFloat(cells.eq(1).text()) || 0;
            const elementGroup = parseInt(cells.eq(2).text()) || 0;
            
            // Only count unique skills
            if (!skillBank.has(skillName)) {
                if (difficulty === 0.0) {
                    numSuperSkills++;
                } else if (difficulty > 0) {
                    numFigSkills++;
                }
                totalDifficulty += difficulty;
                skillBank.add(skillName);
            }

            // Update element group credit
            if (elementGroup >= 1 && elementGroup <= 4) {
                if (groupScores[elementGroup] === null || 
                    difficulty >= groupScores[elementGroup]) {
                    groupScores[elementGroup] = difficulty;
                }
            }
        }
    });

    // Calculate element group values and total
    let totalElementGroupValue = 0;
    Object.entries(groupScores).forEach(([group, value]) => {
        let displayValue = '0.0';
        
        if (value !== null) {
            switch (level) {
                case 1:
                case 2:
                case 3:
                    displayValue = value >= 0.0 ? '0.5' : '0.0';
                    break;
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    if (value === 0.0) displayValue = '0.3';
                    else if (value >= 0.1) displayValue = '0.5';
                    break;
                case 9:
                    if (value === 0.0) displayValue = '0.3';
                    else if (value === 0.1) {
                        displayValue = group === '1' ? '0.5' : '0.3';
                    }
                    else if (value >= 0.2) displayValue = '0.5';
                    break;
                case 10:
                    if (value === 0.0 || value === 0.1 || value === 0.2) displayValue = '0.3';
                    else if (value >= 0.3) displayValue = '0.5';
                    break;
            }
        }
        
        // Update UI
        $(`#group-${group}-value`).text(displayValue);
        totalElementGroupValue += parseFloat(displayValue);
    });

    // Calculate remaining skills (max 8 skills)
    const maxSkills = 8;
    const totalSkills = skillBank.size;
    const remainingSkills = maxSkills - totalSkills;

    // Calculate remaining super skills based on level allowance
    const allowedSuperSkills = SUPERSKILLS_ALLOWED[level];
    const remainingSuperSkills = Math.max(0, allowedSuperSkills - numSuperSkills);

    // Calculate start value (before deductions)
    const exercisePresentation = EXERCISE_PRESENTATION[level] || 8.0;
    const startValue = exercisePresentation + totalDifficulty + totalElementGroupValue;

    // Calculate FIG skills deduction
    const requiredFigSkills = REQUIRED_FIG[level] || 0;
    const missingFigSkills = Math.max(0, requiredFigSkills - numFigSkills);
    const figSkillsDeduction = missingFigSkills * -0.5;

    // Calculate short routine deduction
    const countedSuperSkills = Math.min(numSuperSkills, SUPERSKILLS_ALLOWED[level]);
    const numCountingSkills = (skillBank.size - numSuperSkills) + countedSuperSkills;
    const shortRoutineDeduction = -(SHORT_ROUTINE[numCountingSkills] || 0); // Make negative since it's a deduction

    // Calculate final score
    const finalScore = startValue + figSkillsDeduction + shortRoutineDeduction;

    // Update UI elements with highlighting
    for (let i = 1; i <= 4; i++) {
        const displayValue = $(`#group-${i}-value`).text();
        highlightRowIfChanged(`group-${i}-value`, displayValue, previousValues.groups[i]);
        previousValues.groups[i] = displayValue;
    }

    const newTotalValue = totalElementGroupValue.toFixed(1);
    highlightRowIfChanged('total-value', newTotalValue, previousValues.totalValue);
    $('#total-value').text(newTotalValue);
    previousValues.totalValue = newTotalValue;

    const newTotalDifficulty = totalDifficulty.toFixed(1);
    highlightRowIfChanged('total-difficulty', newTotalDifficulty, previousValues.totalDifficulty);
    $('#total-difficulty').text(newTotalDifficulty);
    previousValues.totalDifficulty = newTotalDifficulty;

    const newRemainingSkills = remainingSkills.toString();
    highlightRowIfChanged('remaining-skills', newRemainingSkills, previousValues.remainingSkills);
    $('#remaining-skills').text(newRemainingSkills);
    previousValues.remainingSkills = newRemainingSkills;

    const newFigSkills = `${numFigSkills}/${requiredFigSkills}`;
    highlightRowIfChanged('fig-skills-requirement', newFigSkills, previousValues.figSkills);
    $('#fig-skills-requirement').text(newFigSkills);
    previousValues.figSkills = newFigSkills;

    const newRemainingSuperSkills = remainingSuperSkills.toString();
    highlightRowIfChanged('remaining-super-skills', newRemainingSuperSkills, previousValues.remainingSuperSkills);
    $('#remaining-super-skills').text(newRemainingSuperSkills);
    previousValues.remainingSuperSkills = newRemainingSuperSkills;

    const newDifficulty = totalDifficulty.toFixed(1);
    highlightRowIfChanged('difficulty', newDifficulty, previousValues.difficulty);
    $('#difficulty').text(newDifficulty);
    previousValues.difficulty = newDifficulty;

    const newStartScore = startValue.toFixed(1);
    highlightRowIfChanged('start-score', newStartScore, previousValues.startScore);
    $('#start-score').text(newStartScore);
    previousValues.startScore = newStartScore;

    const newFinalScore = finalScore.toFixed(1);
    highlightRowIfChanged('final-score', newFinalScore, previousValues.finalScore);
    $('#final-score').text(newFinalScore);
    previousValues.finalScore = newFinalScore;

    // Optional: Add messages to explain deductions
    const messages = [];
    if (figSkillsDeduction < 0) {
        messages.push(`Missing FIG skills deduction: ${figSkillsDeduction.toFixed(1)}`);
    }
    if (shortRoutineDeduction < 0) {
        messages.push(`Short routine deduction: ${shortRoutineDeduction.toFixed(1)}`);
    }

    // Display deduction messages if you have a container for them
    $('#scoring-messages').html(messages.join('<br>'));
}

// Function to make rows draggable
function makeRowsDraggable() {
    const rows = document.querySelectorAll('.routine-table tr.skill-odd-row, .routine-table tr.skill-even-row');
    
    rows.forEach(row => {
        // Only make rows with content draggable
        if (row.querySelector('td').textContent.trim() !== '') {
            row.setAttribute('draggable', 'true');
            row.classList.add('draggable-row');
            
            // Add drag start event
            row.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', row.rowIndex);
                row.classList.add('dragging');
            });
            
            // Add drag end event
            row.addEventListener('dragend', function() {
                row.classList.remove('dragging');
            });
        }
    });
}

// Function to handle drop events
function handleDrop(e) {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const toRow = e.target.closest('tr');
    if (!toRow || !toRow.classList.contains('skill-odd-row') && !toRow.classList.contains('skill-even-row')) return;
    
    const toIndex = toRow.rowIndex;
    const table = toRow.closest('table');
    
    // Get all skill rows
    const rows = Array.from(table.querySelectorAll('tr.skill-odd-row, tr.skill-even-row'));
    const fromRow = rows[fromIndex - 2]; // Subtract 2 for header rows
    
    // Only proceed if the source row has content
    if (fromRow.querySelector('td').textContent.trim() === '') return;
    
    // Get the content of the row being moved
    const movingContent = Array.from(fromRow.querySelectorAll('td')).map(td => td.textContent);
    
    // Create a temporary array to store the new order
    const newOrder = [];
    
    // First, add all rows before the target position
    for (let i = 0; i < toIndex - 2; i++) {
        if (i !== fromIndex - 2) { // Skip the row being moved
            newOrder.push(Array.from(rows[i].querySelectorAll('td')).map(td => td.textContent));
        }
    }
    
    // Add the moved row at the target position
    newOrder.push(movingContent);
    
    // Then add all remaining rows, skipping the moved row if it's after the target
    for (let i = toIndex - 2; i < rows.length; i++) {
        if (i !== fromIndex - 2) { // Skip the row being moved
            newOrder.push(Array.from(rows[i].querySelectorAll('td')).map(td => td.textContent));
        }
    }
    
    // Update all rows with the new order and restore proper styling
    rows.forEach((row, index) => {
        // Remove any drag-over styling
        row.classList.remove('drag-over');
        
        if (index < newOrder.length) {
            row.querySelectorAll('td').forEach((td, i) => {
                td.textContent = newOrder[index][i];
            });
        } else {
            // Clear any remaining rows
            row.querySelectorAll('td').forEach(td => {
                td.textContent = '';
            });
        }
    });
    
    // Update real-time scoring
    updateRealTimeScoring();
}

// Function to handle drag over events
function handleDragOver(e) {
    e.preventDefault();
    const row = e.target.closest('tr');
    if (row && (row.classList.contains('skill-odd-row') || row.classList.contains('skill-even-row'))) {
        row.classList.add('drag-over');
    }
}

// Function to handle drag leave events
function handleDragLeave(e) {
    const row = e.target.closest('tr');
    if (row) {
        row.classList.remove('drag-over');
    }
}

// Function to show skill box and adjust columns
function showSkillBox() {
    const skillBox = document.getElementById('skill-box');
    const routineTable = document.getElementById('item-1');
    
    skillBox.classList.remove('d-none');
    skillBox.classList.add('show');
    routineTable.classList.add('col-lg-shrink-5');
}

// Function to hide skill box and adjust columns
function hideSkillBox() {
    const skillBox = document.getElementById('skill-box');
    const routineTable = document.getElementById('item-1');
    
    skillBox.classList.add('d-none');
    skillBox.classList.remove('show');
    routineTable.classList.remove('col-lg-shrink-5');
}

// Helper function to highlight a row when its value changes
function highlightRowIfChanged(elementId, newValue, previousValue) {
    if (newValue !== previousValue) {
        const element = document.getElementById(elementId);
        const row = element.closest('tr');
        row.classList.remove('highlight-animation');
        // Force a reflow to restart the animation
        void row.offsetWidth;
        row.classList.add('highlight-animation');
    }
}
