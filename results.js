// Translation dictionary
const translations = {
  en: {
    'nav-home': 'Home',
    'nav-schedule': 'Find Your Bus Schedule',
    'nav-travel-date': 'Bus Fares and Routes',
    'contact-btn': '? Contact Us',
    'route-from': 'From',
    'route-to': 'To',
    'available-buses': 'Available Buses',
    'more-buses': 'More buses...',
    'popular-routes': 'Popular routes',
    'route-mbabane-nhlangano': 'Mbabane to Nhlangano',
    'route-nhlangano-mbabane': 'Nhlangano to Mbabane',
    'daily-departures': 'Daily departures',
    'journey-3h': '3h journey',
    'journey-5h': '2h journey',
    'view-schedule': 'View Details',
    'view-route': 'View Route',
    'bus-details': 'Bus Details',
    'modal-route': 'Route',
    'modal-departs': 'Departs',
    'modal-arrives': 'Arrives',
    'modal-bus-name': 'Bus Name',
    'modal-bus-number': 'Bus Number',
    'modal-fare': 'Fare',
    'lang-english': 'English',
    'lang-siswati': 'Siswati',
    'footer-privacy': 'PRIVACY',
    'footer-terms': 'TERMS',
    'footer-sitemap': 'SITEMAP',
    'no-route': 'No route specified.',
    'no-buses': 'No available buses found.',
    'error-loading': 'Error loading bus data. Please try again later.'
  },
  ss: {
    'nav-home': 'Ekhaya',
    'nav-schedule': 'Tfola Luhlelo Lwemabhasi',
    'nav-travel-date': 'Kubhadalwa Kwemathikithi Nemigwaco',
    'contact-btn': '? Tsintsana Natsi',
    'route-from': 'Kusuka',
    'route-to': 'Kuya',
    'available-buses': 'Emabhasi Latfolakalako',
    'more-buses': 'Lamanye emabhasi...',
    'popular-routes': 'Tindlela Letidzumile',
    'route-mbabane-nhlangano': 'Mbabane kuya eNhlangano',
    'route-nhlangano-mbabane': 'Nhlangano kuya eMbabane',
    'daily-departures': 'Kuhamba Onkhemelanga',
    'journey-3h': 'Luhambo lwema-awa lamatsatfu',
    'journey-5h': 'Luhambo lwema-awa lamabili',
    'view-schedule': 'Buka Imininingwane',
    'view-route': 'Buka Indlela',
    'bus-details': 'Imininingwane Yebhasi',
    'modal-route': 'Indlela',
    'modal-departs': 'Isukanga',
    'modal-arrives': 'Ifikanga',
    'modal-bus-name': 'Ligama Lebhasi',
    'modal-bus-number': 'Inombolo Yebhasi',
    'modal-fare': 'Imali Yekugibela',
    'lang-english': 'SiNgisi',
    'lang-siswati': 'Siswati',
    'footer-privacy': 'KUVIKELEKA',
    'footer-terms': 'IMIGOMO',
    'footer-sitemap': 'IMEPHU YESAYIDI',
    'no-route': 'Ayikho indlela lecacisiwe.',
    'no-buses': 'Kute emabhasi latfolakalako.',
    'error-loading': 'Kwehluleka kulayisha idatha yebhasi. Sicela uphindze wetame ngemuva kwesikhatsi.'
  }
};

// Global variable to store bus data
let busData = [];
// Save the current day (as a string) when the page loads
let initialDate = (new Date()).toDateString();

// Flag to ensure the one-time reset only occurs once
let filteringResetDone = false;

// Get the route from the URL
const urlParams = new URLSearchParams(window.location.search);
const route = urlParams.get("route");

/**
 * Helper function:
 * Parses a time string (e.g., "11:40 PM", "09:15", etc.) and returns an object 
 * with the 24-hour formatted hours and minutes.
 */
