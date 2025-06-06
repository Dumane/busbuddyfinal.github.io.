// Sample suggestions for the search input
const suggestions = [
    "Mbabane to Nhlangano",
    "Nhlangano to Mbabane",
    // Add more routes as needed
];

// Show suggestions when the input is focused
function showSuggestions() {
    const suggestionsBox = document.getElementById("suggestions");
    suggestionsBox.style.display = "block";
    filterSuggestions();
}

// Filter suggestions based on input
function filterSuggestions() {
    const input = document.getElementById("locationInput").value.toLowerCase();
    const suggestionsBox = document.getElementById("suggestions");
    suggestionsBox.innerHTML = "";

    // Only filter if input length is at least 3 characters
    if (input.length >= 3) {
        const filteredSuggestions = suggestions.filter((suggestion) =>
            suggestion.toLowerCase().includes(input)
        );

        filteredSuggestions.forEach((suggestion) => {
            const suggestionItem = document.createElement("div");
            suggestionItem.classList.add("suggestion-item");
            suggestionItem.textContent = suggestion;
            suggestionItem.onclick = () => {
                document.getElementById("locationInput").value = suggestion;
                suggestionsBox.style.display = "none";
                redirectToResults(suggestion);
            };
            suggestionsBox.appendChild(suggestionItem);
        });

        if (filteredSuggestions.length === 0) {
            suggestionsBox.style.display = "none";
        }
    } else {
        suggestionsBox.style.display = "none"; // Hide box if input is less than 3 characters
    }
}

// Redirect to results page with the selected route
function redirectToResults(route) {
    window.location.href = `results.html?route=${encodeURIComponent(route)}`;
}

// Handle Enter key to trigger search
document.getElementById("locationInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const route = document.getElementById("locationInput").value;
        if (route) {
            redirectToResults(route);
        }
    }
});

// Placeholder for language change (if needed)
function changeLanguage() {
    const lang = document.getElementById("language-select").value;
    console.log("Language changed to:", lang);
    // Add translation logic here if needed
}



  <script src="script.js"></script>