document.getElementById("view-routines-button").addEventListener("click", function () {
    fetch("/routines/view")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch routines");
            }
            return response.json();
        })
        .then((data) => {
            const routinesContainer = document.getElementById("routines-container");
            routinesContainer.innerHTML = ""; // Clear any existing content

            if (data.routines.length === 0) {
                routinesContainer.innerHTML = "<p>No routines found.</p>";
                return;
            }

            const routinesTable = document.createElement("table");
            routinesTable.className = "table table-striped";
            routinesTable.innerHTML = `
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Level</th>
                        <th>Event</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.routines
                        .map(
                            (routine) => `
                        <tr>
                            <td>${routine.name}</td>
                            <td>${routine.level}</td>
                            <td>${routine.event}</td>
                            <td>${new Date(routine.created_at).toLocaleString()}</td>
                            <td>
                                <button class="btn btn-success edit-routine" data-id="${routine.id}" data-level="${routine.level}" data-event="${routine.event}"">Edit</button>
                                <button class="btn btn-danger delete-routine" data-id="${routine.id}">Delete</button>
                            </td>
                        </tr>
                    `
                        )
                        .join("")}
                </tbody>
            `;

            routinesContainer.appendChild(routinesTable);

            // Add event listeners for the "Edit" button
            document.querySelectorAll(".edit-routine").forEach((button) => {
                button.addEventListener("click", function() {
                    const routineId = this.getAttribute("data-id");
                    const routineLevel = this.getAttribute("data-level");
                    const routineEvent = this.getAttribute("data-event");
                    window.location.href = `/routines/edit/${routineId}?level=${routineLevel}&event=${routineEvent}`;
                });
            });

            // Add event listeners for the "Delete" buttons
            document.querySelectorAll(".delete-routine").forEach((button) => {
                button.addEventListener("click", function () {
                    const routineId = this.getAttribute("data-id");

                    if (confirm("Are you sure you want to delete this routine?")) {
                        fetch(`/routines/delete/${routineId}`, {
                            method: "POST",
                        })
                            .then((response) => {
                                if (!response.ok) {
                                    throw new Error("Failed to delete routine");
                                }
                                alert("Routine deleted!");
                                location.reload(); // Reload the page to reflect changes
                            })
                            .catch((error) => {
                                console.error("Error deleting routine:", error);
                                alert("An error occurred while deleting the routine.");
                            });
                    }
                });
            });
        })
        .catch((error) => {
            console.error("Error fetching routines:", error);
            alert("An error occurred while fetching routines.");
        });
});