function parseTime(timeStr) {
  // Create a Date using a fixed date and the time string.
  // If timeStr includes AM/PM, the Date constructor will adjust accordingly.
  // For example, "11:40 PM" becomes 23:40.
  let date = new Date("1970-01-01 " + timeStr);
  return {
    hours: date.getHours(),
    minutes: date.getMinutes()
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('language') || 'en';
  document.getElementById('language-select').value = savedLang;
  changeLanguage(savedLang);
  displayResults();

  // Start continuous time updates
  updateTimeDate();
  setInterval(updateTimeDate, 1000);

  // Re-filter the bus list every minute during the day
  setInterval(() => {
    console.log("Re-filtering buses every minute...");
    displayResults();
  }, 60000);

  // Create and add a one-time reset button to the page
  const oneTimeResetButton = document.createElement("button");
  oneTimeResetButton.textContent = "Reset Filtering Once";
  oneTimeResetButton.onclick = () => {
    resetFilteringOnce();
    oneTimeResetButton.disabled = true;
  };
  document.body.appendChild(oneTimeResetButton);
});

// Display the search results
async function displayResults() {
  if (!route) {
    document.getElementById("busList").innerHTML =
      `<p data-translate="no-route">${translations[document.getElementById('language-select').value]['no-route']}</p>`;
    return;
  }

  try {
    // Fetch the bus data from the JSON file (or API)
    const response = await fetch("busData.json");
    if (!response.ok) {
      throw new Error("Failed to fetch bus data");
    }
    busData = await response.json();

    // Update route header
    const [from, to] = route.split(" to ");
    document.getElementById("fromLocation").textContent = from ? ` ${from.trim()} ` : " Unknown ";
    document.getElementById("toLocation").textContent = to ? ` ${to.trim()} ` : " Unknown ";

    // Get the current time and date for filtering
    const now = new Date();
    const currentDate = now.toDateString();

    let availableBuses;
    // If we're still on the same day, filter based on departure times
    if (currentDate === initialDate) {
      availableBuses = busData.filter(bus => {
        // Use the helper function to parse the bus departure time.
        const { hours: depHours, minutes: depMinutes } = parseTime(bus.departure);
        return (
          bus.route.toLowerCase() === route.toLowerCase() &&
          bus.available &&
          (now.getHours() < depHours ||
           (now.getHours() === depHours && now.getMinutes() < depMinutes))
        );
      });
    } else {
      // A new day has started; show all available buses (i.e. reset the filtering)
      availableBuses = busData.filter(bus =>
        bus.route.toLowerCase() === route.toLowerCase() && bus.available
      );
    }

    console.log("Filtered available buses:", availableBuses.length);

    // Update available buses in the DOM
    const busList = document.getElementById("busList");
    const busCount = document.getElementById("busCount");
    const moreBuses = document.getElementById("moreBuses");
    const busDropdown = document.getElementById("busDropdown");
    const lang = document.getElementById('language-select').value;

    busCount.textContent = ` (${availableBuses.length})`;
    busList.innerHTML = "";

    if (availableBuses.length === 0) {
      busList.innerHTML = `<p data-translate="no-buses">${translations[lang]['no-buses']}</p>`;
      moreBuses.style.display = "none";
      return;
    }


  // Display up to 2 buses directly
for (let i = 0; i < Math.min(2, availableBuses.length); i++) {
  const busCard = createBusCard(availableBuses[i], lang);
  busList.appendChild(busCard);
}

// If more than 2 buses, show a dropdown
if (availableBuses.length > 2) {
  moreBuses.style.display = "block";
  busDropdown.innerHTML = `<option value="" data-translate="more-buses">${translations[lang]['more-buses']}</option>`;
  
  for (let i = 2; i < availableBuses.length; i++) {
    const bus = availableBuses[i];

    const viaText = bus.via && bus.via.trim() ? ` via ${bus.via}` : ""; 
    const departureText = bus.departure && bus.departure.trim() ? `${translations[lang]['modal-departs']}: ${bus.departure}` : "";

    const option = document.createElement("option");
    option.value = `${bus.route}|${bus.via || ''}|${bus.departure || ''}`;
    option.textContent = `${bus.route}${viaText}${departureText ? ` - ${departureText}` : ""}`;
    
    busDropdown.appendChild(option);
  }
} else {
  moreBuses.style.display = "none";
}

// Create the Reset button globally
const resetButton = document.createElement("button");
resetButton.textContent = "Reset Buses";
resetButton.style.display = "none"; // Initially hidden
resetButton.onclick = function () {
  busList.innerHTML = ""; // Clear all displayed buses

  // Redisplay only the first two buses
  for (let i = 0; i < Math.min(2, availableBuses.length); i++) {
    const busCard = createBusCard(availableBuses[i], lang);
    busList.appendChild(busCard);
  }

  // Restore dropdown options
  busDropdown.innerHTML = `<option value="" data-translate="more-buses">${translations[lang]['more-buses']}</option>`;
  for (let i = 2; i < availableBuses.length; i++) {
    const bus = availableBuses[i];

    const viaText = bus.via && bus.via.trim() ? ` via ${bus.via}` : ""; 
    const departureText = bus.departure && bus.departure.trim() ? `${translations[lang]['modal-departs']}: ${bus.departure}` : ""; 

    const option = document.createElement("option");
    option.value = `${bus.route}|${bus.via || ''}|${bus.departure || ''}`;
    option.textContent = `${bus.route}${viaText}${departureText ? ` - ${departureText}` : ""}`;
    
    busDropdown.appendChild(option);
  }

  moreBuses.style.display = availableBuses.length > 2 ? "block" : "none";
  resetButton.style.display = "none"; // Hide button after reset
};

document.getElementById("busList").parentNode.appendChild(resetButton);

// Modify dropdown event listener to remove & recycle buses
busDropdown.addEventListener("change", function () {
  const selectedValue = this.value;
  if (!selectedValue) return;

  const [route, via, departure] = selectedValue.split("|");
  const selectedBus = busData.find(
    (b) => b.route === route && b.via === via && b.departure === departure && b.available
  );

  if (selectedBus) {
    // Save the currently displayed bus
    const previouslySelectedOption = busList.querySelector(".bus-card:last-child");
    let prevBus = null;

    if (previouslySelectedOption) {
      prevBus = {
        route: previouslySelectedOption.dataset.route,
        via: previouslySelectedOption.dataset.via || "",
        departure: previouslySelectedOption.dataset.departure
      };
    }

    busList.innerHTML = ""; // Clear displayed buses

    // Redisplay the first two buses
    for (let i = 0; i < Math.min(2, availableBuses.length); i++) {
      const busCard = createBusCard(availableBuses[i], lang);
      busList.appendChild(busCard);
    }

    // Add the newly selected bus
    const busCard = createBusCard(selectedBus, lang);
    busCard.dataset.route = route;
    busCard.dataset.via = via;
    busCard.dataset.departure = departure;
    busList.appendChild(busCard);

    // Remove the selected bus from the dropdown
    this.querySelector(`option[value="${selectedValue}"]`).remove();

    // Recycle the previously selected bus into the dropdown
    if (prevBus) {
      const prevOption = document.createElement("option");
      prevOption.value = `${prevBus.route}|${prevBus.via || ''}|${prevBus.departure || ''}`;
      
      const viaText = prevBus.via && prevBus.via.trim() ? ` via ${prevBus.via}` : "";
      const departureText = prevBus.departure && prevBus.departure.trim() ? `${translations[lang]['modal-departs']}: ${prevBus.departure}` : ""; 

      prevOption.textContent = `${prevBus.route}${viaText}${departureText ? ` - ${departureText}` : ""}`;

      busDropdown.appendChild(prevOption);
    }

    resetButton.style.display = "block"; // Show reset button
  }
});

// Call the time update function
updateTimeDate();
setInterval(updateTimeDate, 1000);

   


    updateTimeDate();
    setInterval(updateTimeDate, 1000);
  } catch (error) {
    console.error("Error fetching bus data:", error);
    document.getElementById("busList").innerHTML = `<p data-translate="error-loading">${translations[lang]['error-loading']}</p>`;
  }
}

