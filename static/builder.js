// Function to update the total value based on all element group values
function updateTotalValue() {
    // Get all four group values
    const group1Value = parseFloat(document.getElementById('group-1-value').textContent) || 0;
    const group2Value = parseFloat(document.getElementById('group-2-value').textContent) || 0;
    const group3Value = parseFloat(document.getElementById('group-3-value').textContent) || 0;
    const group4Value = parseFloat(document.getElementById('group-4-value').textContent) || 0;
    
    // Calculate total
    const total = group1Value + group2Value + group3Value + group4Value;
    
    // Update the total value in the table
    document.getElementById('total-value').textContent = total.toFixed(1);
}

// Call this function whenever any group value is updated
// For example, if you have an existing function that updates group values, add this at the end:
// existingFunctionThatUpdatesGroupValues() {
//     // ... existing code ...
//     updateTotalValue();
// }

// You might also want to call this when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    updateTotalValue();
});

// If you have event listeners that modify any group values,
// make sure to call updateTotalValue() after those modifications
// ... existing code ... 