// "View Details" and the new "View Route" button.
function createBusCard(bus, lang) {
  const busCard = document.createElement("div");
  busCard.classList.add("bus-card");
  busCard.innerHTML = `
    <div>
      <h5>${bus.route}${bus.via ? ` via ${bus.via}` : ""}</h5>
      <p data-translate="modal-departs">${translations[lang]['modal-departs']}: ${bus.departure}</p>
      <p data-translate="modal-arrives">${translations[lang]['modal-arrives']}: ${bus.arrival}</p>
    </div>
    <img src="${bus.image}" alt="Bus">
    <div class="bus-card-buttons">
      <button onclick="viewBusDetails('${bus.route}', '${bus.via || ''}', '${bus.departure}')" data-translate="view-schedule">
        ${translations[lang]['view-schedule']}
      </button>
      <button onclick='viewBusRoute(${JSON.stringify(bus)})' data-translate="view-route">
        ${translations[lang]['view-route'] || "View Route"}
      </button>
    </div>
  `;
  return busCard;
}



// Function to update time and date display continuously
function updateTimeDate() {
  const lang = document.getElementById('language-select').value;
  const locale = lang === 'ss' ? 'ss-ZA' : 'en-US';
  const now = new Date();
  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  document.getElementById("currentTime").textContent = now.toLocaleTimeString(locale, timeOptions);
  document.getElementById("currentDate").textContent = now.toLocaleDateString(locale, dateOptions);

  // Check if the day has changed; if so, update our stored day and refresh the results.
  const currentDate = now.toDateString();
  if (currentDate !== initialDate) {
    initialDate = currentDate;
    console.log("Day changed; re-filtering results.");
    displayResults();
  }
}

// Function to view bus details
function viewBusDetails(route, via, departure) {
  const bus = busData.find(
    (b) =>
      b.route === route &&
      b.via === via &&
      b.departure === departure &&
      b.available
  );
  if (!bus) {
    console.warn("Bus details not found.");
    return;
  }
  document.getElementById("modalRoute").textContent =
    bus.route + (bus.via ? ` via ${bus.via}` : "");
  document.getElementById("modalDeparture").textContent = bus.departure || "N/A";
  document.getElementById("modalArrival").textContent = bus.arrival || "N/A";
  document.getElementById("modalBusName").textContent = bus.busName || "N/A";
  document.getElementById("modalBusNumber").textContent = bus.busNumber || "N/A";
  document.getElementById("modalFare").textContent = bus.fare || "N/A";
  document.getElementById("busDetailsModal").style.display = "block";
}

// Function to close the modal
function closeModal() {
  document.getElementById("busDetailsModal").style.display = "none";
}

// Close the modal when clicking outside of it
window.onclick = function (event) {
  const modal = document.getElementById("busDetailsModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// View schedule from popular routes
function viewSchedule(route) {
  window.location.href = `results.html?route=${encodeURIComponent(route)}`;
}


// Function to change language
function changeLanguage(lang = document.getElementById('language-select').value) {
  localStorage.setItem('language', lang);
  applyTranslations();
  updateTimeDate();
  // Refresh bus list to apply translations
  displayResults();
}

// Function to apply translations
function applyTranslations() {
  const lang = document.getElementById('language-select').value;
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    if (translations[lang][key]) {
      // Handle select options differently
      if (element.tagName === 'OPTION') {
        element.textContent = translations[lang][key];
      } else if (element.tagName === 'BUTTON' || element.tagName === 'A' || element.tagName === 'P' || element.tagName === 'H3' || element.tagName === 'H4' || element.tagName === 'H5' || element.tagName === 'SPAN') {
        // Only update the text content, preserving child elements like spans
        const childSpans = element.querySelectorAll('span:not([data-translate])');
        if (childSpans.length > 0) {
          // For elements with dynamic spans (e.g., fromLocation, toLocation), update only the static part
          element.innerHTML = translations[lang][key] + element.innerHTML.match(/<span[^>]*>.*?<\/span>/g)?.join('') || '';
        } else {
          element.textContent = translations[lang][key];
        }
      }
    }
  });
}













